# Opportunities Informer

A web application that connects to a user's Gmail account, filters college-related emails, categorizes them using AI, and displays opportunities in a clean dashboard.

---

# Tech Stack

- Node.js
- Express.js
- MySQL
- Gmail API
- Google OAuth 2.0
- OpenAI API (optional, currently falls back to keyword-based categorization)

---

# Clone the Repository

```bash
git clone https://github.com/Abhinandan-boop/Opportunities-Informer.git
cd Opportunities-Informer
```

---

# Install Dependencies

Frontend

```bash
npm install
```

Backend

```bash
cd backend
npm install
```

---

# MySQL Setup

1. Install MySQL.
2. Create a database named:

```sql
CREATE DATABASE OpBox;
```

3. Import/run the SQL schema provided in the project.

4. Update your MySQL credentials in `.env` or `db.js`.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=OpBox
```

---

# Google OAuth Setup

## 1. Create a Google Cloud Project

- Go to Google Cloud Console
- Create a new project

---

## 2. Enable APIs

Enable:

- Gmail API
- Google People API

---

## 3. Configure OAuth

Create an OAuth Client ID.

Application Type:

```
Web Application
```

Authorized Redirect URI

```
http://localhost:3000/auth/google/callback
```

---

## 4. Download OAuth Credentials

Download the credentials JSON file.

Place it in the project root as:

```
credentials.json
```

---

# Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

OPENAI_API_KEY=YOUR_OPENAI_KEY

SESSION_SECRET=any_random_long_string

PORT=3000

NODE_ENV=development
```

Replace:

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- OPENAI_API_KEY
- SESSION_SECRET
- MySQL password

with your own values.

---

# Run the Project

Backend

```bash
cd backend
npm start
```

Frontend

```bash
npm start
```

---

# Notes

- Each user logs in using their own Google account.
- Gmail emails are fetched directly from the authenticated user's inbox.
- User information is stored in MySQL.
- If no OpenAI API key is provided, the application automatically falls back to keyword-based categorization.

---

# Common Issues

## Google OAuth Error

Check:

- `credentials.json` exists.
- Redirect URI matches exactly:

```
http://localhost:3000/auth/google/callback
```

- Gmail API is enabled.

---

## MySQL Connection Error

Verify:

- MySQL server is running.
- Database name is `OpBox`.
- Username and password are correct.

---

## OpenAI Warning

If you see:

```
OPENAI_API_KEY is not set.
Using keyword-based categorization fallback.
```

This is expected if no OpenAI key has been added.

The application will still work.

---

# Project Status

✅ Google OAuth

✅ Gmail API Integration

✅ MySQL Database

✅ User Authentication

🚧 AI-based Opportunity Extraction

🚧 Smart Recommendations

🚧 Saved Opportunities
