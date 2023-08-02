// App.js
import React, { useState, useEffect } from 'react';
import { Grid, Button, Typography, Snackbar, SnackbarContent, useMediaQuery, IconButton } from '@mui/material';
import Drawing from './Drawing';
import { ReactComponent as Logo } from './lomgus.svg';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import Web3 from 'web3';
import { ReactComponent as TwitterLogo } from './icons8-twitter.svg';
import DiscordLogo from './icons8-discord.svg'
import TextPicture from './pixilart-drawing.png'
import ImgLogo from './longus.svg'
import {ReactComponent as TelegramLogo} from './icons8-telegram.svg'
import Collection from './Collection';
import { Slide } from '@mui/material';

function App() {
  const [showDrawing, setShowDrawing] = useState(false);
  const [showCollection, setShowCollection] = useState(false);

  const web3 = new Web3(window.ethereum);

  const [username, setUsername] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSnackbarClick = () => {
    setOpenSnackbar(true);
    setTimeout(() => {
      setOpenSnackbar(false);
    }, 3000);
  };

  const handleCollectionClick = () => {
    setShowCollection(true);
    setShowDrawing(false);
  };

  useEffect(() => {
    const getAccount = async () => {
      if (window.ethereum) {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          setUsername(accounts[0]);
          setIsWalletConnected(true);
        } else {
          setUsername('');
          setIsWalletConnected(false);
        }
      }
    };
    getAccount();
  
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', getAccount);
    }
  }, []);

  const theme = createTheme({
    typography: {
      fontFamily: "'Press Start 2P', cursive",
    },
    palette: {
      background: {
        default: '#f4f7f5',
      },
    },
  });

  async function connectWallet () {
    if (window.ethereum) {
    await window.ethereum.enable();
    const networkId = await web3.eth.net.getId();
    if (networkId !== Number(process.env.REACT_APP_TARGET_CHAIN_DECIMAL_ID)) { // sepolia
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: process.env.REACT_APP_TARGET_CHAIN_ID }], // sepolia
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: process.env.REACT_APP_TARGET_CHAIN_ID,
                chainName: process.env.REACT_APP_TARGET_CHAIN_NAME,
                nativeCurrency: {
                  name: process.env.REACT_APP_TARGET_CHAIN_NATIVE_CURRENCY_NAME,
                  symbol: process.env.REACT_APP_TARGET_CHAIN_NATIVE_CURRENCY_SYMBOL,
                  decimals: 18
                },
                rpcUrls: [process.env.REACT_APP_TARGET_CHAIN_RPC_URL], // replace INFURA_PROJECT_ID with your Infura project ID
                blockExplorerUrls: [process.env.REACT_APP_TARGET_CHAIN_EXPLORER_URL]
              }],
            });
          } catch (addError) {
            console.error(addError);
          }
        } 
      }
    }
    const accounts = await web3.eth.getAccounts();
    setUsername(accounts[0]);
    setIsWalletConnected(true);
    }
  }
  
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent =
      typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const mobile = Boolean(
      userAgent.match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
      )
    );
    setIsMobile(mobile);
  }, []);

