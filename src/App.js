import Login from './Login';
import React, { Component, useCallback, useEffect }  from 'react';
import { Box, Button, Typography, Grid } from '@material-ui/core';
import { Stack, HStack, VStack } from '@chakra-ui/react';
import SpotifyWebPlayer from "react-spotify-web-playback"
import axios from 'axios';

let skipping = false
let track = ""
let timeout = null

const skipTrack = (deviceId) => {
  var bodyFormData = new FormData();
  bodyFormData.append('device_id', deviceId);
  var authOptions = {
    url: process.env.REACT_APP_BACKEND_URL + '/api/spotify/skip_track/',
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
  })
  .catch(function (error) {
    console.log(error);
  });
}

const spotifyCallback = (state) => {
  console.log("state: ", state)
  if (track != state.track.id && !state.isSaved) {
    track = state.track.id
    skipping = true
    console.log("skipping: ", skipping)
  } else if(state.isSaved) {
    console.log("saved: ", state.track.name)
    console.log("clearing timeout")
    skipping = false
    console.log("skipping: ", skipping)
    if(timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }
  if(skipping && state.deviceId != null &&  state.deviceId != "") {
    if(timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    console.log("setting timeout")
    timeout = setTimeout(() => {
      skipTrack(state.deviceId)
    }, 30000)
    skipping = false
    console.log("skipping: ", skipping)
  }
}

const MySpotifyPlayer = (props) => {
  return (
    <SpotifyWebPlayer
      callback={spotifyCallback}
      initialVolume={50}
      persistDeviceSelection
      play={true}
      autoPlay={true}
      showSaveIcon
      styles={{
        sliderColor: '#1cb954',
      }}
      token={props.code}
      uris={props.uris}
    />
  );
};

const App = (props) => {
  
  const code = new URLSearchParams(window.location.search).get('code')
  const [token, setToken] = React.useState(null)
  const [uris, setUris] = React.useState([])

  const fetchToken = () => {
    var bodyFormData = new FormData();
    bodyFormData.append('code', code);
    bodyFormData.append('redirect_uri', 'http://localhost:3000/');
    bodyFormData.append('grant_type', 'authorization_code');
    var authOptions = {
      url: process.env.REACT_APP_BACKEND_URL + '/api/spotify/get_token/',
      method: 'POST',
      data: bodyFormData,
      headers: {
        'Content-Type' : 'application/json'
      }
    };

    console.log("authOptions: ", authOptions)
    axios(authOptions)
    .then(function (response) {
      setToken(response.data)
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  const fetchRecommendations = () => {
    var authOptions = {
      url: process.env.REACT_APP_BACKEND_URL + '/api/spotify/get_recommendations/',
      method: 'GET',
      headers: {
        'Content-Type' : 'application/json'
      }
    };

    axios(authOptions)
    .then(function (response) {
      console.log("response: ", response)
      setUris(response.data)
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  
  useEffect(() => {
    fetchToken();
    fetchRecommendations();
  }, [])

  return (
    token ?
      <Grid  
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Grid item>
          {
            uris.length > 0 ?
              <MySpotifyPlayer code={token} uris={uris} />
            :
              <Typography variant="h4">Loading web player...</Typography>
          }
        </Grid>
      </Grid>
    :
    <Login />
  );
}

export default App;
