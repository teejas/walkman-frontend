const authEndpoint = "https://accounts.spotify.com/authorize";
const redirectUri = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;

const scopes = [
    'ugc-image-upload',
    'user-modify-playback-state',
    'user-read-playback-state',
    'user-read-currently-playing',
    'user-follow-modify',
    'user-follow-read',
    'user-read-recently-played',
    'user-read-playback-position',
    'user-top-read',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'app-remote-control',
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-library-modify',
    'user-library-read',
];

export const loginUrl = `${authEndpoint}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes.join(
  "%20"
)}`;