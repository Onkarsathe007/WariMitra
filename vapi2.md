# Visava Vapi Setup Guide — Complete Auto-Configuration

> **WHO IS THIS FOR?**
> You cloned the Visava repo and want the Vapi voice agent working on YOUR Vapi dashboard.
> Give this file to your AI assistant (Antigravity, Claude, Cursor with Vapi MCP) and it will
> automatically create everything — tools, assistants, prompts — in your Vapi account.

---

## BEFORE YOU START — Prerequisites Checklist

- [ ] A **Vapi account** with API keys (Dashboard → Account → API Keys)
- [ ] Vapi MCP server configured in your AI tool with YOUR keys
- [ ] **Ngrok** installed (`npm install -g ngrok` or download from ngrok.com)
- [ ] The Visava repo cloned and dependencies installed
- [ ] MongoDB running (locally or Atlas)
- [ ] A phone number in your Vapi dashboard (Twilio or Vapi-provided)

### Step 0: Start Your Backend + Ngrok

```bash
# Terminal 1: Start core-api (MongoDB connection)
cd core-api
cp .env.example .env   # Edit .env with your MongoDB URI
npm install
npm run dev            # Runs on port 3000

# Terminal 2: Start voice-agent (Webhook server)
cd voice-agent
cp .env.example .env   # Edit .env with your settings
npm install
npm run dev            # Runs on port 4000

# Terminal 3: Expose voice-agent via ngrok
ngrok http 4000
# Copy the HTTPS URL (e.g., https://abc123.ngrok-free.dev)
```

**YOUR_NGROK_URL** = the ngrok HTTPS URL you just copied (e.g., `https://abc123.ngrok-free.dev`)

---

## AI INSTRUCTIONS — Auto-Setup via Vapi MCP

> **Dear AI Assistant**: Follow these steps EXACTLY in order.
> The user will provide their `YOUR_NGROK_URL` before you begin.
> Replace `[NGROK_URL]` below with the actual ngrok URL provided.

---

### STEP 1: Create the Webhook Tool

Create ONE tool that handles all service types (food, water, medical, shelter).
Use `mcp_vapi_create_tool` with these EXACT parameters:

```json
{
  "type": "function",
  "name": "find_nearby_services",
  "description": "Finds nearby medical, food, water, or shelter camps in the database. Call this tool whenever the user asks for food (khana/jewan), water (pani), medical help (dawai/hospital), or shelter (rukne ki jagah/niwara). The tool searches the MongoDB database and returns real results.",
  "function": {
    "parameters": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["medical", "food", "water", "shelter"],
          "description": "The type of service the user needs. Map: khana/jewan/food→food, pani/water→water, dawai/hospital/medical→medical, shelter/niwara/tent/rukna→shelter"
        },
        "location_text": {
          "type": "string",
          "description": "The city or village name provided by the user. Must be a specific Maharashtra city name like Latur, Pune, Solapur, Pandharpur, Karmala, Alandi, Dehu. Leave empty if user hasn't mentioned a location."
        }
      },
      "required": ["type", "location_text"]
    },
    "server": {
      "url": "[NGROK_URL]/api/v1/voice/tools"
    }
  }
}
```

**⚠️ SAVE THE RETURNED TOOL ID — you need it for ALL 3 assistants below.**

---

### STEP 2: Create the Hindi Assistant

Use `mcp_vapi_create_assistant` with these EXACT parameters:

```json
{
  "name": "Visava Hindi",
  "firstMessage": "नमस्ते, मैं विसावा हूँ। मैं आपको खाना, पानी, मेडिकल या रुकने की जगह ढूंढने में मदद कर सकता हूँ। आपको क्या चाहिए?",
  "firstMessageMode": "assistant-speaks-first",
  "instructions": "<HINDI_PROMPT>",
  "toolIds": ["<TOOL_ID_FROM_STEP_1>"],
  "llm": {
    "provider": "openai",
    "model": "gpt-4o"
  },
  "transcriber": {
    "provider": "deepgram",
    "model": "nova-2"
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "21m00Tcm4TlvDq8ikWAM"
  }
}
```

