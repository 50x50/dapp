import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardMedia, CardContent, Typography, Grid } from '@mui/material';

const Collection = () => {
  const [nfts, setNfts] = useState([]);
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

  useEffect(() => {
    const fetchNfts = async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}nfts`);
      setNfts(response.data.reverse());
    };
    fetchNfts();
  }, []);

  const truncateUsername = (username) => {
    if (username.length > 20) {
      return `${username.slice(0, 5)}...${username.slice(-5)}`;
    }
    return username;
  };

  return (
    <Grid container spacing={2} style={{ padding: isMobile ? '2rem 0' : '0 100px', justifyContent: 'center' }}>
      {nfts.map(nft => (
        <Grid item key={nft._id} xs={isMobile ? 12 : undefined} {...(isMobile ? { container: true, justifyContent: "center" } : {})}>
          <Card style={{ height: '370px', width: '300px', borderRadius: '0px', backgroundColor: '#f4f7f5' }} >
            <CardMedia
              component="img"
              style={{ height: '300px', width: '300px' }} // Set the height and width as needed
              image={`https://gateway.pinata.cloud/ipfs/${nft.cid}`}
              alt="NFT image"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Winner: {truncateUsername(nft.address)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Collection;