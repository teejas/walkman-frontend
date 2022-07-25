import Login from './Login';
import React, { Component, useCallback, useEffect }  from 'react';
import { Box, Button, Typography, Grid, List, ListItem } from '@material-ui/core';
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
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
}

const spotifyCallback = (state) => {
  if (track != state.track.id && !state.isSaved) {
    track = state.track.id
    skipping = true
  } else if(state.isSaved) {
    skipping = false
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
    timeout = setTimeout(() => {
      skipTrack(state.deviceId)
    }, 30000)
    skipping = false
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
  const [playlists, setPlaylists] = React.useState([])
  const [playlist, setPlaylist] = React.useState(null)

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
      console.log(response);
      if(response.data != "No code") {
        setToken(response.data)
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  const fetchPlaylists = () => {
    var authOptions = {
      url: process.env.REACT_APP_BACKEND_URL + '/api/spotify/get_playlists/',
      method: 'GET',
      headers: {
        'Content-Type' : 'application/json'
      }
    };

    axios(authOptions)
    .then(function (response) {
      setPlaylists(response.data)
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  const fetchRecommendations = (playlist_id) => {
    var bodyFormData = new FormData();
    bodyFormData.append('playlistId', playlist_id);
    var authOptions = {
      url: process.env.REACT_APP_BACKEND_URL + '/api/spotify/get_recommendations/',
      method: 'POST',
      data: bodyFormData,
      headers: {
        'Content-Type' : 'application/json'
      }
    };

    axios(authOptions)
    .then(function (response) {
      setUris(response.data)
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  
  useEffect(() => {
    fetchToken();
    fetchPlaylists();
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
            playlist && uris.length > 0 ?
              <MySpotifyPlayer code={token} uris={uris} />
            :
              playlists.length > 0 && !playlist ?
                <Box>
                  <Typography variant="h4">Select a playlist</Typography>
                  <List>
                    {
                      playlists.map((playlist, index) => {
                        return (
                          <ListItem key={index}>
                            <Button variant="contained" color="primary" key={index} onClick={() => {
                              setPlaylist(playlist.uri)
                              fetchRecommendations(playlist.uri)
                            }
                            }>{playlist.name}</Button>
                          </ListItem>
                        )
                      })
                    }
                  </List>
                </Box>
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
