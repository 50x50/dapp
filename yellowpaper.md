# Yellowpaper for DrawContract

## Introduction

This document provides the technical specifications for the DrawContract, a smart contract developed for EVM blockchains. The contract is written in Solidity and uses the ERC721 standard for non-fungible tokens.

## Contract Overview

The DrawContract allows users to draw on a 50x50 pixel canvas. The state of the canvas is stored on-chain and can be updated by users. A snapshot of the canvas can be taken and minted as an NFT. The NFT is awarded to the user who painted the most pixels during that period.

## Contract Details

### State Variables

- `draws`: A mapping that tracks the number of draws made by each address.
- `tokenCounter`: A counter for the token IDs of the minted NFTs.
- `contractDeployer`: The address of the contract deployer.

### Functions

- `draw()`: Increments the draw count of the message sender.
- `getDrawCount(address user)`: Returns the draw count of a specific user.
- `mintNFT(address recipient, string memory newTokenURI)`: Mints a new NFT and assigns it to the recipient. The token URI is set to `newTokenURI`. Only the contract deployer can call this function.

## Security Considerations

The contract includes checks to prevent unauthorized minting of NFTs. Only the contract deployer can mint new NFTs. Additionally, the contract checks that the recipient address is not the zero address and that the token URI is not empty.

## Future Work

Future updates to the contract may include additional features such as:

- **Teams Mode**: This feature will allow users to create teams and invite other users to join. Each team will have a shared draw score. After each snapshot, the NFT will be awarded to the leader of the team with the highest draw score. This feature will add a collaborative aspect to the drawing process and introduce a new strategy for winning the NFT.

- **On-Chain Snapshot Process**: In the future, the snapshot process could be moved on-chain to increase transparency and make the contract more decentralized. This would involve storing the state of the canvas on-chain and implementing the snapshot logic in the contract.

- **On-Chain Painting Object**: The painting object could be moved on-chain. This would allow users to view the state of the canvas directly on the blockchain and would further emphasize the focus on web3.

These updates will be implemented with careful consideration for the increased gas costs that could result from storing more data on-chain.