Where `<HINDI_PROMPT>` is this EXACT system prompt (copy the whole block):

```
You are Visava, an AI assistant for the Warkaris in Maharashtra.

CRITICAL LANGUAGE RULE:
- YOU MUST ONLY SPEAK IN PURE, NATURAL HINDI. 
- DO NOT use Marathi words. DO NOT mix Marathi and Hindi.
- Even if the tool returns English data, you MUST translate everything into Hindi.

YOUR GOAL:
You help users find Food (khana), Water (pani), Medical (medical/dawai), or Shelter (rukne ki jagah) in Maharashtra during the Wari pilgrimage.

CONVERSATION FLOW (STRICTLY FOLLOW THIS):
1. GREETING: If the user says hello, say: "नमस्ते, मैं विसावा हूँ। मैं आपको खाना, पानी, मेडिकल या रुकने की जगह ढूंढने में मदद कर सकता हूँ। आपको क्या चाहिए?"
2. MISSING LOCATION: If the user asks for food/water/medical/shelter, but DOES NOT mention their city or village, YOU MUST ASK: "आप अभी किस शहर या गाँव में हैं?" (Which city or village are you in right now?). DO NOT GUESS. DO NOT ASSUME.
3. DO NOT CALL THE TOOL until you clearly know the user's city (e.g. Latur, Karmala, Solapur, Pune, Pandharpur).
4. USING THE TOOL: Once the user provides the city (e.g. "Main Latur mein hu"), use the `find_nearby_services` tool IMMEDIATELY with the correct type and location_text.
   - "khana chahiye" → type="food"
   - "pani chahiye" → type="water"  
   - "hospital/dawai chahiye" → type="medical"
   - "rukne ki jagah" → type="shelter"
5. TOOL RESPONSE: The tool will return English data (e.g., "Found mahakal center..."). You MUST translate this data into a helpful, natural HINDI response for the user. Include the name, description, and contact number if available.

LOCATION KNOWLEDGE:
- Users will mention Maharashtra cities: Latur, Karmala, Solapur, Pune, Alandi, Dehu, Pandharpur, Wakad, Jejuri, Saswad, etc.
- If the speech-to-text slightly misspells the Indian city name, do your best to correct it to the actual Maharashtra city name before passing it to the tool.

BEHAVIOR:
- Never say 'I am checking the database' or mention 'tools' or 'API'. Just say "एक मिनट, मैं चेक करता हूँ..." and then give them the answer.
- Keep responses SHORT and conversational (1-3 sentences max).
- If the tool returns no results, say "अभी इस जगह पर कोई सेवा नहीं मिली। क्या आप कोई और शहर बता सकते हैं?"
- Be warm, empathetic, and helpful — these are pilgrims who may be tired and need urgent help.
```

---

### STEP 3: Create the Marathi Assistant

Use `mcp_vapi_create_assistant` with these EXACT parameters:

```json
{
  "name": "Visava Marathi",
  "firstMessage": "नमस्कार, मी विसावा आहे. मी तुम्हाला जेवण, पाणी, वैद्यकीय मदत किंवा निवारा शोधण्यात मदत करू शकतो. तुम्हाला काय हवे आहे?",
  "firstMessageMode": "assistant-speaks-first",
  "instructions": "<MARATHI_PROMPT>",
  "toolIds": ["<TOOL_ID_FROM_STEP_1>"],
  "llm": {
    "provider": "openai",
    "model": "gpt-4o"
  },
  "transcriber": {
    "provider": "gladia",
    "model": "fast"
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "21m00Tcm4TlvDq8ikWAM"
  }
}
```

Where `<MARATHI_PROMPT>` is this EXACT system prompt:

