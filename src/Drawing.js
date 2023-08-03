import React, { useState, useEffect } from "react";
import { CompactPicker, SketchPicker } from "react-color";
import axios from "axios";
import Leaderboard from "./Leaderboard";
import html2canvas from "html2canvas";
import { Grid, Button, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import DrawContract from "./artifacts/contracts/DrawContract.sol/DrawContract.json";
import { ethers } from "ethers";
import Tappable from 'react-tappable'
// import pinataSDK from '@pinata/sdk';

const DRAW_CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS; // Replace with your contract's address



const Drawing = ({ username, connectWallet }) => {
  // const [username, setUsername] = useState('');
  const [color, setColor] = useState("#000000");
  const [pixels, setPixels] = useState(
    Array(50)
      .fill()
      .map(() => Array(50).fill(0)),
  );
  const [pixelCount, setPixelCount] = useState(0);
  const [paintedPixels, setPaintedPixels] = useState([]);
  const [highlightedPixels, setHighlightedPixels] = useState([]);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [pixelAuthors, setPixelAuthors] = useState({});
  const [provider, setProvider] = useState(null);
  const [drawContract, setDrawContract] = useState(null);
  const [ws, setWs] = useState(null);
  const [clickedPixels, setClickedPixels] = useState({});
  const [hoveredPixel, setHoveredPixel] = useState(null);
  const [currentUserPixels, setCurrentUserPixels] = useState({});

  const Pixel = ({ i, j, onClick, highlighted }) => {
    const color = currentUserPixels[`${i}-${j}`] || pixels[i][j];

    // const [calculatedInverse, setCalculatedInverse] = useState('purple')
    
    // const inverseColor = (color) => {
    //   if (color === 0) return 'black';
    //   let hex = color.replace('#', '');
    //   let r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16);
    //   let g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16);
    //   let b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    //   return '#' + padZero(r) + padZero(g) + padZero(b);
    // };
  
    // const padZero = (str, len = 2) => {
    //   let zeros = new Array(len).join('0');
    //   return (zeros + str).slice(-len);
    // };

    return (
      // <Tappable onTap={onClick} style={{
      //   width: "11px",
      //   height: "11px",
      //   padding: 0,
      //   border: "none",
      //   backgroundColor: "transparent",
      // }}>
      <button
      onClick={onClick}
      // onMouseOver={onMouseOver}
      style={{
        width: "11px",
        height: "11px",
        padding: 0,
        border: "none",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          width: "11px",
          height: "11px",
          backgroundColor: color === 0 ? "transparent" : color,
          border: highlighted ? "1px solid yellow" : "none",
          boxSizing: "border-box",
        }}
      />
    </button>
    // </Tappable>
    );
  };
  const [nextMintTime, setNextMintTime] = useState(Date.now() + 1000);
  const [isDrawingOver, setIsDrawingOver] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const fetchData = async () => {
    // Fetch the pixels and users data here
    const fetchPixelAuthors = async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}users`);
      const authors = {};
      response.data.forEach((user) => {
        user.paintedPixels.forEach((pixel) => {
          authors[`${pixel.i}-${pixel.j}`] = user.username;
        });
      });
      setPixelAuthors(authors);
    };
    fetchPixelAuthors();
    const fetchPaintings = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}paintings`,
      );
      if (response.data && response.data.pixels) {
        setPixels(response.data.pixels);
      }
    };
    fetchPaintings();
    setDataVersion(dataVersion => dataVersion + 1);
  };

  // useEffect(() => {
  //   if (nextMintTime <= Date.now()) {
  //     setIsDrawingOver(true);
  //     setTimeout(() => {
  //       fetchData();
  //       fetchNextMintTime();
  //       setIsDrawingOver(false);
  //     }, 60 * 1000); // 1 minute
  //   } else {
  //     setIsDrawingOver(false);
  //   }
  // }, [nextMintTime]);

  const fetchNextMintTime = async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}nextMintTime`);
    const newNextMintTime = response.data.nextMintTime + Math.random() * 0.01;
    setNextMintTime(newNextMintTime);
    if (newNextMintTime <= Date.now()) {
      console.log('triggered');
      setTimeout(async () => {
        // Fetch the next mint time again after 1.5 seconds
        const response = await axios.get(`${process.env.REACT_APP_API_URL}nextMintTime`);
        const newNextMintTime = response.data.nextMintTime + Math.random() * 0.01;
        if (newNextMintTime <= Date.now()) {
          setIsDrawingOver(true);
          setTimeout(() => {
            fetchData();
            fetchNextMintTime();
            setIsDrawingOver(false);
          }, 90 * 1000); // 1.5 minute
        } else {
          setIsDrawingOver(false);
        }
      }, 1500); // 1.5 seconds
    } else {
      setIsDrawingOver(false);
    }
  };

  useEffect(() => {
    fetchNextMintTime();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchNextMintTime();
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const drawContract = new ethers.Contract(
        DRAW_CONTRACT_ADDRESS,
        DrawContract.abi,
        signer,
      );
      setProvider(provider);
      setDrawContract(drawContract);
    }
  }, []);

  useEffect(() => {
    let ws = null;
    const connect = () => {
      ws = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_API_URL}`);
      ws.onopen = () => {
        console.log("connected to ws server");
      };
      ws.onmessage = (event) => {
        if (typeof event.data === "string") {
          const message = JSON.parse(event.data);
          if (message.type === 'pixels' && Array.isArray(message.data) && message.data.every(Array.isArray)) {
            setPixels(message.data);
          }
        } else if (event.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = function () {
            const message = JSON.parse(this.result);
            if (message.type === 'pixels' && Array.isArray(message.data) && message.data.every(Array.isArray)) {
              setPixels(message.data);
            }
          };
          reader.readAsText(event.data);
        }
      };
      ws.onclose = (e) => {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        setTimeout(function() {
          connect();
        }, 1000);
      };
      ws.onerror = (err) => {
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        ws.close();
      };
    };
    connect();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const theme = createTheme({
    typography: {
      fontFamily: "'Press Start 2P', cursive",
    },
  });

  useEffect(() => {
    const fetchPixelAuthors = async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}users`);
      const authors = {};
      response.data.forEach((user) => {
        user.paintedPixels.forEach((pixel) => {
          authors[`${pixel.i}-${pixel.j}`] = user.username;
        });
      });
      setPixelAuthors(authors);
    };
    fetchPixelAuthors();
  }, []);

  const handlePixelHover = (i, j) => {
    setHoveredUser(pixelAuthors[`${i}-${j}`] || null);
    // setHoveredPixel({ i, j });
  };

  useEffect(() => {
    const fetchPaintings = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}paintings`,
      );
      if (response.data && response.data.pixels) {
        setPixels(response.data.pixels);
      }
    };
    fetchPaintings();
  }, []);

  const handleColorChange = (color) => {
    setColor(color.hex);
  };

  const handlePixelClick = (i, j) => {
    if (!username) return;
    if (pixelCount >= 10) return;
    console.log('clicked pixel');
    setCurrentUserPixels(prevPixels => {
      let newPixels = { ...prevPixels };
      newPixels[`${i}-${j}`] = color;
      return newPixels;
    });
    if (!clickedPixels[`${i}-${j}`]) {
      setPixelCount(pixelCount + 1);
      setClickedPixels({ ...clickedPixels, [`${i}-${j}`]: true });
    }
    setPaintedPixels([...paintedPixels, { i, j, color }]);
  };

  const savePainting = async () => {
    if (!username) return;
    try {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let network = await provider.getNetwork();
      if (network.chainId !== Number(process.env.REACT_APP_TARGET_CHAIN_DECIMAL_ID)) { // replace with your network ID
        await connectWallet();
        // Recreate the provider and get the new network
        provider = new ethers.providers.Web3Provider(window.ethereum);
        network = await provider.getNetwork();
        // If the network is still not correct, stop executing the function
        if (network.chainId !== Number(process.env.REACT_APP_TARGET_CHAIN_DECIMAL_ID)) {
          alert(`Please switch to the correct network in Metamask settings, requred ${Number(process.env.REACT_APP_TARGET_CHAIN_DECIMAL_ID)}, present ${network.chainId}`);
          return;
        }
      }
      const signer = provider.getSigner();
      const drawContract = new ethers.Contract(DRAW_CONTRACT_ADDRESS, DrawContract.abi, signer);
      await drawContract.draw();;
      for (let pixel of paintedPixels) {
        // Check if there is a user who has previously painted this pixel
        const previousUser = await axios.get(
          `${process.env.REACT_APP_API_URL}users/pixel/${pixel.i}/${pixel.j}`,
        );
        if (previousUser.data) {
          // Remove this pixel from their paintedPixels array
          await axios.put(
            `${process.env.REACT_APP_API_URL}users/${previousUser.data._id}/removePixel`,
            { i: pixel.i, j: pixel.j },
          );
        }
      }
      // Merge currentUserPixels with pixels
      const mergedPixels = pixels.map((row, i) =>
        row.map((pixel, j) => currentUserPixels[`${i}-${j}`] || pixel)
      );
      await axios.post(`${process.env.REACT_APP_API_URL}paintings`, { pixels: mergedPixels });
      await axios.post(`${process.env.REACT_APP_API_URL}users`, {
        username,
        pixelCount,
        paintedPixels,
      });
      // ws.send(JSON.stringify({ type: 'pixels', data: mergedPixels }));
      setPixelCount(0);
      setPaintedPixels([]);
      setClickedPixels({});
      setCurrentUserPixels({}); // clear currentUserPixels
      fetchData();
    } catch (err) {
      console.error("Error drawing:", err);
    }
  };

  const handleUserHover = (paintedPixels) => {
    setHighlightedPixels(paintedPixels);
  };

  const saveAsImage = () => {
    const drawingDiv = document.getElementById("drawing");
    html2canvas(drawingDiv).then((canvas) => {
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      // imgData is the .jpg file in base64 format
      // You can now proceed to upload this to IPFS
    });
  };

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    return (
    <Grid container alignItems="center" justifyContent='center' sx={{paddingTop: 2}}>
    <Typography>Only on Desktop</Typography>
    </Grid>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Grid container alignItems="center" justifyContent='center'>
        {nextMintTime > Date.now()
          ? <Typography>`Next mint in {Math.floor(Math.floor((nextMintTime - Date.now()) / 1000) / 3600)} hours {Math.floor((Math.floor((nextMintTime - Date.now()) / 1000) % 3600) / 60).toString().padStart(2, '0')} minutes `</Typography>
          : <Typography>'Drawing is over, picking a winner...'</Typography>}
      </Grid>
      {!isDrawingOver && (
      <Grid container direction="column" alignItems="center">
        <Grid item container direction="row" justifyContent="center" alignItems="center">
          <Grid item>
            <div
              id="drawing"
              style={{
                display: "inline-grid",
                gridTemplateColumns: "repeat(50, 11px)",
                border: "2px solid black",
                backgroundSize: "5px 5px",
                backgroundImage: `
                  linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                  linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                  linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)`,
              }}
            >
              {pixels.flatMap((row, i) =>
                row.map((pixel, j) => (
                  <Pixel
                    key={`${i}-${j}`}
                    i={i}
                    j={j}
                    color={pixel}
                    onClick={() => handlePixelClick(i, j)}
                    highlighted={highlightedPixels.some(
                      (p) => p.i === i && p.j === j,
                    )}
                    paletteColor={color}
                  />
                )),
              )}
            </div>
          </Grid>
          <Grid item>
            <Leaderboard dataVersion={dataVersion} onUserHover={handleUserHover} hoveredUser={hoveredUser} username={username}/>
          </Grid>
        </Grid>
        <Grid item container direction="row" justifyContent="flex-start" alignItems="center" style={{maxWidth: 'calc(50 * 11px + 350px)'}}>
          <Grid item>
            <CompactPicker
              color={color}
              onChangeComplete={handleColorChange}
              className="press-start-2p"
            />
          </Grid>
          <Grid item>
            <Button
              onClick={isDrawingOver ? null : savePainting}
              disabled={pixelCount === 0 || !username || pixelCount > 10}
            >
              Save Painting {pixelCount}/10
            </Button>
          </Grid>
        </Grid>
      </Grid>)}
    </ThemeProvider>
  );
};

export default Drawing;
