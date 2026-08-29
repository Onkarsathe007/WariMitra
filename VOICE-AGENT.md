# Voice Agent

Twilio Conversation Relay voice agent for Visava. Enables Varkaris without smartphones to access the entire platform via a single phone call. Supports Marathi (primary), Hindi, and English with keyword-based intent detection and multi-turn conversation state machine.

## Tech Stack

- Node.js 22 + Express + TypeScript
- Twilio Conversation Relay (built-in STT via Google, TTS via Google/ElevenLabs)
- WebSocket (real-time bidirectional voice communication)

## Quick Start

```bash
cd voice-agent
npm install
npm run dev
```

HTTP server runs on `http://localhost:4000`. WebSocket server runs on `ws://localhost:4001`.

**Prerequisites:** Twilio account with Conversation Relay enabled, Core API running on port 3000.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `4000` | HTTP server port |
| `WS_PORT` | No | `4001` | WebSocket server port |
| `PUBLIC_URL` | Yes | `https://localhost:4001` | Public WebSocket URL (Twilio connects here) |
| `CORE_API_URL` | No | `http://localhost:3000` | Core API URL for data lookups |
| `TWILIO_ACCOUNT_SID` | Yes | — | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Yes | — | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Yes | — | Twilio phone number for outbound calls |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed origins |

## How It Works

### Call Flow

```
1. Varkari calls helpline number
2. Twilio receives call → POST /voice/inbound
3. Returns TwiML with ConversationRelay config:
   - WebSocket URL: wss://server/websocket
   - Welcome greeting (Marathi)
   - Language: mr-IN
   - TTS: Google mr-IN-Standard-A
   - STT: Google
4. Twilio opens WebSocket to voice-agent:4001
5. Caller speaks → Twilio STT → sends prompt JSON
6. Voice Agent parses intent → calls Core API for lookups
7. Voice Agent sends text back → Twilio TTS → caller hears response
8. Loop continues until end session or call transfer
```

### WebSocket Protocol

**Receive from Twilio:**

```json
{ "type": "setup", "sessionId": "...", "callSid": "CA...", "from": "+91...", "to": "+91..." }
{ "type": "prompt", "voicePrompt": "मला औषध हवं", "lang": "mr-IN", "last": true }
{ "type": "interrupt", "utteranceUntilInterrupt": "मला...", "durationUntilInterruptMs": 460 }
```

**Send to Twilio:**

```json
{ "type": "text", "token": "हो भाऊ! जवळच्या औषधालयात मिळेल.", "last": true, "interruptible": true }
{ "type": "sendDigits", "digits": "9www1234567890" }
{ "type": "end", "handoffData": "{\"reason\": \"resolved\"}" }
```

### Intent Detection

The voice agent uses keyword matching across three languages:

| Intent | Marathi Keywords | Hindi Keywords | English Keywords | Action |
|--------|-----------------|----------------|------------------|--------|
| `find_medical` | औषध, डॉक्टर, हॉस्पिटल, ताप, दुखणे | दवा, डॉक्टर, बीमार, दर्द | medical, doctor, hospital, sick | Search nearby medical services/camps |
| `find_food` | अन्न, जेवण, भूक, खाद्य | खाना, भूख, भोजन | food, eat, hungry, meal | Search nearby food points |
| `find_water` | पाणी, तहान, प्याऊ | पानी, प्यास | water, thirst, drink | Search nearby water points |
| `find_shelter` | राहणीमान, शेळी, शिवणगृह | रहना, शेल्टर | shelter, stay, accommodation | Search nearby shelter |
| `report_missing_person` | हरवलेला, सापडत नाही, शोधा, व्यक्ती | गुमशुदा, खो गया, लापता | missing, lost, person, find | Create missing person report |
| `report_found_item` | सापडलेली, वस्तू, फोन, पर्स | मिला, वस्तु | found, item, phone, wallet | Create found item report |
| `connect_helper` | जोडा, कॉल, फोन, बोला | जोड़ो, कॉल, बोलो | connect, call, speak, talk | Transfer call to helper |
| `greeting` | नमस्कार, हैलो, प्रणाम | नमस्ते | hello, hi | Welcome message |

### Conversation State Machine

```
GREETING → AWAIT_INTENT → AWAIT_LOCATION → PROCESS → RESPOND → (loop or end)
                                      ↑
                     AWAIT_MISSING_PERSON_INFO
                     AWAIT_FOUND_ITEM_INFO
                     AWAIT_CONNECT_INFO
```

**State transitions:**
1. **GREETING** — Welcome message sent. Waiting for user's first request.
2. **AWAIT_INTENT** — Intent parsed from user speech. If location not yet known, ask for it.
3. **AWAIT_LOCATION** — Waiting for user's location (lat/lng or place name).
4. **PROCESS** — Execute intent: call Core API for lookups, create reports, etc.
5. **RESPOND** — Send response text back to Twilio TTS.
6. **Loop** — Return to AWAIT_INTENT for multi-turn conversations.