return (
  <ThemeProvider theme={theme}>
    {
      (() => {

        if (isMobile) {
          return (
            <Grid container direction="column" alignItems="center" justifyContent="center" padding={1}>
              <Grid item>
                <IconButton onClick={() => {setShowDrawing(false); setShowCollection(false);}} sx={{marginRight: 2}} disableRipple>
                  <Logo />
                </IconButton>
              </Grid>
              <Grid item sx={{paddingTop: 2}}>
                <Button onClick={handleCollectionClick} sx={{border: '2px solid black', borderRadius: 0, marginRight: 1, maxHeight: '6vw', boxShadow: '5px 5px #888888', color: '#103c79'}}>Collection</Button>
                <a href="https://docs.google.com/document/d/1dbBfkEEL0Yp9qH5bhyKYQTWacc86-rYKLfZg28okJlg/" target="_blank" rel="noopener noreferrer">
                  <Button sx={{border: '2px solid black', borderRadius: 0, marginRight: 1, maxHeight: '6vw', boxShadow: '5px 5px #888888', color: '#103c79' }}>Roadmap</Button>
                </a>
                <Button 
                  onClick={() => {
                    if (showDrawing) {
                      if (!isWalletConnected) {
                        connectWallet()
                      }
                    } else {
                      setShowDrawing(true);
                      setShowCollection(false);
                    }
                  }} 
                  sx={{border: '2px solid black', borderRadius: 0, maxHeight: '6vw', boxShadow: '5px 5px #888888', color: '#103c79'}}
                >
                  Play
                </Button>
              </Grid>
              <Grid item sx={{paddingTop: 2}}>
                <a href="https://t.me/io50x50" target="_blank" rel="noopener noreferrer">
                  <Button sx={{marginRight: 1, maxHeight: '3vw'}}>
                  <TelegramLogo style={{ fill: '#103c79', height: '30px' }} />
                  </Button>
                </a>
                <a href="https://twitter.com/50x50io" target="_blank" rel="noopener noreferrer">
                  <Button sx={{marginRight: 2, maxHeight: '3vw'}}>
                    <TwitterLogo style={{ fill: '#103c79', height: '30px' }} />
                  </Button>
                </a>
              </Grid>
              {showDrawing && <Drawing username={username} connectWallet={connectWallet}/>}
              {showCollection && <Collection />}
              {!showDrawing && !showCollection && 
                <Grid container direction="row" alignItems="center" justifyContent="center" minHeight='40vw'>
                  <Grid item>
                    {/* <img src={TextPicture} alt="Text Picture" height="200" /> Adjust the height as needed */}
                  </Grid>
                  <Grid item>
                    <Grid container direction="column" alignItems="center" justifyContent="center" sx={{maxWidth: '70vw', paddingTop: 2}}>
                      <Typography variant='h2'>50x50</Typography>
                      <Typography variant="body2">
                        Use your imagination to create a unique NFT on a 50x50 pixel canvas.
                        But remember that everyone can use this canvas!
                        A snapshot occurs every 24 hours.
                        The NFT goes to the person who painted the most pixels.
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              }
              <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                TransitionComponent={Slide}
              >
                <SnackbarContent 
                  message={<Typography align="center">Coming soon...</Typography>}
                  sx={{ borderRadius: 0 }}
                />
              </Snackbar>
            </Grid>
          );
        } else {
          return (
            <Grid container justifyContent="space-between" alignItems="center" padding={2} paddingLeft={'100px'} paddingRight={'100px'}>
              <Grid item>
                <IconButton onClick={() => {setShowDrawing(false); setShowCollection(false);}} sx={{marginRight: 2}} disableRipple>
                  <Logo />
                </IconButton>
                <a href="https://docs.google.com/document/d/1dbBfkEEL0Yp9qH5bhyKYQTWacc86-rYKLfZg28okJlg/" target="_blank" rel="noopener noreferrer">
                  <Button sx={{border: '2px solid black', borderRadius: 0, marginRight: 2, maxHeight: '3vw', boxShadow: '5px 5px #888888', color: '#103c79' }}>Roadmap</Button>
                </a>
                <Button onClick={handleCollectionClick} sx={{border: '2px solid black', borderRadius: 0, marginRight: 2, maxHeight: '3vw', boxShadow: '5px 5px #888888', color: '#103c79'}}>Collection</Button>
              </Grid>
              <Grid item>
                <a href="https://t.me/io50x50" target="_blank" rel="noopener noreferrer">
                  <Button sx={{marginRight: 1, maxHeight: '3vw'}}>
                  <TelegramLogo style={{ fill: '#103c79', height: '30px' }} />
                  </Button>
                </a>
                <a href="https://twitter.com/50x50io" target="_blank" rel="noopener noreferrer">
                  <Button sx={{marginRight: 2, maxHeight: '3vw'}}>
                    <TwitterLogo style={{ fill: '#103c79', height: '30px' }} />
                  </Button>
                </a>
                <Button 
                  onClick={() => {
                    if (showDrawing) {
                      if (!isWalletConnected) {
                        connectWallet()
                      }
                    } else {
                      setShowDrawing(true);
                      setShowCollection(false);
                    }
                  }} 
                  sx={{border: '2px solid black', borderRadius: 0, maxHeight: '3vw', boxShadow: '5px 5px #888888', color: '#103c79'}}
                >
                  {showDrawing ? (isWalletConnected ? `${username.slice(0, 5)}...${username.slice(-2)}` : 'Connect Wallet') : 'Play'}
                </Button>
              </Grid>
              {showDrawing && <Drawing username={username} connectWallet={connectWallet}/>}
              {showCollection && <Collection />}
              {!showDrawing && !showCollection && 
                <Grid container direction="row" alignItems="center" justifyContent="center" minHeight='40vw'>
                  <Grid item>
                    {/* <img src={TextPicture} alt="Text Picture" height="200" /> Adjust the height as needed */}
                  </Grid>
                  <Grid item>
                    <Grid container direction="column" alignItems="center" justifyContent="center" sx={{maxWidth: '70vw'}}>
                      <Typography variant='h1'>50x50</Typography>
                      <Typography variant="body1">
                        Use your imagination to create a unique NFT on a 50x50 pixel canvas.
                        But remember that everyone can use this canvas!
                        A snapshot occurs every 24 hours.
                        The NFT goes to the person who painted the most pixels.
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              }
              <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                TransitionComponent={Slide}
              >
                <SnackbarContent 
                  message={<Typography align="center">Coming soon...</Typography>}
                  sx={{ borderRadius: 0 }}
                />
              </Snackbar>
            </Grid>
          );
        }
      })()
    }
  </ThemeProvider>
);
}

export default App;