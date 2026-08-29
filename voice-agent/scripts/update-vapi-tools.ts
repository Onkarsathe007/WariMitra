import axios from "axios";
import fs from "fs";

const VAPI_KEY = "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";
const ASSISTANT_IDS = [
  "7bb66519-cb22-4cf8-9a3c-8701f9200625", // Hindi
  "a2ea0fcf-2c87-4823-b01d-7a7163a666f2", // English
  "f3e61c8f-894c-41f0-a1ee-6edb39ce98a3"  // Marathi
];

const toolsConfig = [
  {
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
    server: { url: "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools" }
  }
];

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

async function main() {
  const toolIds = [];
  console.log("Creating ONLY the find_nearby_services tool in Vapi Dashboard...");
  
  for (const tool of toolsConfig) {
    try {
      const res = await axios.post("https://api.vapi.ai/tool", tool, {
        headers: {
          Authorization: `Bearer ${VAPI_KEY}`,
          "Content-Type": "application/json"
        }
      });
      console.log(`Created tool ${tool.function.name}: ${res.data.id}`);
      toolIds.push(res.data.id);
    } catch (e: any) {
      console.error(`Failed to create tool ${tool.function.name}`, e.response?.data || e.message);
    }
  }

  console.log("\\nUpdating Assistants with highly optimized Hindi/Marathi prompts...");

  for (const assistantId of ASSISTANT_IDS) {
    let promptToUse = MARATHI_PROMPT;
    if (assistantId === "7bb66519-cb22-4cf8-9a3c-8701f9200625") {
      promptToUse = HINDI_PROMPT; // Strict Hindi
    } else if (assistantId === "a2ea0fcf-2c87-4823-b01d-7a7163a666f2") {
      promptToUse = "You are Visava, an English AI assistant. Help users find food, water, medical, or shelter. ALWAYS ask for their city before searching. Speak only in English.";
    }

    const updatePayload = {
      model: {
        provider: "openai",
        model: "gpt-4o",
        toolIds: toolIds,
        messages: [
          {
            role: "system",
            content: promptToUse
          }
        ],
        tools: [] // Clear inline tools to prevent conflicts with toolIds
      }
    };

    try {
      await axios.patch(`https://api.vapi.ai/assistant/${assistantId}`, updatePayload, {
        headers: {
          Authorization: `Bearer ${VAPI_KEY}`,
          "Content-Type": "application/json"
        }
      });
      console.log(`SUCCESS! Assistant ${assistantId} perfectly configured with simplified tools.`);
    } catch (e: any) {
      console.error(`Failed to update assistant ${assistantId}`, e.response?.data || e.message);
    }
  }
}

main();
