# 50x50

Collborative drawing dApp with a twist.

## Available scripts

In the project directory, you can run:

### `npm start`

Starts the application in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view in a browser.

The page will reload if you make changes.\
You can also see any linter errors in the console.

### `node server/server.js`

Starts the backend server (HTTP API and WebSocket API).

### `npm run build`

Builds a production application into a folder `build`.\
Combines React in production mode and optimizes the build for best performance.

The build is minified and file names include hashes.\
Your application is ready for deployment!

See the section on [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npx hardhat run scripts/deploy.js --network sepolia`

Runs the `deploy.js` script using the Hardhat tool on the Sepolia network.
This script is used to deploy your contract to the Sepolia network.

Make sure you have Hardhat installed and have configured the Sepolia network configuration in the `hardhat.config.js` file.

Upon successful execution, you should see the address of the deployed contract in the console.

### Using the --network parameter

The `--network` parameter is used to specify the network on which you want to deploy your contract. In the above example, we use the Sepolia network.

You can add a new network to the `hardhat.config.js` file. Here is an example of how to do it:
```
module.exports = {
    solidity: "0.8.18",
    networks: {
        sepolia: {
            url: "https://eth-sepolia.public.blastapi.io",
            accounts: process.env.ADMIN_WALLET_KEY]
        },
        // Добавьте вашу новую сеть здесь
        newNetwork: {
            url: "URL_ВАШЕЙ_СЕТИ",
            accounts: [process.env.ADMIN_WALLET_KEY]
        }
        },
};
```

### Configuration dotenv

We use the `dotenv` package to load variables from the `.env` file. This file is located in the root directory of the project and contains all necessary environment variables in the format `NAME=VALUE`. For customization you can read the comments in the file itself.
