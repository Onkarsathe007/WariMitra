# Visava Vapi Multi-Agent Squad Setup Guide

This guide explains how to quickly replicate the Visava Multi-Agent Voice System on any new Vapi account using our automated setup script. 

By following this guide, you will create a production-ready Squad consisting of 3 language assistants (Marathi, Hindi, English) that can seamlessly transfer calls to each other, backed by your local webhook server for fetching real-time data from MongoDB.

---

## Prerequisites

1. A new **Vapi Account** (Dashboard access).
2. A **Twilio Phone Number** (or Vapi-provided number) imported into the Vapi Dashboard.
3. **Ngrok** installed on your local machine to expose the webhook server.

---

## Step 1: Start Your Backend and Ngrok

The AI needs a public HTTPS URL to reach your local backend server.

1. **Start the local server:**
   ```bash
   cd voice-agent
   npm install
   npm run dev
   ```
   *(This starts the webhook server on port 4000).*

2. **Expose the port using ngrok:**
   In a new terminal window, run:
   ```bash
   ngrok http 4000
   ```
3. Copy the **Forwarding URL** provided by ngrok (e.g., `https://abcdefg.ngrok-free.dev`).

---

## Step 2: Create the Basic Assistants in Vapi

Go to the **Vapi Dashboard** -> **Assistants** -> **Create Assistant**.
Create 3 separate blank assistants. **Note down their Assistant IDs** (found in the URL or settings).

1. **VisavaMarathi** 
   - Voice: `11labs` (Voice ID: `21m00Tcm4TlvDq8ikWAM`, Model: `eleven_turbo_v2_5`)
   - Transcriber: `gladia` / Language: `mr`
2. **VisavaHindi**
   - Voice: `11labs` (Voice ID: `21m00Tcm4TlvDq8ikWAM`, Model: `eleven_turbo_v2_5`)
   - Transcriber: `deepgram` / `nova-2` / Language: `hi`
3. **VisavaEnglish**
   - Voice: `11labs` (Voice ID: `21m00Tcm4TlvDq8ikWAM`, Model: `eleven_turbo_v2_5`)
   - Transcriber: `deepgram` / `nova-2` / Language: `en`

---

## Step 3: Run the Automated Setup Script

Instead of manually creating dozens of tools in the dashboard, we have an automated script that creates a single, optimized routing tool and configures all your assistants with perfect prompts.

1. Open `voice-agent/scripts/update-vapi-tools.ts` in your code editor.
2. Update the configuration variables at the top of the file:
   - `VAPI_KEY`: Paste your Vapi Private API Key (from Dashboard -> Account -> Keys).
   - `ASSISTANT_IDS`: Paste the 3 Assistant IDs you generated in Step 2.
   - `server.url`: Replace the hardcoded ngrok URL with **your new ngrok URL** from Step 1, keeping `/api/v1/voice/tools` at the end. *(e.g., `https://abcdefg.ngrok-free.dev/api/v1/voice/tools`)*
3. Run the script:
   ```bash
   cd voice-agent
   npx tsx scripts/update-vapi-tools.ts
   ```
   *You should see "SUCCESS!" logs indicating the tools were created and linked to the assistants.*

---

## Step 4: Create the Squad and Handoff Tools

Now that the assistants are configured with their database tools, we need to link them together.

1. **Create Handoff Tools:**
   Go to Vapi Dashboard -> **Tools** -> **Create Tool**. Select **Handoff** as the type.
   - Create `transfer_to_visava_marathi` (Destination: VisavaMarathi)
   - Create `transfer_to_visava_hindi` (Destination: VisavaHindi)
   - Create `transfer_to_visava_english` (Destination: VisavaEnglish)
   
   Attach these handoff tools to the corresponding assistants (e.g., give Hindi the ability to transfer to Marathi and English).

2. **Create the Squad:**
   Go to Vapi Dashboard -> **Squads** -> **Create Squad**.
   - Name: `Visava Squad`
   - Add Members (in this exact order):
     1. `VisavaMarathi` *(This sets Marathi as the default language)*
     2. `VisavaHindi`
     3. `VisavaEnglish`

---

## Step 5: Connect Your Phone Number

1. Go to Vapi Dashboard -> **Phone Numbers**.
2. Select your imported phone number.
3. Under **Routing**, do **NOT** select an individual Assistant. Select **Squad**, and pick `Visava Squad`.

---

## Step 6: (Optional) Setup MCP Server for AI Debugging

If you are using an AI agent (like Claude, Antigravity, or Cursor) to manage your Vapi environment locally via the Model Context Protocol (MCP), you must pass the Vapi keys to the MCP server configuration.

In your MCP settings file (e.g., `cline_mcp_settings.json` or `claude_desktop_config.json`), configure the `vapi` server like this:

```json
{
  "mcpServers": {
    "vapi": {
      "command": "npx",
      "args": [
        "-y",
        "@vapi-ai/mcp-server"
      ],
      "env": {
        "VAPI_PUBLIC_KEY": "your_vapi_public_key_here",
        "VAPI_PRIVATE_KEY": "your_vapi_private_key_here"
      }
    }
  }
}
```
*Note: Make sure to replace the placeholder strings with your actual Vapi keys!*

---

## 🎯 You're Done!

You can now call your phone number. The Marathi agent will answer. If you reply in Hindi, it will seamlessly hand off to the Hindi agent, which will then query your local MongoDB database via Ngrok to provide real-time Wari updates!