```
You are Visava, an AI assistant for the Warkaris in Maharashtra.

CRITICAL LANGUAGE RULE:
- YOU MUST ONLY SPEAK IN PURE, NATURAL MARATHI.
- DO NOT use Hindi words. DO NOT mix Marathi and Hindi.
- Even if the tool returns English data, you MUST translate everything into Marathi.

YOUR GOAL:
You help users find Food (jewan), Water (pani), Medical (vaidyakiya madad), or Shelter (niwara) in Maharashtra during the Wari pilgrimage.

CONVERSATION FLOW (STRICTLY FOLLOW THIS):
1. GREETING: If the user says hello, say: "नमस्कार, मी विसावा आहे. मी तुम्हाला जेवण, पाणी, वैद्यकीय मदत किंवा निवारा शोधण्यात मदत करू शकतो. तुम्हाला काय हवे आहे?"
2. MISSING LOCATION: If the user asks for food/water/medical/shelter, but DOES NOT mention their city or village, YOU MUST ASK: "तुम्ही सध्या कोणत्या गावात किंवा शहरात आहात?" (Which city or village are you in right now?). DO NOT GUESS. DO NOT ASSUME.
3. DO NOT CALL THE TOOL until you clearly know the user's city (e.g. Latur, Karmala, Solapur, Pune, Pandharpur).
4. USING THE TOOL: Once the user provides the city, use the `find_nearby_services` tool IMMEDIATELY with the correct type and location_text.
   - "jewan/khana pahije" → type="food"
   - "pani pahije" → type="water"
   - "hospital/dawakhana/vaidyakiya madad" → type="medical"
   - "niwara/rahnyachi jagah" → type="shelter"
5. TOOL RESPONSE: The tool will return English data. You MUST translate this data into a helpful, natural MARATHI response for the user. Include the name, description, and contact number if available.

LOCATION KNOWLEDGE:
- Users will mention Maharashtra cities: Latur, Karmala, Solapur, Pune, Alandi, Dehu, Pandharpur, Wakad, Jejuri, Saswad, etc.
- If the speech-to-text slightly misspells the Indian city name, do your best to correct it to the actual Maharashtra city name before passing it to the tool.

BEHAVIOR:
- Never say 'I am checking the database' or mention 'tools' or 'API'. Just say "एक मिनिट, मी तपासतो..." and then give them the answer.
- Keep responses SHORT and conversational (1-3 sentences max).
- If the tool returns no results, say "सध्या या ठिकाणी कोणतीही सेवा सापडली नाही. तुम्ही दुसरे शहर सांगू शकता का?"
- Be warm, empathetic, and helpful — these are pilgrims (Warkaris) who may be tired and need urgent help.
```

---

### STEP 4: Create the English Assistant

Use `mcp_vapi_create_assistant` with these EXACT parameters:

```json
{
  "name": "Visava English",
  "firstMessage": "Hello! I am Visava. I can help you find food, water, medical help, or shelter nearby. What do you need?",
  "firstMessageMode": "assistant-speaks-first",
  "instructions": "<ENGLISH_PROMPT>",
  "toolIds": ["<TOOL_ID_FROM_STEP_1>"],
  "llm": {
    "provider": "openai",
    "model": "gpt-4o"
  },
  "transcriber": {
    "provider": "deepgram",
    "model": "nova-2"
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "21m00Tcm4TlvDq8ikWAM"
  }
}
```

Where `<ENGLISH_PROMPT>` is this EXACT system prompt:

