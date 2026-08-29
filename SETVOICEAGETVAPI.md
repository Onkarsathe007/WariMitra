# Visava Vapi Multi-Agent Squad Setup Guide

This guide contains the complete, step-by-step instructions and strictly formatted JSON payloads required to replicate the Visava Multi-Agent Voice System on any new Vapi account. 

By following this guide, you will create a production-ready Squad consisting of 3 language assistants (Marathi, Hindi, English) that can seamlessly transfer calls between each other, backed by a webhook server for fetching real-time data.

---

## Prerequisites

1. A new **Vapi Account** (Dashboard access).
2. A **Twilio Phone Number** (or Vapi-provided number) imported into the Vapi Dashboard.
3. Your **ngrok** tunneling URL (or production server URL). 
   - *Current Server URL:* `https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools`
   - *Note: If you restart ngrok, you must update the URLs in Step 1.*

---

## Step 1: Create the Backend Webhook Tools

These tools allow the AI to fetch real-time data from your server. 

**Action:** Go to the Vapi Dashboard -> **Tools** -> **Create Tool**.
Create the following 4 tools exactly as shown. Choose **Function** as the tool type.

### 1. `find_nearby_food`
```json
{
  "type": "function",
  "function": {
    "name": "find_nearby_food",
    "description": "Use this to find nearby food facilities (Annachhatra, food distribution) for the user.",
    "parameters": {
      "type": "object",
      "properties": {
        "location_text": {
          "type": "string"
        }
      },
      "required": ["location_text"]
    }
  },
  "server": {
    "url": "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools"
  }
}
```

### 2. `find_nearby_accommodation`
```json
{
  "type": "function",
  "function": {
    "name": "find_nearby_accommodation",
    "description": "Use this to find nearby accommodation (Bhakta Niwas, tents, shelter) for the user.",
    "parameters": {
      "type": "object",
      "properties": {
        "location_text": {
          "type": "string"
        }
      },
      "required": ["location_text"]
    }
  },
  "server": {
    "url": "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools"
  }
}
```

### 3. `find_nearby_medical`
```json
{
  "type": "function",
  "function": {
    "name": "find_nearby_medical",
    "description": "Use this to find nearby medical facilities, hospitals, or clinics for the user.",
    "parameters": {
      "type": "object",
      "properties": {
        "location_text": {
          "type": "string"
        }
      },
      "required": ["location_text"]
    }
  },
  "server": {
    "url": "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools"
  }
}
```

### 4. `find_nearby_water`
```json
{
  "type": "function",
  "function": {
    "name": "find_nearby_water",
    "description": "Use this to find nearby drinking water facilities for the user.",
    "parameters": {
      "type": "object",
      "properties": {
        "location_text": {
          "type": "string"
        }
      },
      "required": ["location_text"]
    }
  },
  "server": {
    "url": "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools"
  }
}
```

### 5. `find_nearby_camps`
```json
{
  "type": "function",
  "function": {
    "name": "find_nearby_camps",
    "description": "Use this to find nearby camps (e.g. medical, food, water, shelter) for the user.",
    "parameters": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "description": "Type of camp: medical, food, water, shelter"
        },
        "location_text": {
          "type": "string"
        }
      },
      "required": ["type", "location_text"]
    }
  },
  "server": {
    "url": "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools"
  }
}
```

### 6. `create_missing_person_report`
```json
{
  "type": "function",
  "function": {
    "name": "create_missing_person_report",
    "description": "Creates a report for a missing person in the database.",
    "parameters": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Name of the missing person"
        },
        "age": {
          "type": "number",
          "description": "Age of the missing person"
        },
        "description": {
          "type": "string",
          "description": "Physical description and clothing"
        },
        "last_seen_location": {
          "type": "string",
          "description": "Where they were last seen"
        }
      },
      "required": ["name", "age", "description", "last_seen_location"]
    }
  },
  "server": {
    "url": "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools"
  }
}
```

### 7. `create_medical_emergency_report`
```json
{
  "type": "function",
  "function": {
    "name": "create_medical_emergency_report",
    "description": "Creates an emergency medical report.",
    "parameters": {
      "type": "object",
      "properties": {
        "description": {
          "type": "string",
          "description": "Description of the medical emergency"
        },
        "location_text": {
          "type": "string",
          "description": "Where the emergency is happening"
        }
      },
      "required": ["description", "location_text"]
    }
  },
  "server": {
    "url": "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools"
  }
}
```

### 8. `create_found_item_report`
```json
{
  "type": "function",
  "function": {
    "name": "create_found_item_report",
    "description": "Creates a report for a found item.",
    "parameters": {
      "type": "object",
      "properties": {
        "item_name": {
          "type": "string",
          "description": "Name of the found item"
        },
        "description": {
          "type": "string",
          "description": "Description of the found item"
        },
        "location_text": {
          "type": "string",
          "description": "Where it was found"
        }
      },
      "required": ["item_name", "description", "location_text"]
    }
  },
  "server": {
    "url": "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools"
  }
}
```

