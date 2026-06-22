# Setup Instructions

## Prerequisites
- Node.js (v14+)
- npm
- Gmail account
- OpenAI API key (for AI categorization)

## Step 1: Google Cloud Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the **Gmail API**
4. Create OAuth 2.0 credentials (Desktop application):
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Desktop application"
   - Download credentials as JSON
5. Copy the `client_id` and `client_secret`

## Step 2: Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create an API key
3. Copy it

## Step 3: Configure Environment
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your credentials:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
OPENAI_API_KEY=your_openai_key_here
SESSION_SECRET=any_random_string_here
PORT=3000
```

## Step 4: Install Dependencies & Run
```bash
# Install backend dependencies
cd backend
npm install

# Start the server
npm start
```

Server will run at `http://localhost:3000`

## Step 5: Use the App
1. Open `http://localhost:3000` in your browser
2. Click "Connect Gmail" button
3. Authorize your Gmail account
4. Emails will be automatically fetched and categorized by:
   - **Internship** - Internship opportunities
   - **Placement** - Full-time jobs
   - **Research** - Research papers & collaborations
   - **Project** - Hackathons & coding competitions

## Features
- ✅ OAuth2 Gmail authentication
- ✅ AI-powered email categorization (using ChatGPT)
- ✅ Real-time email fetching
- ✅ Filter by category, batch, and branch
- ✅ Fallback keyword-based categorization if AI fails
- ✅ Session management

## Troubleshooting
- **"Not authenticated"**: Make sure you clicked "Connect Gmail" first
- **API errors**: Check that your Google OAuth credentials are correct
- **No emails showing**: Gmail might have rate limits; try after 1 minute
- **Categorization not working**: Verify OpenAI API key is valid
