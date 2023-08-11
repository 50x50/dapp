const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");


describe("DrawContract", function () {
  async function deployDrawContractFixture() {
    const DrawContract = await ethers.getContractFactory("DrawContract");
    const drawContract = await DrawContract.deploy();
    const [owner] = await ethers.getSigners();
    return { drawContract, owner };
  }

  describe("mintNFT", function () {
    it("Should mint a new NFT", async function () {
      const { drawContract, owner } = await loadFixture(deployDrawContractFixture);
      const initialTokenCount = await drawContract.tokenCounter();
      await drawContract.mintNFT(owner.address, "https://50x50.io/tokenURI");
      expect(await drawContract.tokenCounter()).to.equal(initialTokenCount + BigInt(1));
    });
  });
  
  describe("draw", function () {
    it("Should increment the draw count", async function () {
      const { drawContract, owner } = await loadFixture(deployDrawContractFixture);
      const initialDrawCount = await drawContract.getDrawCount(owner.address);
      await drawContract.draw();
      expect(await drawContract.getDrawCount(owner.address)).to.equal(initialDrawCount + BigInt(1));
    });
  });
});
