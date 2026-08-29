import axios from "axios";

const VAPI_KEY = "f3650da9-2910-42dc-80cd-cd432ffc6146";

// Change this to your public ngrok URL if running from somewhere else, or keep the static one.
const NGROK_URL = "https://alfalfa-copartner-yearning.ngrok-free.dev"; 

const toolsConfig = {
  type: "function",
  function: {
    name: "find_nearby_services",
    description: "Finds nearby medical, food, water, or shelter camps in the database.",
    parameters: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["medical", "food", "water", "shelter"] },
        location_text: { type: "string", description: "The specific city or village name provided by the user. Leave empty if the user hasn't specified a city." }
      },
      required: ["type", "location_text"]
    }
  },
  server: { url: `${NGROK_URL}/api/v1/voice/tools` }
};

const HINDI_PROMPT = `You are Visava, an AI assistant for the Warkaris in Maharashtra.

CRITICAL LANGUAGE RULE:
- YOU MUST ONLY SPEAK IN PURE, NATURAL HINDI. 
- DO NOT use Marathi words. DO NOT mix Marathi and Hindi.

YOUR GOAL:
You help users find Food (khana), Water (pani), Medical (medical/dawai), or Shelter (rukne ki jagah) in Maharashtra.

CONVERSATION FLOW (STRICTLY FOLLOW THIS):
1. GREETING: If the user says hello, say: "नमस्ते, मैं विसावा हूँ। मैं आपको खाना, पानी, मेडिकल या रुकने की जगह ढूंढने में मदद कर सकता हूँ। आपको क्या चाहिए?"
2. MISSING LOCATION: If the user asks for food/water/medical/shelter, but DOES NOT mention their city or village, YOU MUST ASK: "आप अभी किस शहर या गाँव में हैं?" (Which city or village are you in right now?). 
3. DO NOT CALL THE TOOL until you clearly know the user's city (e.g. Latur, Karmala, Solapur, Pune, Pandharpur).
4. USING THE TOOL: Once the user provides the city (e.g. "Main Latur mein hu"), use the \`find_nearby_services\` tool immediately with location_text="Latur".
5. TOOL RESPONSE: The tool will return English data (e.g., "Found mahakal center..."). You must translate this data into a helpful, natural HINDI response for the user (e.g. "आपके पास महाकाल सेंटर है, जहाँ मैंगो जूस मिलेगा...").

LOCATION KNOWLEDGE:
- Users will mention Maharashtra cities (e.g., Latur, Karmala, Solapur, Pune, Alandi, Dehu, Pandharpur).
- If the speech-to-text slightly misspells the Indian city name, do your best to correct it to the actual Maharashtra city name before passing it to the tool.

BEHAVIOR:
Never say 'I am checking the database' or mention 'tools'. Just say "ek minute, main check karta hoon..." and then give them the answer.`;

const MARATHI_PROMPT = HINDI_PROMPT.replace("PURE, NATURAL HINDI", "MARATHI").replace(/Hindi/g, "Marathi").replace("नमस्ते, मैं विसावा हूँ। मैं आपको खाना, पानी, मेडिकल या रुकने की जगह ढूंढने में मदद कर सकता हूँ। आपको क्या चाहिए?", "नमस्कार, मी विसावा आहे. मी तुम्हाला जेवण, पाणी, वैद्यकीय मदत किंवा निवारा शोधण्यात मदत करू शकतो. तुम्हाला काय हवे आहे?").replace("आप अभी किस शहर या गाँव में हैं?", "तुम्ही सध्या कोणत्या गावात किंवा शहरात आहात?");

const ENGLISH_PROMPT = "You are Visava, an English AI assistant. Help users find food, water, medical, or shelter. ALWAYS ask for their city before searching. Speak only in English.";

async function main() {
  console.log("🚀 Starting Visava Vapi Migration to New Account...");
  console.log("---------------------------------------------------");

  let toolId = "";
  try {
    const res = await axios.post("https://api.vapi.ai/tool", toolsConfig, {
      headers: { Authorization: `Bearer ${VAPI_KEY}`, "Content-Type": "application/json" }
    });
    toolId = res.data.id;
    console.log(`✅ Created Tool (find_nearby_services): ${toolId}`);
  } catch (e: any) {
    console.error("❌ Failed to create tool", e.response?.data || e.message);
    process.exit(1);
  }

  const createAssistant = async (name: string, prompt: string) => {
    const payload = {
      name: name,
      model: {
        provider: "openai",
        model: "gpt-4o",
        toolIds: [toolId],
        messages: [
          {
            role: "system",
            content: prompt
          }
        ]
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM",
        model: "eleven_turbo_v2_5"
      },
      transcriber: name.includes("Marathi") 
        ? { provider: "gladia", model: "fast" }
        : { provider: "deepgram", model: "nova-2", language: name.includes("Hindi") ? "hi" : "en" }
    };

    try {
      const res = await axios.post("https://api.vapi.ai/assistant", payload, {
        headers: { Authorization: `Bearer ${VAPI_KEY}`, "Content-Type": "application/json" }
      });
      console.log(`✅ Created Assistant (${name}): ${res.data.id}`);
      return res.data.id;
    } catch (e: any) {
      console.error(`❌ Failed to create assistant (${name})`, e.response?.data || e.message);
    }
  };

  const hindiId = await createAssistant("Visava Hindi", HINDI_PROMPT);
  const marathiId = await createAssistant("Visava Marathi", MARATHI_PROMPT);
  const englishId = await createAssistant("Visava English", ENGLISH_PROMPT);

  console.log("---------------------------------------------------");
  console.log("🎉 Migration Complete!");
  console.log("Next Steps in your Vapi Dashboard:");
  console.log("1. Buy a phone number in Vapi.");
  console.log("2. Create a 'Squad'.");
  console.log("3. Add these assistants to the Squad.");
  console.log("4. Assign the Squad to your new phone number!");
}

main();
