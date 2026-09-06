# WhatsApp Gemini Bot

A small webhook service that receives WhatsApp text messages from 360dialog, sends the text to Google Gemini, and replies to the same WhatsApp user.

## Required environment variables

- `GEMINI_API_KEY`
- `D360_API_KEY`

Optional:
- `D360_MESSAGES_URL` — defaults to `https://waba-v2.360dialog.io/messages`
- `GEMINI_MODEL` — defaults to `gemini-3.7-flash`

## Render

Build command: `npm install`

Start command: `npm start`

Webhook path after deploy: `/webhook`

Never commit API keys to GitHub.