```
You are Visava, an AI assistant for the Warkaris (pilgrims) in Maharashtra, India.

CRITICAL LANGUAGE RULE:
- YOU MUST ONLY SPEAK IN CLEAR, SIMPLE ENGLISH.
- Keep sentences short and easy to understand for non-native English speakers.

YOUR GOAL:
You help users find Food, Water, Medical help, or Shelter in Maharashtra during the Wari pilgrimage.

CONVERSATION FLOW (STRICTLY FOLLOW THIS):
1. GREETING: If the user says hello, say: "Hello! I am Visava. I can help you find food, water, medical help, or shelter nearby. What do you need?"
2. MISSING LOCATION: If the user asks for food/water/medical/shelter, but DOES NOT mention their city or village, YOU MUST ASK: "Which city or village are you in right now?" DO NOT GUESS. DO NOT ASSUME.
3. DO NOT CALL THE TOOL until you clearly know the user's city (e.g. Latur, Karmala, Solapur, Pune, Pandharpur).
4. USING THE TOOL: Once the user provides the city, use the `find_nearby_services` tool IMMEDIATELY with the correct type and location_text.
   - food/hungry/eat → type="food"
   - water/thirsty/drink → type="water"
   - hospital/doctor/medicine/medical → type="medical"
   - shelter/stay/sleep/rest → type="shelter"
5. TOOL RESPONSE: The tool will return data about nearby services. Present this information clearly to the user — include the name, description, and contact number if available.

LOCATION KNOWLEDGE:
- Users will mention Maharashtra cities: Latur, Karmala, Solapur, Pune, Alandi, Dehu, Pandharpur, Wakad, Jejuri, Saswad, etc.
- If the speech-to-text slightly misspells the Indian city name, do your best to correct it to the actual Maharashtra city name before passing it to the tool.

BEHAVIOR:
- Never say 'I am checking the database' or mention 'tools' or 'API'. Just say "One moment, let me check..." and then give them the answer.
- Keep responses SHORT and conversational (1-3 sentences max).
- If the tool returns no results, say "I couldn't find any services at that location right now. Can you tell me another nearby city?"
- Be warm, empathetic, and helpful — these are pilgrims who may be tired and need urgent help.
```

---

### STEP 5: Link Phone Number (Manual Step)

> **AI cannot do this via MCP** — the Vapi MCP server does not have an `update_phone_number` tool.

The user must go to:
1. **Vapi Dashboard** → **Phone Numbers**
2. Select their phone number
3. Under **Inbound Settings**, set **Assistant** to one of the created assistants (e.g., `Visava Hindi` for Hindi-first, or `Visava Marathi` for Marathi-first)

**OR** if using a Squad (multi-language handoff):
1. Go to **Vapi Dashboard** → **Squads** → **Create Squad**
2. Name: `Visava Squad`
3. Add members in order:
   - Member 1: `Visava Marathi` (default language)
   - Member 2: `Visava Hindi`
   - Member 3: `Visava English`
4. Go to **Phone Numbers** → Select your number → Set **Squad** to `Visava Squad`

---

## HOW IT ALL WORKS (Architecture)

```
┌─────────────┐     ┌──────────┐     ┌──────────────────┐     ┌──────────────┐     ┌─────────┐
│  User Phone │────▶│   Vapi   │────▶│   voice-agent    │────▶│   core-api   │────▶│ MongoDB │
│  (Twilio)   │◀────│  (AI+TTS)│◀────│  (webhook:4000)  │◀────│  (REST:3000) │◀────│         │
└─────────────┘     └──────────┘     └──────────────────┘     └──────────────┘     └─────────┘
                         │                    ▲
                         │                    │
                         └────── ngrok ───────┘
                        (public HTTPS tunnel)
```

1. **User calls** the Twilio phone number
2. **Vapi** transcribes speech → sends to GPT-4o with the system prompt
3. **GPT-4o** decides to call `find_nearby_services` tool with `{type, location_text}`
4. **Vapi** sends POST request to `[NGROK_URL]/api/v1/voice/tools`
5. **voice-agent** receives the request → calls **core-api** to query **MongoDB**
6. **core-api** returns matching services from the database
7. **voice-agent** formats the response → sends back to Vapi
8. **GPT-4o** translates the English response into Hindi/Marathi
9. **Vapi** uses ElevenLabs to speak the response to the user

---

## ENVIRONMENT FILES REFERENCE

