# The Visava Voice Agent: Complete Architecture & Replication Guide

This document is the ultimate reference guide for the Visava Voice Agent. It contains the exact architecture, the complete JSON configurations, the system prompts, and the exact steps required to build this agent from scratch on a new Vapi dashboard, including how to do it using the Model Context Protocol (MCP).

---

## 1. How It Works: The Architecture

The Visava Voice Agent is not a generic ChatGPT bot. It is a highly specialized, database-connected coordinator. 

### The Flow:
1. **User Speaks:** A Warkari calls the number and says, *"Main Latur mein hu, mujhe khana chahiye."* (I am in Latur, I need food).
2. **Vapi Transcribes:** The voice is transcribed into text using Deepgram.
3. **LLM Decision:** The AI (GPT-4o) reads its **System Prompt**, realizes the user asked for "food" and provided the city "Latur". 
4. **Tool Calling:** The LLM decides to trigger the `find_nearby_services` tool. It generates a JSON payload: `{"type": "food", "location_text": "Latur"}`.
5. **Webhook Request:** Vapi sends this JSON payload via a POST request to your Ngrok URL (`https://your-ngrok.dev/api/v1/voice/tools`).
6. **Backend Logic (MongoDB):**
   - The Node.js backend receives the request.
   - It searches the MongoDB `services` collection for `type: "food"` and `city: "latur"`.
   - It formats the results (e.g., "Found Shri Vitthal Mahaprasad...").
7. **Webhook Response:** The backend replies to Vapi with the formatted text.
8. **LLM Translation:** The AI reads the English database response and translates it into natural Hindi/Marathi for the user.
9. **Speech Synthesis:** Vapi uses ElevenLabs to speak the response back to the user over the phone.

---

## 2. The Database Connection (The Tool)

To allow the AI to search MongoDB, we give it a "Tool". A tool is just a JSON definition that tells the AI *what* it can search for, and *where* to send the search request.

### The Exact Tool JSON Definition
If your friend is creating the tool manually via the Vapi API or the Vapi Dashboard, they must use this exact JSON structure:

```json
{
  "type": "function",
  "function": {
    "name": "find_nearby_services",
    "description": "Finds nearby medical, food, water, or shelter camps in the database.",
    "parameters": {
      "type": "object",
      "properties": {
        "type": { 
          "type": "string", 
          "enum": ["medical", "food", "water", "shelter"] 
        },
        "location_text": { 
          "type": "string", 
          "description": "The specific city or village name provided by the user. Leave empty if the user hasn't specified a city." 
        }
      },
      "required": ["type", "location_text"]
    }
  },
  "server": { 
    "url": "https://[YOUR_NGROK_URL]/api/v1/voice/tools" 
  }
}
```

---

## 3. The System Prompts (The "Brain")

The System Prompt is the most critical part of the agent. It forces the AI to speak the correct language, forces it to ask for the city name before searching, and stops it from sounding like a robot.

### A. The Hindi System Prompt
```text
You are Visava, an AI assistant for the Warkaris in Maharashtra.

CRITICAL LANGUAGE RULE:
- YOU MUST ONLY SPEAK IN PURE, NATURAL HINDI. 
- DO NOT use Marathi words. DO NOT mix Marathi and Hindi.

YOUR GOAL:
You help users find Food (khana), Water (pani), Medical (medical/dawai), or Shelter (rukne ki jagah) in Maharashtra.

CONVERSATION FLOW (STRICTLY FOLLOW THIS):
1. GREETING: If the user says hello, say: "नमस्ते, मैं विसावा हूँ। मैं आपको खाना, पानी, मेडिकल या रुकने की जगह ढूंढने में मदद कर सकता हूँ। आपको क्या चाहिए?"
2. MISSING LOCATION: If the user asks for food/water/medical/shelter, but DOES NOT mention their city or village, YOU MUST ASK: "आप अभी किस शहर या गाँव में हैं?" (Which city or village are you in right now?). 
3. DO NOT CALL THE TOOL until you clearly know the user's city (e.g. Latur, Karmala, Solapur, Pune, Pandharpur).
4. USING THE TOOL: Once the user provides the city (e.g. "Main Latur mein hu"), use the `find_nearby_services` tool immediately with location_text="Latur".
5. TOOL RESPONSE: The tool will return English data (e.g., "Found mahakal center..."). You must translate this data into a helpful, natural HINDI response for the user (e.g. "आपके पास महाकाल सेंटर है, जहाँ मैंगो जूस मिलेगा...").

LOCATION KNOWLEDGE:
- Users will mention Maharashtra cities (e.g., Latur, Karmala, Solapur, Pune, Alandi, Dehu, Pandharpur).
- If the speech-to-text slightly misspells the Indian city name, do your best to correct it to the actual Maharashtra city name before passing it to the tool.

BEHAVIOR:
Never say 'I am checking the database' or mention 'tools'. Just say "ek minute, main check karta hoon..." and then give them the answer.
```

