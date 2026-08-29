import axios from "axios";

import "dotenv/config";
const VAPI_KEY = "f3650da9-2910-42dc-80cd-cd432ffc6146";

// Existing tools we want to attach to all agents
const COMMON_TOOL_IDS = [
  "acfef5fc-2e51-4a37-836c-67de13d618d1",
  "79395c96-e9fc-45f3-bfcf-67365609a46c",
  "e2823ffd-22e6-4764-b76a-02335632e387",
  "7e1bb2c0-fac1-4fb6-8d9d-bf281a3ae702",
  "39e5bacd-527f-4eec-a83b-5ceeabf276e5",
  "ad2097fb-7247-4255-b3cc-c668bcb02801"
];

const COMMON_SYSTEM_PROMPT = `You are Visava, an AI emergency coordinator for the Varkaris in Pandharpur.
CRITICAL DATABASE & TOOL RULES (DO OR DIE):
- You MUST fetch data from the MongoDB database using your tools.
- NEVER invent, hallucinate, or guess locations, camps, or services.
- If a user asks for food, water, medical help, or shelter, YOU MUST USE THE find_nearby_services TOOL IMMEDIATELY.
- If a user wants to report a missing person, YOU MUST USE THE create_missing_person_report TOOL.
- If a user has a medical emergency, YOU MUST USE THE create_medical_emergency_report TOOL.
- If a user found an item, YOU MUST USE THE create_found_item_report TOOL.
- If a user wants to know a report status, YOU MUST USE THE get_report_status TOOL.
- If a user needs a volunteer, YOU MUST USE THE find_nearby_helpers TOOL.

BEHAVIOR:
Answer in 1-2 short sentences. Never use bullet points or lists. Be incredibly fast and responsive. You are an API coordinator. Do not hallucinate.`;

async function main() {
  console.log("Building Vapi Squad...");

  // 1. Create the Assistants
  const createAssistant = async (name: string, language: string, voiceId: string, customPrompt: string) => {
    const payload = {
      name,
      firstMessage: language === "mr" ? "नमस्कार, मी विसावा. मी तुम्हाला कशी मदत करू शकेन?" : language === "hi" ? "नमस्ते, मैं विसावा हूँ। मैं आपकी कैसे मदद कर सकता हूँ?" : "Hello, I am Visava. How can I help you?",
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `${COMMON_SYSTEM_PROMPT}\n\nCRITICAL LANGUAGE RULES: You must strictly speak in ${language === "mr" ? "Marathi" : language === "hi" ? "Hindi" : "English"}. If the user speaks a different language, immediately use the transferCall tool to transfer them to the correct language agent.`
          }
        ]
      },
      transcriber: {
        provider: "assembly-ai",
        speechModel: "universal-3-5-pro",
        languageCodes: language === "mr" ? undefined : [language],
        mode: "min_latency"
      },
      voice: {
        provider: "11labs",
        voiceId: voiceId,
        model: "eleven_turbo_v2_5"
      },
      // Removed startSpeakingPlan to let AssemblyAI handle it natively
    };

    const res = await axios.post("https://api.vapi.ai/assistant", payload, {
      headers: {
        Authorization: `Bearer ${VAPI_KEY}`,
        "Content-Type": "application/json"
      }
    });
    return res.data;
  };

  try {
    // Note: We use 11Labs default Voice IDs since we don't have custom ones
    // Aria (English), Rachel (English/Multi), etc. 
    // 11Labs V2.5 is multilingual so Rachel works for all three! Voice ID: 21m00Tcm4TlvDq8ikWAM (Rachel)
    console.log("Creating Marathi Agent...");
    const marathiAgent = await createAssistant("Visava - Marathi", "mr", "21m00Tcm4TlvDq8ikWAM", "");
    
    console.log("Creating Hindi Agent...");
    const hindiAgent = await createAssistant("Visava - Hindi", "hi", "21m00Tcm4TlvDq8ikWAM", "");

    console.log("Creating English Agent...");
    const englishAgent = await createAssistant("Visava - English", "en", "21m00Tcm4TlvDq8ikWAM", "");

    console.log("Squad Members created!");
    console.log("Marathi ID:", marathiAgent.id);
    console.log("Hindi ID:", hindiAgent.id);
    console.log("English ID:", englishAgent.id);

    // 2. Create the Routing Tools
    console.log("Creating Routing Tools...");
    const createRouterTool = async (assistantName: string, destId: string, desc: string) => {
      const tool = {
        type: "transferCall",
        function: {
          name: `transfer_to_${assistantName.toLowerCase().replace(" - ", "_")}`,
          description: desc,
          parameters: { type: "object", properties: {}, required: [] }
        },
        destinations: [{
          type: "assistant",
          assistantName: assistantName, // Vapi can route by name!
          description: desc
        }]
      };
      
      const res = await axios.post("https://api.vapi.ai/tool", tool, {
        headers: { Authorization: `Bearer ${VAPI_KEY}` }
      });
      return res.data.id;
    };

    const toMarathiId = await createRouterTool("Visava - Marathi", marathiAgent.id, "Transfer if user speaks Marathi");
    const toHindiId = await createRouterTool("Visava - Hindi", hindiAgent.id, "Transfer if user speaks Hindi");
    const toEnglishId = await createRouterTool("Visava - English", englishAgent.id, "Transfer if user speaks English");

    console.log(`Marathi Tool: ${toMarathiId}, Hindi Tool: ${toHindiId}, English Tool: ${toEnglishId}`);

    // We will attach tools via MCP instead since it handles the API schema correctly.

    // 4. Update the Phone Number to point to the Marathi Agent (Primary Entry Point)
    console.log("Updating phone number 54aaec54-6765-4d1b-9d19-bc62cbc7b386 to point to Marathi Agent...");
    await axios.patch("https://api.vapi.ai/phone-number/54aaec54-6765-4d1b-9d19-bc62cbc7b386", {
      assistantId: marathiAgent.id
    }, {
      headers: { Authorization: `Bearer ${VAPI_KEY}` }
    });

    console.log("Squad Setup Complete!");
  } catch (error: any) {
    console.error("Setup failed:", error.response?.data || error.message);
  }
}

main();
