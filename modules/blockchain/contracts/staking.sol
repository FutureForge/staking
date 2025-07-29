// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {StakingToken} from "./Token.sol";

/// @title Staking Contract
/// @notice Allows users to stake tokens (ERC20 and native), earn rewards, and manage positions with dynamic or fixed-term plans.
/// @dev Reward logic is separated for ERC20 tokens and native (e.g. ETH) staking.
contract Staking is ReentrancyGuard, Pausable, Ownable {
    // Constants
    uint256 public constant BPS_DENOM = 10_000;

    // Staking plans
    enum Plan {
        DYNAMIC,
        FIXED
    }

    // Position data
    struct Position {
        uint128 amount;
        uint40 unlockTime;
        uint16 multiplierBps;
        uint32 duration; // staking duration in seconds
        bool active;
        Plan plan;
        bool isNative; // distinguishes native vs ERC20 staking position
    }

    // User reward tracking
    struct UserInfo {
        uint128 weight; // Sum of weighted stakes
        uint128 rewardDebt; // Tracks rewards already accounted for
    }

    // ERC20 staking variables
    IERC20 public TOKEN;
    StakingToken public immutable STOKEN; // staked token for ERC20 positions

    uint128 public accRewardPerWeight; // global accumulator (scaled by 1e18)
    uint40 public lastRewardTime;
    uint40 public epochEnd;
    uint128 public rewardPerEpoch; // reward amount per epoch
    uint128 public totalWeight; // total weight for ERC20 stakes
    uint256 public totalStaked; // sum of staked ERC20 tokens

    // Native staking variables
    StakingToken public immutable SNATIVE; // staked token for native positions
    uint128 public accNativeRewardPerWeight; // native reward accumulator (scaled by 1e18)
    uint40 public lastNativeRewardTime;
    uint128 public nativeRewardPerEpoch; // native reward amount per epoch
    uint128 public totalNativeWeight; // total weight for native stakes
    uint256 public totalNativeStaked; // sum of staked native funds

    // Separate user info for native staking
    mapping(address => UserInfo) public nativeUserInfo;

    // Recycle fee parameters and accrued fees
    uint256 public recycleBps = 2_000; // recycle basis points
    uint256 public accuredFees; // accumulated fees from unstaking

    // Fee parameters for unstaking
    uint256 public FEE_DYNAMIC = 500;
    uint256 public FEE_FIXED = 200;
    uint256 public FEE_FIXED_EARLY = 500;
    uint256 public EPOCH_LENGTH = 1 days;

    // Position id trackers
    uint256 private _currentId = 1;
    uint256 private _nativeId = 1;
    uint256 public nativePositionIds; // highest native position id issued

    // Mappings for positions and tracking owner addresses
    mapping(uint256 => Position) public positions; // ERC20 staking positions
    mapping(address => uint256[]) private _userPosition;
    mapping(uint256 => address) public positionOwner;

    mapping(uint256 => Position) public nativePositions; // native staking positions
    mapping(address => uint256[]) private _userNativePositions;
    mapping(uint256 => address) public nativePositionOwner;

    // Mapping for fixed plan fee by duration (in seconds)
    mapping(uint256 => uint256) public fixedFeeByDuration;

    // User reward info for ERC20 staking
    mapping(address => UserInfo) public userInfo;

    // Errors for clearer reverts
    error ZeroAmount();
    error NotOwner();
    error InactivePosition();
    error InvalidID();
    error InsufficientBalance();
    error NullAddress();
    error TransferFailed();
    error WeightOverload();
    error MismatchedLength();
    error FeeTooHigh();
    error InvalidDuration();
    error InvalidEpochLength();
    error FeeTooLow();

    // Events
    event Staked(
        address indexed user,
        uint256 indexed id,
        uint256 amount,
        Plan plan,
        uint16 multiplierBps,
        uint256 unlockTime
    );
    event Unstaked(
        address indexed user,
        uint256 indexed id,
        uint256 returnedAmount,
        uint256 fee
    );
    event RewardClaimed(address indexed user, uint256 amount);
    event FeesCollected(address to, uint256 amount);
    event EpochFunded(uint256 reward, uint256 epochEnd);
    event Paused(bool status);
    event RecycleBpsChanged(uint256 newBps);
    event FixedFeesUpdated(uint256[] durations, uint256[] feeBps);
    event DynamicFeeUpdated(uint256 fee);
    event EpochLengthUpdated(uint256 newLength);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed id,
        uint256 amount
    );

    /// @notice Constructor to initialize the staking contract.
    /// @param _tokenAddress Address of the ERC20 token to stake.
    /// @param _name Name of the ERC20 staking token.
    /// @param _symbol Symbol of the ERC20 staking token.
    constructor(
        address _tokenAddress,
        string memory _name,
        string memory _symbol
    ) Ownable(msg.sender) {
        if (_tokenAddress == address(0)) revert NullAddress();
        TOKEN = IERC20(_tokenAddress);
        STOKEN = new StakingToken(_name, _symbol);
        SNATIVE = new StakingToken("Staked XFI", "SXFI");

        // Transfer ownership of staked tokens to this contract
        STOKEN.transferOwnership(address(this));
        SNATIVE.transferOwnership(address(this));

        uint40 nowTs = uint40(block.timestamp);
        lastRewardTime = nowTs;
        lastNativeRewardTime = nowTs;
        epochEnd = nowTs;
        nativePositionIds = 0;

        // Initialize fixed fee tiers (duration in seconds mapped to fee bps)
        fixedFeeByDuration[30 days] = 300;
        fixedFeeByDuration[90 days] = 200;
        fixedFeeByDuration[180 days] = 100;
        fixedFeeByDuration[365 days] = 50;
    }

    /// @notice Returns the multiplier in basis points based on a given staking duration.
    /// @param _duration Duration of the stake in seconds.
    /// @return Multiplier in basis points.
    function _multiplierBps(uint256 _duration) internal pure returns (uint16) {
        if (_duration == 0) return 10_000; // dynamic plan: no extra multiplier
        if (_duration < 30 days) return 11_000;
        if (_duration < 90 days) return 12_000;
        if (_duration < 180 days) return 15_000;
        return 20_000;
    }

    /// @dev Modifier to update the ERC20 reward global accumulator.
    modifier updateGlobal() {
        uint256 nowTime = block.timestamp;
        // If the epoch has ended, roll forward as many epochs as necessary.
        if (nowTime >= epochEnd && rewardPerEpoch != 0) {
            uint256 missedEpochs = (nowTime - epochEnd) / EPOCH_LENGTH + 1;
            epochEnd += uint40(missedEpochs * EPOCH_LENGTH);
        }
        uint256 dt = nowTime - lastRewardTime;
        if (dt != 0 && totalWeight != 0 && rewardPerEpoch != 0) {
            uint256 rate = uint256(rewardPerEpoch) / EPOCH_LENGTH;
            // Scale by 1e18 for precision
            uint256 rewardAcc = dt * rate * 1e18;
            accRewardPerWeight += uint128(
                (rewardAcc + totalWeight - 1) / totalWeight
            );
        }
        lastRewardTime = uint40(nowTime);
        _;
    }

    /// @dev Modifier to update the native reward global accumulator.
    modifier updateGlobalNative() {
        uint256 nowTime = block.timestamp;
        if (nowTime >= epochEnd && nativeRewardPerEpoch != 0) {
            uint256 missedEpochs = (nowTime - epochEnd) / EPOCH_LENGTH + 1;
            epochEnd += uint40(missedEpochs * EPOCH_LENGTH);
        }
        uint256 dt = nowTime - lastNativeRewardTime;
        if (dt != 0 && totalNativeWeight != 0 && nativeRewardPerEpoch != 0) {
            uint256 rate = uint256(nativeRewardPerEpoch) / EPOCH_LENGTH;
            uint256 rewardAcc = dt * rate * 1e18;
            accNativeRewardPerWeight += uint128(
                (rewardAcc + totalNativeWeight - 1) / totalNativeWeight
            );
        }
        lastNativeRewardTime = uint40(nowTime);
        _;
    }

    /// @dev Modifier to harvest pending ERC20 rewards before state changes.
    modifier harvest(address _usr) {
        UserInfo storage ui = userInfo[_usr];
        uint256 pending = (uint256(ui.weight) * accRewardPerWeight) / 1e18;
        if (pending > ui.rewardDebt) {
            uint256 claimAmt = pending - ui.rewardDebt;
            if (claimAmt != 0) {
                if (!TOKEN.transfer(_usr, claimAmt)) revert TransferFailed();
                emit RewardClaimed(_usr, claimAmt);
            }
        }
        _;
        ui.rewardDebt = uint128(
            (uint256(ui.weight) * accRewardPerWeight) / 1e18
        );
    }

    /// @dev Modifier to harvest pending native rewards before state changes.
    modifier harvestNative(address _usr) {
        UserInfo storage ui = nativeUserInfo[_usr];
        uint256 pending = (uint256(ui.weight) * accNativeRewardPerWeight) /
            1e18;
        if (pending > ui.rewardDebt) {
            uint256 claimAmt = pending - ui.rewardDebt;
            if (claimAmt != 0) {
                if (address(this).balance < claimAmt)
                    revert InsufficientBalance();
                (bool sent, ) = payable(_usr).call{value: claimAmt}("");
                if (!sent) revert TransferFailed();
                emit RewardClaimed(_usr, claimAmt);
            }
        }
        _;
        ui.rewardDebt = uint128(
            (uint256(ui.weight) * accNativeRewardPerWeight) / 1e18
        );
    }

    /// @notice Stake ERC20 tokens with a specified duration.
    /// @param _amount Amount of tokens to stake.
    /// @param _duration Duration of staking in seconds (0 for dynamic plan).
    function stake(
        uint256 _amount,
        uint256 _duration
    ) external nonReentrant whenNotPaused updateGlobal harvest(msg.sender) {
        if (_amount == 0) revert ZeroAmount();
        // For fixed plan, ensure a valid duration fee exists.
        if (_duration != 0 && fixedFeeByDuration[_duration] == 0)
            revert InvalidDuration();
        uint16 mult = _multiplierBps(_duration);
        // Sanity-check multiplication
        if ((_amount * mult) / _amount != mult) revert WeightOverload();
        uint256 weight = (_amount * mult) / BPS_DENOM;
        if (weight > type(uint128).max) revert WeightOverload();

        // Transfer tokens and mint staked token
        if (!TOKEN.transferFrom(msg.sender, address(this), _amount))
            revert TransferFailed();
        STOKEN.mint(msg.sender, _amount);

        uint256 id = _currentId++;
        uint40 unlock = _duration == 0
            ? 0
            : uint40(block.timestamp + _duration);
        positions[id] = Position({
            amount: uint128(_amount),
            unlockTime: unlock,
            multiplierBps: mult,
            duration: uint32(_duration),
            active: true,
            plan: _duration == 0 ? Plan.DYNAMIC : Plan.FIXED,
            isNative: false
        });
        _userPosition[msg.sender].push(id);
        positionOwner[id] = msg.sender;

        totalWeight += uint128(weight);
        userInfo[msg.sender].weight += uint128(weight);
        totalStaked += _amount;

        emit Staked(
            msg.sender,
            id,
            _amount,
            _duration == 0 ? Plan.DYNAMIC : Plan.FIXED,
            mult,
            unlock
        );
    }

    /// @notice Unstake ERC20 tokens from a given position.
    /// @param _id Position ID to unstake.
    function unstake(
        uint256 _id
    ) external nonReentrant whenNotPaused updateGlobal harvest(msg.sender) {
        Position storage position = positions[_id];
        if (positionOwner[_id] != msg.sender) revert NotOwner();
        if (!position.active) revert InactivePosition();
        if (TOKEN.balanceOf(address(this)) < position.amount)
            revert InsufficientBalance();

        uint256 feeBps;
        // Determine fee based on plan and lock status
        if (position.plan == Plan.DYNAMIC) {
            feeBps = FEE_DYNAMIC;
        } else {
            feeBps = block.timestamp < position.unlockTime
                ? FEE_DYNAMIC
                : fixedFeeByDuration[position.duration];
            if (feeBps == 0) feeBps = FEE_FIXED;
        }
        uint256 fee = (position.amount * feeBps) / BPS_DENOM;
        uint256 out = position.amount - fee;
        uint256 weight = (uint256(position.amount) * position.multiplierBps) /
            BPS_DENOM;
        totalWeight -= uint128(weight);
        userInfo[msg.sender].weight -= uint128(weight);
        position.active = false;

        // Remove from user's ERC20 positions array
        _removePositionId(_userPosition[msg.sender], _id);
        delete positionOwner[_id];
        delete positions[_id];

        STOKEN.burnByOwner(msg.sender, position.amount);
        uint256 recycle = (fee * recycleBps) / BPS_DENOM;
        accuredFees += fee - recycle;
        _fundEpochFromFee(recycle);

        if (!TOKEN.transfer(msg.sender, out)) revert TransferFailed();
        totalStaked -= position.amount;
        emit Unstaked(msg.sender, _id, out, fee);
    }

    /// @notice Stake native token funds.
    /// @param _duration Duration of staking in seconds (0 for dynamic plan).
    function stakeNative(
        uint256 _duration
    )
        external
        payable
        nonReentrant
        whenNotPaused
        updateGlobalNative
        harvestNative(msg.sender)
    {
        uint256 amount = msg.value;
        if (amount == 0) revert ZeroAmount();
        if (_duration != 0 && fixedFeeByDuration[_duration] == 0)
            revert InvalidDuration();
        uint16 mult = _multiplierBps(_duration);
        if ((amount * mult) / amount != mult) revert WeightOverload();
        uint256 weight = (amount * mult) / BPS_DENOM;
        if (weight > type(uint128).max) revert WeightOverload();

        SNATIVE.mint(msg.sender, amount);

        uint256 id = _nativeId++;
        // Update the highest native position id tracker
        nativePositionIds = _nativeId - 1;
        uint40 unlock = _duration == 0
            ? 0
            : uint40(block.timestamp + _duration);
        nativePositions[id] = Position({
            amount: uint128(amount),
            unlockTime: unlock,
            multiplierBps: mult,
            duration: uint32(_duration),
            active: true,
            plan: _duration == 0 ? Plan.DYNAMIC : Plan.FIXED,
            isNative: true
        });
        _userNativePositions[msg.sender].push(id);
        nativePositionOwner[id] = msg.sender;

        totalNativeWeight += uint128(weight);
        // Use separate native reward tracking for native staking.
        nativeUserInfo[msg.sender].weight += uint128(weight);
        totalNativeStaked += amount;

        emit Staked(
            msg.sender,
            id,
            amount,
            _duration == 0 ? Plan.DYNAMIC : Plan.FIXED,
            mult,
            unlock
        );
    }

    /// @notice Unstake native tokens from a given position.
    /// @param _id Native staking position ID.
    function unstakeNative(
        uint256 _id
    )
        external
        nonReentrant
        whenNotPaused
        updateGlobalNative
        harvestNative(msg.sender)
    {
        Position storage position = nativePositions[_id];
        if (nativePositionOwner[_id] != msg.sender) revert NotOwner();
        if (!position.active) revert InactivePosition();

        uint256 feeBps;
        if (
            position.plan == Plan.DYNAMIC ||
            block.timestamp < position.unlockTime
        ) {
            feeBps = FEE_DYNAMIC;
        } else {
            feeBps = fixedFeeByDuration[position.duration];
            if (feeBps == 0) feeBps = FEE_FIXED;
        }
        uint256 fee = (position.amount * feeBps) / BPS_DENOM;
        uint256 out = position.amount - fee;
        uint256 weight = (uint256(position.amount) * position.multiplierBps) /
            BPS_DENOM;

        totalNativeWeight -= uint128(weight);
        nativeUserInfo[msg.sender].weight -= uint128(weight);
        totalNativeStaked -= position.amount;
        position.active = false;

        _removePositionId(_userNativePositions[msg.sender], _id);
        delete nativePositionOwner[_id];
        delete nativePositions[_id];

        SNATIVE.burnByOwner(msg.sender, position.amount);

        uint256 recycle = (fee * recycleBps) / BPS_DENOM;
        accuredFees += fee - recycle;
        _fundEpochFromNativeFee(recycle);

        (bool sent, ) = payable(msg.sender).call{value: out}("");
        if (!sent) revert TransferFailed();

        emit Unstaked(msg.sender, _id, out, fee);
    }

    /// @notice Emergency withdraw for ERC20 stakes when contract is paused.
    /// @param _id Position ID to emergency withdraw.
    function emergencyWithdraw(uint256 _id) external nonReentrant whenPaused {
        Position storage position = positions[_id];
        if (positionOwner[_id] != msg.sender) revert NotOwner();
        if (!position.active) revert InactivePosition();
        if (TOKEN.balanceOf(address(this)) < position.amount)
            revert InsufficientBalance();

        uint256 amount = position.amount;
        uint256 weight = (uint256(position.amount) * position.multiplierBps) /
            BPS_DENOM;
        totalWeight -= uint128(weight);
        userInfo[msg.sender].weight -= uint128(weight);
        position.active = false;

        _removePositionId(_userPosition[msg.sender], _id);
        delete positionOwner[_id];
        delete positions[_id];

        if (!TOKEN.transfer(msg.sender, amount)) revert TransferFailed();
        STOKEN.burnByOwner(msg.sender, amount);
        totalStaked -= amount;
        emit EmergencyWithdraw(msg.sender, _id, amount);
    }

    /// @notice Claim pending ERC20 rewards.
    function claim()
        external
        nonReentrant
        updateGlobal
        whenNotPaused
        harvest(msg.sender)
    {
        // All logic is in the modifier.
    }

    /// @notice Get pending ERC20 rewards for a given user.
    /// @param _user Address of the user.
    /// @return pending Reward amount pending.
    function pendingRewards(
        address _user
    ) external view returns (uint256 pending) {
        UserInfo storage ui = userInfo[_user];
        uint256 _accRewardPerWeight = accRewardPerWeight;
        uint256 supply = totalWeight;
        if (
            block.timestamp > lastRewardTime &&
            supply != 0 &&
            rewardPerEpoch != 0
        ) {
            uint256 dt = block.timestamp - lastRewardTime;
            uint256 rate = uint256(rewardPerEpoch) / EPOCH_LENGTH;
            _accRewardPerWeight += (dt * rate * 1e18) / supply;
        }
        pending = (uint256(ui.weight) * _accRewardPerWeight) / 1e18;
        if (pending > ui.rewardDebt) pending = pending - ui.rewardDebt;
        else pending = 0;
    }

    /// @notice Get pending native rewards for a given native staking position.
    /// @param positionId Native staking position ID.
    /// @return pending Native pending reward amount.
    function claimableNativeRewards(
        uint256 positionId
    ) external view returns (uint256 pending) {
        address owner = nativePositionOwner[positionId];
        if (owner == address(0)) revert InvalidID();
        Position memory pos = nativePositions[positionId];
        if (!pos.active) return 0;

        uint256 _acc = accNativeRewardPerWeight;
        uint256 supply = totalNativeWeight;
        if (
            block.timestamp > lastNativeRewardTime &&
            supply != 0 &&
            nativeRewardPerEpoch != 0
        ) {
            uint256 dt = block.timestamp - lastNativeRewardTime;
            uint256 rate = uint256(nativeRewardPerEpoch) / EPOCH_LENGTH;
            _acc += (dt * rate * 1e18) / supply;
        }
        uint256 weight = (uint256(pos.amount) * pos.multiplierBps) / BPS_DENOM;
        // Calculate pending based on native user's rewardDebt.
        pending = (weight * _acc) / 1e18;
        UserInfo storage ui = nativeUserInfo[owner];
        if (pending > ui.rewardDebt) pending = pending - ui.rewardDebt;
        else pending = 0;
    }

    /// @notice Claim all pending native rewards for the caller.
    function claimAllNative() external nonReentrant {
        address user = msg.sender;
        uint256 totalPending;

        // Update native accumulator globally.
        if (
            block.timestamp > lastNativeRewardTime &&
            totalNativeWeight != 0 &&
            nativeRewardPerEpoch != 0
        ) {
            uint256 dt = block.timestamp - lastNativeRewardTime;
            uint256 rate = uint256(nativeRewardPerEpoch) / EPOCH_LENGTH;
            accNativeRewardPerWeight += uint128(
                (dt * rate * 1e18) / totalNativeWeight
            );
            lastNativeRewardTime = uint40(block.timestamp);
        }
        UserInfo storage ui = nativeUserInfo[user];
        uint256 updatedAcc = accNativeRewardPerWeight;
        totalPending = (uint256(ui.weight) * updatedAcc) / 1e18;
        if (totalPending > ui.rewardDebt) {
            totalPending = totalPending - ui.rewardDebt;
        } else {
            totalPending = 0;
        }
        ui.rewardDebt = uint128((uint256(ui.weight) * updatedAcc) / 1e18);

        if (totalPending > 0) {
            (bool sent, ) = payable(user).call{value: totalPending}("");
            if (!sent) revert TransferFailed();
            emit RewardClaimed(user, totalPending);
        }
    }

    /// @notice Returns an array of ERC20 position IDs for a user.
    function userPositions(
        address _user
    ) external view returns (uint256[] memory) {
        return _userPosition[_user];
    }

    /// @notice Returns an array of native staking position IDs for a user.
    function userNativePositions(
        address _user
    ) external view returns (uint256[] memory) {
        return _userNativePositions[_user];
    }

    /// @notice Set the funding for the current ERC20 epoch.
    /// @param _reward Reward amount for the current epoch.
    function fundEpoch(
        uint256 _reward
    ) external nonReentrant onlyOwner updateGlobal {
        if (_reward == 0) revert ZeroAmount();
        if (!TOKEN.transferFrom(msg.sender, address(this), _reward))
            revert TransferFailed();
        rewardPerEpoch = uint128(_reward);
        if (block.timestamp >= epochEnd) {
            epochEnd = uint40(block.timestamp + EPOCH_LENGTH);
        }
        emit EpochFunded(_reward, epochEnd);
    }

    /// @notice Collects accumulated fees.
    /// @param _to Recipient address.
    /// @param _amount Fee amount to collect.
    function collectFees(address _to, uint256 _amount) external onlyOwner {
        if (_to == address(0)) revert NullAddress();
        if (_amount > accuredFees) _amount = accuredFees;
        if (TOKEN.balanceOf(address(this)) < _amount)
            revert InsufficientBalance();
        accuredFees -= _amount;
        if (!TOKEN.transfer(_to, _amount)) revert TransferFailed();
        emit FeesCollected(_to, _amount);
    }

    /// @notice Set fixed fees for specified durations.
    /// @param _durations Array of durations in seconds.
    /// @param _feeBps Array of fee basis points corresponding to durations.
    function setFixedFees(
        uint256[] calldata _durations,
        uint256[] calldata _feeBps
    ) external onlyOwner {
        if (_durations.length != _feeBps.length) revert MismatchedLength();
        for (uint256 i = 0; i < _durations.length; i++) {
            if (_feeBps[i] > 1000) revert FeeTooHigh();
            if (_durations[i] < 1 days || _durations[i] > 365 days)
                revert InvalidDuration();
            if (_feeBps[i] < 50) revert FeeTooLow();
            fixedFeeByDuration[_durations[i]] = _feeBps[i];
        }
        emit FixedFeesUpdated(_durations, _feeBps);
    }

    /// @notice Set the dynamic unstaking fee.
    /// @param _fee New fee in basis points.
    function setDynamicFee(uint256 _fee) external onlyOwner {
        if (_fee > 1500) revert FeeTooHigh();
        FEE_DYNAMIC = _fee;
        emit DynamicFeeUpdated(_fee);
    }

    /// @notice Set the recycle fee basis points.
    /// @param _bps New recycle BPS.
    function setRecycleBps(uint256 _bps) external onlyOwner {
        if (_bps > 3_000) revert FeeTooHigh();
        recycleBps = _bps;
        emit RecycleBpsChanged(_bps);
    }

    /// @notice Set the epoch length.
    /// @param _length New epoch length in seconds.
    function setEpochLength(uint256 _length) external onlyOwner {
        if (_length < 1 hours || _length > 30 days) revert InvalidEpochLength();
        EPOCH_LENGTH = _length;
        emit EpochLengthUpdated(_length);
    }

    /// @notice Updates the ERC20 TOKEN address.
    /// @param _newToken New token address.
    function setToken(address _newToken) external onlyOwner {
        if (_newToken == address(0)) revert NullAddress();
        TOKEN = IERC20(_newToken);
    }

    /// @notice Pause the contract.
    function pause() external onlyOwner {
        _pause();
        emit Paused(true);
    }

    /// @notice Unpause the contract.
    function unpause() external onlyOwner {
        _unpause();
        emit Paused(false);
    }

    // ─── INTERNAL FUNCTIONS ─────────────────────────────────────────────

    /// @dev Internal function to remove a position id from an array.
    /// @param arr The array from which to remove the id.
    /// @param id The position id to remove.
    function _removePositionId(uint256[] storage arr, uint256 id) internal {
        uint256 len = arr.length;
        for (uint256 i = 0; i < len; i++) {
            if (arr[i] == id) {
                arr[i] = arr[len - 1];
                arr.pop();
                break;
            }
        }
    }

    /// @dev Internal function to fund the ERC20 epoch from collected fee.
    /// @param amount Fee amount to add to epoch funds.
    function _fundEpochFromFee(uint256 amount) internal {
        rewardPerEpoch += uint128(amount);
        if (block.timestamp >= epochEnd) {
            epochEnd = uint40(block.timestamp + EPOCH_LENGTH);
        }
        emit EpochFunded(amount, epochEnd);
    }

    /// @dev Internal function to fund the native epoch from collected fee.
    /// @param amount Fee amount to add to native epoch funds.
    function _fundEpochFromNativeFee(uint256 amount) internal {
        nativeRewardPerEpoch += uint128(amount);
        if (block.timestamp >= epochEnd) {
            epochEnd = uint40(block.timestamp + EPOCH_LENGTH);
        }
        emit EpochFunded(amount, epochEnd);
    }
}