### B. The Marathi System Prompt
```text
You are Visava, an AI assistant for the Warkaris in Maharashtra.

CRITICAL LANGUAGE RULE:
- YOU MUST ONLY SPEAK IN PURE, NATURAL MARATHI. 
- DO NOT use Hindi words. DO NOT mix Marathi and Hindi.

YOUR GOAL:
You help users find Food (khana), Water (pani), Medical (medical/dawai), or Shelter (rukne ki jagah) in Maharashtra.

CONVERSATION FLOW (STRICTLY FOLLOW THIS):
1. GREETING: If the user says hello, say: "नमस्कार, मी विसावा आहे. मी तुम्हाला जेवण, पाणी, वैद्यकीय मदत किंवा निवारा शोधण्यात मदत करू शकतो. तुम्हाला काय हवे आहे?"
2. MISSING LOCATION: If the user asks for food/water/medical/shelter, but DOES NOT mention their city or village, YOU MUST ASK: "तुम्ही सध्या कोणत्या गावात किंवा शहरात आहात?" (Which city or village are you in right now?). 
3. DO NOT CALL THE TOOL until you clearly know the user's city (e.g. Latur, Karmala, Solapur, Pune, Pandharpur).
4. USING THE TOOL: Once the user provides the city, use the `find_nearby_services` tool immediately with location_text="Latur".
5. TOOL RESPONSE: The tool will return English data (e.g., "Found mahakal center..."). You must translate this data into a helpful, natural MARATHI response for the user.

LOCATION KNOWLEDGE:
- Users will mention Maharashtra cities (e.g., Latur, Karmala, Solapur, Pune, Alandi, Dehu, Pandharpur).
- If the speech-to-text slightly misspells the Indian city name, do your best to correct it to the actual Maharashtra city name before passing it to the tool.

BEHAVIOR:
Never say 'I am checking the database' or mention 'tools'. Just say "ek minute, me check karto..." and then give them the answer.
```

---

## 4. How to Create the Agent using MCP (Model Context Protocol)

If your friend is using an AI (like Claude, Cursor, or Antigravity) hooked up to the official `@vapi-ai/mcp-server`, they can instruct their AI to build the entire setup automatically using MCP tool calls.

Here is the exact data the AI should pass to the MCP tools:

### Step 1: Create the Webhook Tool via MCP
Instruct the AI to use the `mcp_vapi_create_tool` function with the following payload:

```json
{
  "type": "function",
  "name": "find_nearby_services",
  "description": "Finds nearby medical, food, water, or shelter camps in the database.",
  "function": {
    "server": {
      "url": "https://[YOUR_NGROK_URL]/api/v1/voice/tools"
    },
    "parameters": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string"
        },
        "location_text": {
          "type": "string"
        }
      },
      "required": ["type", "location_text"]
    }
  }
}
```
*(The AI will receive a `toolId` in response. Save this `toolId`!)*

### Step 2: Create the Marathi Assistant via MCP
Instruct the AI to use the `mcp_vapi_create_assistant` function with the following payload:

```json
{
  "name": "Visava Marathi",
  "firstMessage": "नमस्कार, मी विसावा आहे. मी तुम्हाला कशी मदत करू शकतो?",
  "firstMessageMode": "assistant-speaks-first",
  "instructions": "[PASTE THE FULL MARATHI PROMPT FROM SECTION 3B HERE]",
  "toolIds": [
    "[PASTE THE TOOL ID YOU GOT FROM STEP 1 HERE]"
  ],
  "transcriber": {
    "provider": "gladia",
    "model": "fast"
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "21m00Tcm4TlvDq8ikWAM",
    "model": "eleven_turbo_v2_5"
  }
}
```

### Step 3: Create the Hindi Assistant via MCP
Instruct the AI to use the `mcp_vapi_create_assistant` function with the following payload:

```json
{
  "name": "Visava Hindi",
  "firstMessage": "नमस्ते, मैं विसावा हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
  "firstMessageMode": "assistant-speaks-first",
  "instructions": "[PASTE THE FULL HINDI PROMPT FROM SECTION 3A HERE]",
  "toolIds": [
    "[PASTE THE TOOL ID YOU GOT FROM STEP 1 HERE]"
  ],
  "transcriber": {
    "provider": "deepgram",
    "model": "nova-2"
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "21m00Tcm4TlvDq8ikWAM",
    "model": "eleven_turbo_v2_5"
  }
}
```

### Step 4: Finalizing the Squad
Once the assistants are created via MCP, your friend simply needs to go into the Vapi Dashboard website, create a **Squad**, add the Marathi assistant as member #1, the Hindi assistant as member #2, and assign the Squad to their Twilio Phone number. 

The Visava Voice Agent is now completely online and deeply integrated with MongoDB!
