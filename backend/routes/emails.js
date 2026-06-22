const express = require('express');
const { google } = require('googleapis');
const { categorizeEmail } = require('../utils/categorizer');
const router = express.Router();

// Middleware to check authentication
const authMiddleware = (req, res, next) => {
  if (!req.session.authenticated || !req.session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Get emails from Gmail
router.get('/', authMiddleware, async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials from session
    oauth2Client.setCredentials({
      access_token: req.session.accessToken,
      refresh_token: req.session.refreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get list of messages
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 50,
      q: 'is:unread' // Get unread emails first
    });

    const messages = listRes.data.messages || [];

    // Fetch full message details and categorize
    const emailPromises = messages.map(async (message) => {
      const msgRes = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      const email = msgRes.data;
      const headers = email.payload.headers;
      
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      // Extract body
      let body = '';
      if (email.payload.parts) {
        const textPart = email.payload.parts.find(part => part.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      } else if (email.payload.body?.data) {
        body = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
      }

      // Categorize using AI
      const category = await categorizeEmail(subject, body, from);

      return {
        id: email.id,
        subject,
        from,
        date,
        category,
        snippet: email.snippet,
        unread: true
      };
    });

    const categorizedEmails = await Promise.all(emailPromises);

    res.json({ 
      emails: categorizedEmails,
      total: listRes.data.resultSizeEstimate 
    });

  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Get emails by category
router.get('/category/:category', authMiddleware, async (req, res) => {
  try {
    const { category } = req.params;
    
    // Fetch all emails (same as above)
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: req.session.accessToken,
      refresh_token: req.session.refreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 50
    });

    const messages = listRes.data.messages || [];

    const emailPromises = messages.map(async (message) => {
      const msgRes = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      const email = msgRes.data;
      const headers = email.payload.headers;
      
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      let body = '';
      if (email.payload.parts) {
        const textPart = email.payload.parts.find(part => part.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      } else if (email.payload.body?.data) {
        body = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
      }

      const emailCategory = await categorizeEmail(subject, body, from);

      return {
        id: email.id,
        subject,
        from,
        date,
        category: emailCategory,
        snippet: email.snippet
      };
    });

    const categorizedEmails = await Promise.all(emailPromises);

    // Filter by category
    const filtered = category === 'all' 
      ? categorizedEmails 
      : categorizedEmails.filter(e => e.category === category);

    res.json({ emails: filtered });

  } catch (error) {
    console.error('Error fetching emails by category:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

module.exports = router;
