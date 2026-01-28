// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Billboard {
    string public message = "Monad is fast. Buy this spot!";
    uint256 public price = 0.1 ether;
    address public owner;
    address public dev;

    event NewMessage(string msg, address user, uint256 newPrice);

    constructor() {
        owner = msg.sender;
        dev = msg.sender;
    }

    function buySpot(string memory _msg) external payable {
        // 1. CHECKS: Verify the math first
        // Use separate calculation to avoid precision loss issues
        uint256 minPrice = (price * 110) / 100; 
        require(msg.value >= minPrice, "Price too low! Must pay 10% more.");

        // 2. EFFECTS: Update state variables BEFORE sending money (Prevents Reentrancy)
        address previousOwner = owner;
        owner = msg.sender;
        price = msg.value;
        message = _msg;

        emit NewMessage(_msg, msg.sender, price);

        // 3. INTERACTIONS: Handle the money safely
        // Calculate exact amounts
        uint256 devFee = (msg.value * 5) / 100;
        uint256 payout = msg.value - devFee;

        // Pay the Dev (You)
        // Using 'call' is safer than 'transfer' for gas optimization
        (bool successDev, ) = payable(dev).call{value: devFee}("");
        require(successDev, "Dev payment failed");

        // Pay the Previous Owner
        (bool successOwner, ) = payable(previousOwner).call{value: payout}("");
        require(successOwner, "Owner payout failed");
    }
}