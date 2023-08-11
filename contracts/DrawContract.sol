// SPDX-License-Identifier: MIT
// contracts/DrawContract.sol
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DrawContract is ERC721URIStorage {
    mapping(address => uint256) public draws;
    uint256 public tokenCounter;
    address public contractDeployer;

    constructor() ERC721("DrawToken", "DTKN") {
        tokenCounter = 0;
        contractDeployer = msg.sender;
    }

    function draw() external {
        draws[msg.sender] += 1;
    }

    function getDrawCount(address user) external view returns (uint256) {
        return draws[user];
    }

    function mintNFT(address recipient, string memory tokenURI) external returns (uint256) {
        require(msg.sender == contractDeployer, "Only contract deployer can mint");
        require(recipient != address(0), "Invalid recipient");
        require(bytes(tokenURI).length > 0, "Invalid URI");
        uint256 newTokenId = tokenCounter;
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        tokenCounter = tokenCounter + 1;
        return newTokenId;
    }
}
