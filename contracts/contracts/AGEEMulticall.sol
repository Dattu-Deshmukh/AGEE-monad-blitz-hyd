// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AGEEMulticall
 * @dev Batch transaction executor for the Anti-Gravity Execution Engine.
 * Optimized for Monad's parallel EVM execution by touching different state slots.
 */
contract AGEEMulticall {
    event BatchExecuted(address indexed executor, uint256 totalValue, uint256 transferCount);

    /**
     * @dev Executes multiple native token transfers in a single call.
     * @param recipients Array of recipient addresses.
     * @param amounts Array of amounts to transfer (must match recipients length).
     */
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external payable {
        require(recipients.length == amounts.length, "Mismatched arrays");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        require(msg.value >= totalAmount, "Insufficient value provided");

        for (uint256 i = 0; i < recipients.length; i++) {
            // Because we are sending to potentially different addresses, 
            // Monad can process these parallelly.
            (bool success, ) = recipients[i].call{value: amounts[i]}("");
            require(success, "Transfer failed");
        }

        emit BatchExecuted(msg.sender, totalAmount, recipients.length);
        
        // Refund excess native tokens
        if (msg.value > totalAmount) {
            (bool success, ) = msg.sender.call{value: msg.value - totalAmount}("");
            require(success, "Refund failed");
        }
    }
}
