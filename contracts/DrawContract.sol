// SPDX-License-Identifier: MIT
// contracts/DrawContract.sol
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DrawContract is ERC721URIStorage {
    mapping(address => uint256) public draws;
    uint256 public tokenCounter;

    constructor() ERC721("DrawToken", "DTKN") {
        tokenCounter = 0;
    }

    function draw() public payable{
        draws[msg.sender] += 1;
    }

    function getDrawCount(address user) public view returns (uint256) {
        return draws[user];
    }

    function mintNFT(address recipient, string memory tokenURI) public returns (uint256) {
        uint256 newTokenId = tokenCounter;
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        tokenCounter = tokenCounter + 1;
        return newTokenId;
    }
}