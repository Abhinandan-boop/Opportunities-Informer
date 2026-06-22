const db = require('../db/connection');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const router = express.Router();

const credentialsPathCandidates = [
  path.resolve(__dirname, '..', '..', 'credentials.json'),
  path.resolve(__dirname, '..', '..', '..', 'credentials.json'),
  path.resolve(process.cwd(), 'credentials.json')
];

let fallbackCredentials = {};
let loadedCredentialsPath = null;

for (const candidate of credentialsPathCandidates) {
  if (fs.existsSync(candidate)) {
    fallbackCredentials = require(candidate);
    loadedCredentialsPath = candidate;
    break;
  }
}

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID || fallbackCredentials?.installed?.client_id || fallbackCredentials?.web?.client_id;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || fallbackCredentials?.installed?.client_secret || fallbackCredentials?.web?.client_secret;
  let redirectUri = process.env.GOOGLE_REDIRECT_URI || fallbackCredentials?.installed?.redirect_uris?.[0] || fallbackCredentials?.web?.redirect_uris?.[0];

  if (!redirectUri || redirectUri === 'http://localhost') {
    redirectUri = 'http://localhost:3000/auth/google/callback';
  }

  if (!redirectUri.endsWith('/auth/google/callback')) {
    redirectUri = redirectUri.replace(/\/*$/, '') + '/auth/google/callback';
  }

  if (!clientId || !clientSecret) {
    console.error('Google OAuth config missing. Tried:', {
      loadedCredentialsPath,
      clientIdSource: process.env.GOOGLE_CLIENT_ID ? 'env' : 'credentials.json',
      clientSecretSource: process.env.GOOGLE_CLIENT_SECRET ? 'env' : 'credentials.json'
    });
  }
console.log("\n========== GOOGLE CONFIG ==========");
console.log("Client ID:", clientId);
console.log("Client Secret Exists:", !!clientSecret);
console.log("Redirect URI:", redirectUri);
console.log("Credentials loaded from:", loadedCredentialsPath);
console.log("===================================\n");

  return { clientId, clientSecret, redirectUri };

}

function getOAuthClient() {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig();

  if (!clientId || !clientSecret) {
    throw new Error('Google client ID and secret must be configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET or provide a credentials.json file.');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// Step 1: Generate auth URL
router.get('/google', (req, res) => {
  try {
    const oauth2Client = getOAuthClient();
    const returnTo = req.query.redirectTo || req.get('origin') || 'http://localhost:3000';
    req.session.returnTo = returnTo;

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.readonly'
    ],
      state: Buffer.from(JSON.stringify({ returnTo })).toString('base64')
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('Auth URL error:', error);
    res.status(500).json({ error: 'Failed to generate Google auth URL' });
  }
});

// Step 2: Handle OAuth callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    let returnTo = req.session.returnTo;

    if (!returnTo && state) {
      try {
        const parsed = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
        returnTo = parsed.returnTo;
      } catch (err) {
        console.warn('Failed to parse OAuth state:', err);
      }
    }

    if (!code) {
      return res.status(400).json({ error: 'No authorization code received' });
    }

    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
  auth: oauth2Client,
  version: 'v2'
  } );

  const { data } = await oauth2.userinfo.get();
  console.log(data);

  console.log(data);

  db.query(
  "SELECT * FROM users WHERE email = ?",
  [data.email],
  (err, results) => {

    if (err) {
      console.error(err);
      return;
    }

    if (results.length === 0) {

      db.query(
        `INSERT INTO users
        (full_name,email,google_id,picture)
        VALUES (?,?,?,?)`,
        [
          data.name,
          data.email,
          data.id,
          data.picture
        ]
      );

      console.log("✅ New user added:", data.email);

    } else {

      console.log("✅ Existing user:", data.email);

    }

  }
);

    req.session.accessToken = tokens.access_token;
    req.session.refreshToken = tokens.refresh_token;
    req.session.authenticated = true;

    const redirectUrl = new URL(returnTo || 'http://localhost:3000');
    redirectUrl.searchParams.set('auth', 'success');

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Auth error:', error);
    const redirectUrl = new URL(req.session.returnTo || 'http://localhost:3000');
    redirectUrl.searchParams.set('auth', 'failed');
    res.redirect(redirectUrl.toString());
  }
});

// Step 3: Check if authenticated
router.get('/status', (req, res) => {
  res.json({ 
    authenticated: req.session.authenticated || false 
  });
});

// Step 4: Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ status: 'logged out' });
});

module.exports = router;
