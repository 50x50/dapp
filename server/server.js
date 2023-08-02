require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { ethers } = require('ethers');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 5001 });
let nextMintTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now


wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Broadcast the message to all clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

const infuraApiKey = process.env.REACT_APP_INFURA_API_KEY;
const privateKey = process.env.REACT_APP_ADMIN_WALLET_KEY;
console.log(privateKey);
const DEFAULT_WALLET = process.env.REACT_APP_ADMIN_WALLET_ADDRESS;

const provider = new ethers.providers.InfuraProvider('sepolia', {
  projectId: infuraApiKey,
  // projectSecret: infuraApiKey,
});
const wallet = new ethers.Wallet(privateKey);
const signer = wallet.connect(provider);

const contractJson = require('../artifacts/contracts/DrawContract.sol/DrawContract.json');
const contractAbi = contractJson.abi;
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const contract = new ethers.Contract(contractAddress, contractAbi, signer);


// const pinataSDK = require('@pinata/sdk');
// const pinata = pinataSDK('3bf5a31510026c85e217', '34d62d17e5786edc2a901b80b1d4e34e87c0bb290fc7d002a7ee02c3ad2a0611');

// const options = {
//   pinataMetadata: {
//     name: 'My Image',
//   },
//   pinataOptions: {
//     cidVersion: 0,
//   },
// };

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/pixelart', { useNewUrlParser: true, useUnifiedTopology: true });

const sharp = require('sharp');

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

async function createImageFromPixels(pixels) {
  const width = pixels[0].length * 10;
  const height = pixels.length * 10;
  const channels = 3; // RGB

  // Convert the 2D pixel array to a 1D array
  const data = new Uint8Array(width * height * channels);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = hexToRgb(pixels[Math.floor(y / 10)][Math.floor(x / 10)]);
      const index = (y * width + x) * channels;
      if (color) {
        data[index + 0] = color[0]; // R
        data[index + 1] = color[1]; // G
        data[index + 2] = color[2]; // B
      } else {
        data[index + 0] = 255; // R
        data[index + 1] = 255; // G
        data[index + 2] = 255; // B
      }
    }
  }

  // Create the image
  const image = await sharp(data, {
    raw: { width, height, channels },
  }).jpeg().toBuffer();

  return image;
}

async function uploadToIPFS(imagePath) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const data = new FormData();
  data.append('file', fs.createReadStream(imagePath));

  const response = await axios.post(url, data, {
    maxBodyLength: 'Infinity',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
      pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
      pinata_secret_api_key: process.env.REACT_APP_PINATA_API_SECRET,
    },
  });

  return response.data;
}

setInterval(async () => {
  // Fetch the pixel data from the database
  const painting = await Painting.findOne();
  const pixels = painting.pixels;

  // Convert the pixel data to a .jpg image
  const image = await createImageFromPixels(pixels);

  // Write the image to a file
  const imagePath = path.join(__dirname, 'image.jpg');
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
  fs.writeFileSync(imagePath, image);

  // Upload the image to IPFS
  const result = await uploadToIPFS(imagePath);

  const recipient = await User.findOne().sort('-transactionCount');

  const tokenURI = 'ipfs://' + result.IpfsHash;
  const tx = await contract.mintNFT(recipient ? recipient.username : DEFAULT_WALLET, tokenURI);
  await tx.wait();

  // Store NFT data in database
  const nft = new NFT({
    cid: result.IpfsHash,
    address: recipient ? recipient.username : DEFAULT_WALLET,
    // tokenId: tx.logs[0].args.tokenId.toNumber() // assuming the tokenId is emitted in the first log
  });
  await nft.save();

  // Wipe database
  await User.deleteMany({});
  await Painting.deleteMany({});
  // TODO: Reset draws in contract

  console.log('Image uploaded to IPFS with CID ' + result.IpfsHash);

  // Reset the next mint time
  nextMintTime = Date.now() + 24 * 60 * 60 * 1000;
}, 24 * 60 * 60 * 1000);

