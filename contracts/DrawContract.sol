// SPDX-License-Identifier: MIT
// contracts/DrawContract.sol
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DrawContract is ERC721URIStorage {
    mapping(address => uint256) public draws;
    uint256 public tokenCounter;
    address public contractDeployer;
    event Drawn(address indexed sender, uint256 amount);

    constructor() ERC721("DrawToken", "DTKN") {
        tokenCounter = 0;
        contractDeployer = msg.sender;
    }

    function draw() external {
        draws[msg.sender] += 1;
        emit Drawn(msg.sender, draws[msg.sender]);
    }

    function getDrawCount(address user) external view returns (uint256) {
        return draws[user];
    }

    function mintNFT(address recipient, string memory newTokenURI) external {
        require(msg.sender == contractDeployer, "Only contract deployer can mint");
        require(recipient != address(0), "Invalid recipient");
        require(bytes(newTokenURI).length > 0, "Invalid URI");
        uint256 newTokenId = tokenCounter;
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, newTokenURI);
        tokenCounter = tokenCounter + 1;
    }
}