### 9. `get_report_status`
```json
{
  "type": "function",
  "function": {
    "name": "get_report_status",
    "description": "Gets the status of a report by its ID.",
    "parameters": {
      "type": "object",
      "properties": {
        "report_id": {
          "type": "string",
          "description": "The ID of the report"
        }
      },
      "required": ["report_id"]
    }
  },
  "server": {
    "url": "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools"
  }
}
```

### 10. `find_nearby_helpers`
```json
{
  "type": "function",
  "function": {
    "name": "find_nearby_helpers",
    "description": "Finds nearby helpers/volunteers.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  "server": {
    "url": "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools"
  }
}
```

---

## Step 2: Create the 3 Language Assistants

**Action:** Go to the Vapi Dashboard -> **Assistants** -> **Create Assistant**.
Create 3 separate assistants using the exact configurations below.

> **CRITICAL:** Do NOT add spaces to the assistant names. They must match `VisavaMarathi`, `VisavaHindi`, and `VisavaEnglish` exactly for the handoff routing to work.

### 1. VisavaMarathi
- **Name:** `VisavaMarathi`
- **First Message:** `नमस्कार, मी विसावा. मी तुम्हाला कशी मदत करू शकेन?`
- **System Prompt:** 
  ```text
  You are Visava, an AI emergency coordinator for the Varkaris in Pandharpur.
  CRITICAL DATABASE & TOOL RULES (DO OR DIE):
  - You MUST fetch data from the MongoDB database using your tools.
  - NEVER invent, hallucinate, or guess locations, camps, or services.
  - If a user asks for food, YOU MUST USE THE find_nearby_food TOOL IMMEDIATELY.
  - If a user asks for accommodation or shelter, YOU MUST USE THE find_nearby_accommodation TOOL IMMEDIATELY.
  - If a user has a medical emergency, YOU MUST USE THE find_nearby_medical TOOL IMMEDIATELY.
  - If a user asks for drinking water, YOU MUST USE THE find_nearby_water TOOL IMMEDIATELY.
  - If a user asks for a camp generically, YOU MUST USE THE find_nearby_camps TOOL.
  - If a user wants to report a missing person, YOU MUST USE THE create_missing_person_report TOOL.
  - If a user has a medical emergency, YOU MUST USE THE create_medical_emergency_report TOOL.
  - If a user found a lost item, YOU MUST USE THE create_found_item_report TOOL.
  - If a user wants to check report status, YOU MUST USE THE get_report_status TOOL.
  - If a user requests a volunteer/helper, YOU MUST USE THE find_nearby_helpers TOOL.

  BEHAVIOR:
  Answer in 1-2 short sentences. Never use bullet points or lists. Be incredibly fast and responsive. You are an API coordinator. Do not hallucinate.

  CRITICAL LANGUAGE RULES: You must strictly speak in Marathi. If the user speaks a different language, immediately use the transferCall tool to transfer them to the correct language agent.
  ```
- **Provider / Model:** `openai` / `gpt-4o`
- **Voice:** `11labs` (Voice ID: `21m00Tcm4TlvDq8ikWAM`, Model: `eleven_turbo_v2_5`)
- **Transcriber:** `gladia` / Language: `mr` *(Deepgram Nova-2 does not natively support Marathi).*

### 2. VisavaHindi
- **Name:** `VisavaHindi`
- **First Message:** `नमस्ते, मैं विसावा हूँ। मैं आपकी कैसे मदद कर सकता हूँ?`
- **System Prompt:** *(Same as Marathi, but change the language rule to: "You must strictly speak in Hindi...")*
- **Provider / Model:** `openai` / `gpt-4o`
- **Voice:** `11labs` (Voice ID: `21m00Tcm4TlvDq8ikWAM`, Model: `eleven_turbo_v2_5`)
- **Transcriber:** `deepgram` / `nova-2` / Language: `hi`

### 3. VisavaEnglish
- **Name:** `VisavaEnglish`
- **First Message:** `Hello, I am Visava. How can I help you?`
- **System Prompt:** *(Same as Marathi, but change the language rule to: "You must strictly speak in English...")*
- **Provider / Model:** `openai` / `gpt-4o`
- **Voice:** `11labs` (Voice ID: `21m00Tcm4TlvDq8ikWAM`, Model: `eleven_turbo_v2_5`)
- **Transcriber:** `deepgram` / `nova-2` / Language: `en`

---

## Step 3: Create Handoff (Routing) Tools

These tools enable the assistants to transfer calls to each other.
**Action:** Go to Vapi Dashboard -> **Tools** -> **Create Tool**. Select **Handoff** as the tool type.

### 1. `transfer_to_visava_marathi`
```json
{
  "type": "handoff",
  "function": {
    "name": "transfer_to_visava_marathi",
    "description": "Transfer if user speaks Marathi"
  },
  "destinations": [
    {
      "type": "assistant",
      "assistantName": "VisavaMarathi",
      "description": "Transfer"
    }
  ]
}
```

