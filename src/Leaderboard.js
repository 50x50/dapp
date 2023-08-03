// Leaderboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, TableFooter } from '@mui/material';

const Leaderboard = ({ onUserHover, hoveredUser, username, dataVersion }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}users`);
      const users = response.data;
  
      users.sort((a, b) => b.transactionCount - a.transactionCount);
  
      setUsers(users);
    };
    fetchUsers();
  }, [dataVersion]);

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
          if (message.type === 'users') {
            setUsers(message.data);
          }
        } else if (event.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = function () {
            const message = JSON.parse(this.result);
            if (message.type === 'users') {
              setUsers(message.data);
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

  const truncateUsername = (username) => {
    if (username.length > 20) {
      return `${username.slice(0, 5)}...${username.slice(-5)}`;
    }
    return username;
  };

  const currentUser = users.find(user => user.username === username);

  return (
    <TableContainer component={Paper} style={{ backgroundColor: '#f4f7f5' }} sx={{ borderRadius: 0, height: 550, width: 350, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Table>
        <TableBody>
          {users
            .sort((a, b) => b.transactionCount - a.transactionCount)
            .slice(0, 10)
            .map(user => (
              <TableRow 
              key={user.username} 
              sx={{ 
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                height: '55px',  // Set the height of each row
                backgroundColor: user.username === hoveredUser ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
              }}
              onMouseOver={() => onUserHover(user.paintedPixels)} 
              onMouseOut={() => onUserHover([])}
            >
              <TableCell style={{ width: '50%' }}>
                {truncateUsername(user.username)}
              </TableCell>
              <TableCell align="right" style={{ width: '50%' }}>
                {user.transactionCount}({user.pixelCount})
              </TableCell>
            </TableRow>
            ))}
        </TableBody>
      </Table>
      <Table>
        <TableFooter>
          <TableRow>
            <TableCell style={{ width: '50%' }}>
              {username ? truncateUsername(username) : 'Not connected'}
            </TableCell>
            <TableCell align="right" style={{ width: '50%' }}>
              {currentUser ? currentUser.transactionCount : ''}{currentUser ? `(${currentUser ? currentUser.pixelCount : ''})` : ''}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};

export default Leaderboard;