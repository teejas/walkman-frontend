import Login from './Login';
import React, { Component, useCallback, useEffect }  from 'react';
import { Box, Button, Typography, Grid } from '@material-ui/core';
import { Stack, HStack, VStack } from '@chakra-ui/react'
import { WebPlaybackSDK, usePlaybackState, useWebPlaybackSDKReady, useSpotifyPlayer } from "react-spotify-web-playback-sdk";
import axios from 'axios';

const MyPlayer = () => {
  const webPlaybackSDKReady = useWebPlaybackSDKReady();

  if (!webPlaybackSDKReady) return <div>Loading...</div>;

  return <Typography>Spotify App is ready!</Typography>;
};

const SongTitle = () => {
  const playbackState = usePlaybackState();

  if (playbackState === null) return null;

  return <Typography>Current song: {playbackState.track_window.current_track.name}</Typography>;
};

const PauseResumeButton = () => {
  const player = useSpotifyPlayer();

  console.log(player)

  if (player === null) return null;

  return (
    <div>
      <Button variant="contained" color="primary" onClick={() => player.pause()}>pause</Button>
      <Button variant="contained" color="primary" onClick={() => player.resume()}>resume</Button>
    </div>
  );
};

function MySpotifyPlayer(props) {
  const getOAuthToken = useCallback(callback => callback(props.code), []);

  return (
    <WebPlaybackSDK
      deviceName="Walkman Spotify App"
      getOAuthToken={getOAuthToken}
      volume={0.5}
      connectOnInitialized={true}>
        <MyPlayer />
        <SongTitle />
        <PauseResumeButton />
    </WebPlaybackSDK>
  );
};

function App(props) {
  
  const code = new URLSearchParams(window.location.search).get('code')
  const [token, setToken] = React.useState(null)

  useEffect(() => {
    var bodyFormData = new FormData();
    bodyFormData.append('code', code);
    bodyFormData.append('redirect_uri', 'http://localhost:3000/');
    bodyFormData.append('grant_type', 'authorization_code');
    var authOptions = {
      url: 'http://localhost:8000/api/auth/spotify/',
      method: 'POST',
      data: bodyFormData,
      headers: {
        'Content-Type' : 'application/json'
      }
    };

    console.log("authOptions: ", authOptions)
    axios(authOptions)
    .then(function (response) {
      console.log("response: ", response)
      setToken(response.data)
    })
    .catch(function (error) {
      console.log(error);
    });
  })

  if(token) {
    console.log("token: ", token)
    return (
      <Grid  
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Grid item xs>
          <MySpotifyPlayer code={token}/>
        </Grid>
      </Grid>
    );
  } else {
    return (
      <Login />
    )
  }
}

export default App;