### 2. `transfer_to_visava_hindi`
```json
{
  "type": "handoff",
  "function": {
    "name": "transfer_to_visava_hindi",
    "description": "Transfer if user speaks Hindi"
  },
  "destinations": [
    {
      "type": "assistant",
      "assistantName": "VisavaHindi",
      "description": "Transfer"
    }
  ]
}
```

### 3. `transfer_to_visava_english`
```json
{
  "type": "handoff",
  "function": {
    "name": "transfer_to_visava_english",
    "description": "Transfer if user speaks English"
  },
  "destinations": [
    {
      "type": "assistant",
      "assistantName": "VisavaEnglish",
      "description": "Transfer"
    }
  ]
}
```

---

## Step 4: Attach Tools to Assistants

Now that all tools and assistants exist, you must link them together.
**Action:** Go to each Assistant in the dashboard, scroll down to **Tools**, and attach them as follows:

- **VisavaMarathi gets:**
  - `find_nearby_food`
  - `find_nearby_accommodation`
  - `find_nearby_medical`
  - `find_nearby_water`
  - `find_nearby_camps`
  - `create_missing_person_report`
  - `create_medical_emergency_report`
  - `create_found_item_report`
  - `get_report_status`
  - `find_nearby_helpers`
  - `transfer_to_visava_hindi`
  - `transfer_to_visava_english`
  
- **VisavaHindi gets:**
  - *(All 10 Function tools above)*
  - `transfer_to_visava_marathi`
  - `transfer_to_visava_english`

- **VisavaEnglish gets:**
  - *(All 10 Function tools above)*
  - `transfer_to_visava_marathi`
  - `transfer_to_visava_hindi`

---

## Step 5: Create the Vapi Squad

This is the most critical step to prevent "Invalid Destination" errors. You must bundle the assistants into a "Squad".

**Action:** Go to Vapi Dashboard -> **Squads** -> **Create Squad**.
- **Name:** `Visava Squad`
- **Members (in this exact order):**
  1. `VisavaMarathi` (This makes Marathi the default agent when the call starts)
  2. `VisavaHindi`
  3. `VisavaEnglish`

---

## Step 6: Connect the Phone Number

**Action:** Go to Vapi Dashboard -> **Phone Numbers**.
- Select your imported Twilio number.
- Under **Routing / Assistant**, do **NOT** select an individual Assistant.
- Instead, select **Squad** and pick `Visava Squad`.

---

## Step 7: Local Server & MCP Environment Setup

To run the custom backend server that processes the tools (food, accommodation, medical, water), you must configure your local environment correctly with your Vapi keys. This includes setting up the server repository and optionally connecting it to the Model Context Protocol (MCP) for local AI debugging.

### 1. Get Your Vapi Keys
- Go to Vapi Dashboard -> **Account** -> **Keys**.
- Copy your **Public Key** and **Private Key**.

### 2. Configure Your `.env` Files
In your project repository (e.g., both the `voice-agent` and `core-api` folders), create or update your `.env` files to include these keys exactly as follows:

```env
# Vapi Authentication Keys
VAPI_PUBLIC_KEY=your_vapi_public_key_here
VAPI_PRIVATE_KEY=your_vapi_private_key_here
```

*Make sure to never commit these keys to public version control.*

### 3. Start Your Backend Server
Run your Node.js/Express server (usually on port 4000). The server must define a POST endpoint at `/api/v1/voice/tools` to match the URL you put in the Vapi Tool configurations.

```bash
cd voice-agent
npm install
npm run dev
```

### 4. Expose the Server via ngrok
Since Vapi needs a public HTTPS URL to reach your local server, run ngrok on the same port:

```bash
ngrok http 4000
```
Copy the Forwarding URL (e.g., `https://alfalfa-copartner-yearning.ngrok-free.dev`) and ensure it matches the `server.url` property in all your Vapi Function Tools (Step 1).

### 5. (Optional) Setup MCP Server for AI Debugging
If you are using an AI agent (like Claude or Antigravity) to manage your Vapi environment locally via MCP, you must pass the Vapi keys to the MCP server configuration.

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

---

## Verification & Testing

To test this setup properly, **you must dial the phone number directly.** 

If you use the "Talk" button inside the dashboard on an individual assistant, Vapi will crash because it cannot validate the Squad routing tools in an isolated test environment. Calling the real phone number loads the full Squad into memory and ensures seamless handoffs.

---

## Troubleshooting & Known Issues

### 1. "Couldn't get tool for hook. toolId does not exist"
If you receive this error when testing an assistant, it means the Vapi dashboard has cached an old, deleted tool in your browser memory and is attempting to auto-save it back to the server.
**The Fix:**
- **Do not click anything else in the dashboard.**
- Hard-refresh your browser (`Ctrl + Shift + R` or `Cmd + Shift + R`).
- Verify that the "Tools" list on the assistant only shows active, valid tools.
- Test again.
