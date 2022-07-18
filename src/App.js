import Login from './Login';
import React, { Component, useCallback, useEffect }  from 'react';
import { Box, Button, Typography, Grid } from '@material-ui/core';
import { Stack, HStack, VStack } from '@chakra-ui/react';
import SpotifyWebPlayer from "react-spotify-web-playback"
import axios from 'axios';

const MySpotifyPlayer = (props) => {
  console.log("URIS: ", props.uris)
  return (
    <SpotifyWebPlayer
      initialVolume={50}
      persistDeviceSelection
      play={true}
      showSaveIcon
      styles={{
        sliderColor: '#1cb954',
      }}
      syncExternalDevice
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
      url: 'http://localhost:8000/api/spotify/get_token/',
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
      url: 'http://localhost:8000/api/spotify/get_recommendations/',
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
    if (!token) {
      fetchToken();
    }
    if (uris.length === 0) {
      fetchRecommendations();
    }
  })

  if(token) {
    if(uris.length > 0) {
      return (
        <Grid  
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Grid item xs>
            <MySpotifyPlayer code={token} uris={uris} />
          </Grid>
        </Grid>
      );
    } else {
      return <Typography>Loading URI's...</Typography>
    }
  } else {
    return (
      <Login />
    )
  }
}

export default App;