app.get('/nextMintTime', (req, res) => {
  res.send({ nextMintTime });
});

app.post('/mint-nft', async (req, res) => {
  // Fetch the pixel data from the database
  const painting = await Painting.findOne();
  const pixels = painting.pixels;

  // Convert the pixel data to a .jpg image
  const image = await createImageFromPixels(pixels);
  console.log('created image from database')

  // Write the image to a file
  const imagePath = path.join(__dirname, 'image.jpg');
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
  fs.writeFileSync(imagePath, image);

  // Upload the image to IPFS
  const result = await uploadToIPFS(imagePath);

  const recipient = await User.findOne().sort('-transactionCount');

  const tokenURI = 'ipfs://' + result.IpfsHash;
  const tx = await contract.mintNFT(recipient.username, tokenURI);
  await tx.wait();

  // Store NFT data in database
  const nft = new NFT({
    cid: result.IpfsHash,
    address: recipient.username,
    // tokenId: tx.logs[0].args.tokenId.toNumber() // assuming the tokenId is emitted in the first log
  });
  await nft.save();

  // Wipe database
  await User.deleteMany({});
  await Painting.deleteMany({});
  // TODO: Reset draws in contract

  res.send('Image uploaded to IPFS with CID ' + result.IpfsHash);
});

const paintingSchema = new mongoose.Schema({
  pixels: [[String]]
});

const nftSchema = new mongoose.Schema({
  cid: String,
  address: String,
  tokenId: Number
});

const userSchema = new mongoose.Schema({
  username: String,
  pixelCount: Number,
  transactionCount: Number,
  paintedPixels: [{ i: Number, j: Number, color: String }]
});

const Painting = mongoose.model('Painting', paintingSchema);
const User = mongoose.model('User', userSchema);
const NFT = mongoose.model('NFT', nftSchema);

app.get('/paintings', async (req, res) => {
  let painting = await Painting.findOne();
  if (!painting) {
    painting = new Painting({
      pixels: Array(50).fill().map(() => Array(50).fill(0))
    });
    await painting.save();
  }
  res.send(painting);
});

app.post('/paintings', async (req, res) => {
  let painting = await Painting.findOne();
  if (painting) {
    painting.pixels = req.body.pixels;
    await painting.save();
  } else {
    painting = new Painting({
      pixels: req.body.pixels
    });
    await painting.save();
  }
  res.send(painting);
});

app.get('/users', async (req, res) => {
    const users = await User.find();
    res.send(users);
  });
  
app.post('/users', async (req, res) => {
  let user = await User.findOne({ username: req.body.username });
  if (user) {
      user.pixelCount += req.body.pixelCount;
      user.transactionCount += 1;
      user.paintedPixels.push(...req.body.paintedPixels);
      await user.save();
  } else {
    user = new User({
      ...req.body,
      transactionCount: 1
    });
    await user.save();
  }
  // Broadcast the updated users
  const users = await User.find();
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'users', data: users }));
    }
  });
  res.send(user);
});

app.get('/users/pixel/:i/:j', async (req, res) => {
  const { i, j } = req.params;
  const user = await User.findOne({ paintedPixels: { $elemMatch: { i, j } } });
  console.log(`fetched pixel author ${user}`)
  res.send(user);
});

app.put('/users/:id/removePixel', async (req, res) => {
  const { id } = req.params;
  const { i, j } = req.body;
  const user = await User.findById(id);
  user.paintedPixels = user.paintedPixels.filter(pixel => pixel.i !== i || pixel.j !== j);
  await user.save();
  res.send(user);
});

app.post('/users/addPixel', async (req, res) => {
  const { username, i, j, color } = req.body;
  const user = await User.findOne({ username });
  user.paintedPixels.push({ i, j, color });
  await user.save();
  res.send(user);
});

app.get('/nfts', async (req, res) => {
  const nfts = await NFT.find();
  res.send(nfts);
});

app.listen(5000, () => console.log('Server started on port 5000'));