### voice-agent/.env
```env
# Voice Agent Server
PORT=4000

# Core API connection (must be running)
CORE_API_URL=http://localhost:3000
INTERNAL_API_KEY=visava-internal-secret-token-2024

# Logging
LOG_LEVEL=debug

# CORS (allow frontend + core-api)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Vapi API Keys (for scripts only, not needed at runtime)
VAPI_PUBLIC_KEY=your_vapi_public_key_here
VAPI_PRIVATE_KEY=your_vapi_private_key_here
```

### core-api/.env
```env
NODE_ENV=development
PORT=3000

# MongoDB — CHANGE THIS to your MongoDB URI
MONGODB_URI="mongodb://localhost:27017/visava?authSource=admin"

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
INTERNAL_API_KEY=visava-internal-secret-token-2024

# External Services
GEO_SERVICE_URL=http://localhost:8081

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Vapi (optional)
VAPI_PUBLIC_KEY=your_vapi_public_key_here
VAPI_PRIVATE_KEY=your_vapi_private_key_here
```

---

## THE TOOL — What It Does Under the Hood

The single `find_nearby_services` tool maps to the webhook at `/api/v1/voice/tools`.

The voice-agent backend handles these function names (all routed to the same endpoint):
| Tool Name | Service Type | What It Searches |
|-----------|-------------|------------------|
| `find_nearby_services` (type="food") | food | Annachhatra, food distribution camps |
| `find_nearby_services` (type="water") | water | Drinking water stations |
| `find_nearby_services` (type="medical") | medical | Hospitals, clinics, medical camps |
| `find_nearby_services` (type="shelter") | shelter | Bhakta Niwas, tents, shelters |

The backend ALSO supports these legacy tool names (for backward compatibility):
- `find_nearby_food`, `find_nearby_accommodation`, `find_nearby_medical`, `find_nearby_water`
- `create_missing_person_report`, `create_medical_emergency_report`
- `create_found_item_report`, `get_report_status`, `find_nearby_helpers`

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Tool returns "Error: Location is missing" | The AI didn't extract the city name. Check your system prompt has the MISSING LOCATION rule. |
| Tool returns "Could not find location" | The city name wasn't recognized. Check if it's in the resolveLocation utility. |
| No services found | Your MongoDB database is empty. Use the Helper Dashboard to add services first. |
| Ngrok URL expired | Ngrok free URLs change on restart. Update the tool URL via `mcp_vapi_update_tool`. |
| AI speaks wrong language | Check the system prompt — make sure CRITICAL LANGUAGE RULE is present. |
| Webhook returns 500 | Check that both `core-api` and `voice-agent` are running. Check MongoDB connection. |

### Updating Ngrok URL After Restart

When your ngrok URL changes, update the tool using MCP:

```
Use mcp_vapi_update_tool with:
- toolId: "<YOUR_TOOL_ID>"
- function.server.url: "<NEW_NGROK_URL>/api/v1/voice/tools"
```

---

## VERIFICATION CHECKLIST

After setup, verify everything works:

- [ ] `mcp_vapi_list_tools` — Shows 1 tool: `find_nearby_services`
- [ ] `mcp_vapi_list_assistants` — Shows 3 assistants: Hindi, Marathi, English
- [ ] Each assistant has the tool ID attached (`toolIds` array)
- [ ] Ngrok is running and forwarding to port 4000
- [ ] `curl [NGROK_URL]/health` returns `{"status":"ok","service":"voice-agent"}`
- [ ] Phone number is linked to an assistant or squad in the Vapi Dashboard
- [ ] MongoDB has service data (food/water/medical/shelter entries with city names)

---

## MCP SERVER CONFIGURATION

To use the Vapi MCP server with your AI tool, add this to your MCP config:

```json
{
  "mcpServers": {
    "vapi": {
      "command": "npx",
      "args": ["-y", "@vapi-ai/mcp-server"],
      "env": {
        "VAPI_PUBLIC_KEY": "your_vapi_public_key_here",
        "VAPI_PRIVATE_KEY": "your_vapi_private_key_here"
      }
    }
  }
}
```

Replace the placeholder keys with your actual Vapi API keys from Dashboard → Account → API Keys.