### Supported Languages

| Language | Code | TTS Voice | STT Provider | Default |
|----------|------|-----------|--------------|---------|
| Marathi | `mr-IN` | Google mr-IN-Standard-A | Google | Yes |
| Hindi | `hi-IN` | ElevenLabs IvLWq57RKibBrqZGpQrC | Google | No |
| English | `en-US` | ElevenLabs UgBBYS2sOqTuMpoF3BR0 | Google | No |

Language is auto-detected from the caller's speech using Devanagari script analysis and Marathi vs Hindi indicator words.

## API Reference

### HTTP Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/voice/inbound` | Twilio webhook — incoming call handler (returns TwiML) |
| `POST` | `/voice/connect-action` | Post-connect action callback |
| `POST` | `/voice/outbound` | Initiate outbound call |

**Voice Inbound (Twilio Webhook):**

Configure this in Twilio Console → Phone Number → Voice → "A call comes in" → Webhook URL:
```
https://your-server.com/voice/inbound
```

The endpoint returns TwiML that connects to Conversation Relay:
```xml
<Connect>
  <ConversationRelay
    url="wss://your-server.com/websocket"
    welcomeGreeting="नमस्कार! मी विसवा आहे..."
    language="mr-IN"
    ttsProvider="Google"
    voice="mr-IN-Standard-A"
    transcriptionProvider="Google"
    interruptible="any"
    interruptSensitivity="medium"
  />
</Connect>
```

**Outbound Call:**
```json
POST /voice/outbound
{ "to": "+919876543210", "message": "Your medical request has been received." }
→ { "status": "ok", "callSid": "CA..." }
```

## Core API Integration

The voice agent calls these Core API endpoints:

| Operation | Core API Endpoint | Purpose |
|-----------|-------------------|---------|
| Find medical services | `GET /api/v1/services?type=medical&lat=&lng=&radius=5` | Nearby medical help |
| Find food services | `GET /api/v1/services?type=food&lat=&lng=&radius=5` | Nearby food points |
| Find water services | `GET /api/v1/services?type=water&lat=&lng=&radius=5` | Nearby water points |
| Find shelter | `GET /api/v1/camps?type=shelter&lat=&lng=&radius=5` | Nearby shelter camps |
| Create report | `POST /api/v1/reports` | Missing person / found item |

## Twilio Console Setup

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Phone Numbers** → Select your number
3. Under **Voice** → **"A call comes in"**: Set to `Webhook` with URL:
   ```
   https://your-server.com/voice/inbound
   ```
4. Under **Voice** → **"Status callback URL"**: Leave blank
5. Navigate to **Settings** → **API keys** → Create a key for Conversation Relay
6. Enable **Conversation Relay** in your account (requires accepting AI/ML terms)

## Project Structure

```
voice-agent/
├── package.json
├── tsconfig.json
├── Dockerfile
└── src/
    ├── index.ts                  # Express app (Twilio webhooks)
    ├── server.ts                 # Entry point (starts HTTP + WebSocket servers)
    ├── config/
    │   └── env.ts                # Environment variable loading
    ├── services/
    │   ├── websocket.ts          # Conversation Relay WebSocket handler
    │   ├── conversation.ts       # Multi-turn conversation state machine + responses
    │   ├── intentParser.ts       # Marathi/Hindi/English intent detection
    │   └── coreApi.ts            # Core API client (findNearby*, createReport)
    ├── types/
    │   └── index.ts              # ConversationState, Intent, Language, etc.
    └── utils/
        └── logger.ts             # Pino logger
```

## Building & Running

```bash
# Development
npm run dev

# Build
npx tsc --noEmit    # Type check
npm run build        # Compile

# Docker
docker build -t visava-voice-agent .
docker run -p 4000:4000 -p 4001:4001 visava-voice-agent
```

## Example Conversation

```
[Phone rings]
Twilio: "नमस्कार! मी विसवा आहे. तुम्हाला कशात मदत हवी आहे?"
Caller: "मला औषध हवं आहे, माझ्या पोटात दुखत आहे"
Agent:  "तुमचे स्थान सांगा किंवा तुम्ही कुठे आहात?"
Caller: "मी पुण्यात आहे, शिवाजीनगर"
Agent:  [calls Core API: findNearbyServices("medical", 18.53, 73.89)]
Agent:  "तुमच्या जवळ हे औषधालय/मदत उपलब्ध आहे: 1. City Hospital, 2 km दूर, फोन: 020-12345678"
Caller: "धन्यवाद!"
Agent:  "काही अजून मदत हवी?"
Caller: "नाही धन्यवाद"
Agent:  [ends session]
```
