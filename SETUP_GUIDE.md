# WariMitra (Visava) - Backend & AI Voice Agent Setup Guide

This guide explains how to run the `core-api`, start the `voice-agent` webhook, set up the Ngrok tunnel, and configure Vapi to communicate with the system.

## 1. Project Structure
- `core-api/`: The Express + MongoDB backend that handles the database operations for camps, services, and reports.
- `voice-agent/`: The Express webhook backend that Vapi calls to execute functions (e.g., finding nearby shelters, reporting missing persons).

## 2. Prerequisites
1. **Node.js**: Ensure Node.js (v18 or higher) is installed.
2. **MongoDB Atlas**: A valid MongoDB connection string.
3. **Ngrok**: Installed globally or a valid Ngrok static domain.
4. **Vapi Account**: A Vapi account for the voice AI.

## 3. Environment Variables

### Core API (`core-api/.env`)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/visava?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
TWILIO_ACCOUNT_SID=dummy
TWILIO_AUTH_TOKEN=dummy
TWILIO_PHONE_NUMBER=dummy
```

### Voice Agent Webhook (`voice-agent/.env`)
```env
PORT=4000
CORE_API_URL=http://localhost:3000
INTERNAL_API_KEY=your_internal_secret_key_here
```

## 4. Running the Servers Locally

### Terminal 1: Start the Core API
```bash
cd core-api
npm install
npm run dev
```
*The Core API will run on `http://localhost:3000`.*

### Terminal 2: Start the Voice Agent Webhook
```bash
cd voice-agent
npm install
npm run dev
```
*The Voice Agent will run on `http://localhost:4000`.*

## 5. Setting up the Ngrok Tunnel
Because Vapi is a cloud service, it needs a public URL to talk to your local Voice Agent (`http://localhost:4000`).
In a new terminal, run your Ngrok static domain command:

```bash
ngrok http --url=entire-smartly-municipal.ngrok-free.dev 4000
```
*Your webhook URL for Vapi will now be: `https://entire-smartly-municipal.ngrok-free.dev/api/v1/voice/tools`*

## 6. Vapi Assistant Configuration
Instead of manually typing out the tools in the Vapi GUI (which can be error-prone), use the provided JSON configuration.

1. Open `vapi-assistant-config.json` in the project root.
2. Ensure the `server.url` in every tool points to your exact Ngrok URL.
3. In the Vapi Dashboard, create a new Assistant, click **Import JSON**, and paste the contents of `vapi-assistant-config.json`.
4. Set the **Transcriber** to `Deepgram` (Model: `Nova-2`, Language: `hi`).
5. Ensure the LLM model is set to `gpt-4o`.

*(Note: Avoid editing the model provider or tools heavily through the Vapi GUI as it can accidentally erase inline tool configurations.)*

## 7. How the AI Voice Loop Works
1. You speak to the Vapi Assistant (e.g., "Find a shelter near Pandharpur").
2. Vapi triggers the `find_nearby_services` tool and sends a POST request to your Ngrok URL.
3. The `voice-agent` webhook receives this request.
4. It instantly translates "Pandharpur" to exact coordinates (bypassing slow external APIs).
5. It queries the `core-api` database for the nearest 5 shelters.
6. The `core-api` returns the list.
7. The `voice-agent` formats the result into a clean string and returns it to Vapi.
8. The AI reads the result back to you in Marathi/English.
