import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

// Delete all existing assistants
async function deleteAllAssistants() {
  const asstRes = await axios.get("https://api.vapi.ai/assistant", { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  for (const asst of asstRes.data) {
    console.log(`Deleting assistant: ${asst.name}`);
    await axios.delete(`https://api.vapi.ai/assistant/${asst.id}`, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  }
}

// Delete all existing tools
async function deleteAllTools() {
  const toolRes = await axios.get("https://api.vapi.ai/tool", { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  for (const tool of toolRes.data) {
    console.log(`Deleting tool: ${tool.name || tool.type}`);
    await axios.delete(`https://api.vapi.ai/tool/${tool.id}`, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  }
}

const COMMON_SYSTEM_PROMPT = `You are Visava, an AI emergency coordinator for the Varkaris in Pandharpur.
CRITICAL DATABASE & TOOL RULES (DO OR DIE):
- You MUST fetch data from the MongoDB database using your tools.
- NEVER invent, hallucinate, or guess locations, camps, or services.
- If a user asks for food, YOU MUST USE THE find_nearby_food TOOL IMMEDIATELY.
- If a user asks for accommodation or shelter, YOU MUST USE THE find_nearby_accommodation TOOL IMMEDIATELY.
- If a user has a medical emergency, YOU MUST USE THE find_nearby_medical TOOL IMMEDIATELY.
- If a user asks for drinking water, YOU MUST USE THE find_nearby_water TOOL IMMEDIATELY.
- If a user wants to report a missing person, YOU MUST USE THE create_missing_person_report TOOL.

BEHAVIOR:
Answer in 1-2 short sentences. Never use bullet points or lists. Be incredibly fast and responsive. You are an API coordinator. Do not hallucinate.`;

async function rebuild() {
  await deleteAllAssistants();
  await deleteAllTools();

  // Create standard tools
  const toolsToCreate = [
    { type: "function", function: { name: "find_nearby_food", description: "Use this to find nearby food facilities (Annachhatra, food distribution) for the user.", parameters: { type: "object", properties: { location_text: { type: "string" } }, required: ["location_text"] } }, server: { url: "https://alfalfa-copartner-yearning.ngrok-free.dev/api/vapi/tools" } },
    { type: "function", function: { name: "find_nearby_accommodation", description: "Use this to find nearby accommodation (Bhakta Niwas, tents, shelter) for the user.", parameters: { type: "object", properties: { location_text: { type: "string" } }, required: ["location_text"] } }, server: { url: "https://alfalfa-copartner-yearning.ngrok-free.dev/api/vapi/tools" } },
    { type: "function", function: { name: "find_nearby_medical", description: "Use this to find nearby medical facilities, hospitals, or clinics for the user.", parameters: { type: "object", properties: { location_text: { type: "string" } }, required: ["location_text"] } }, server: { url: "https://alfalfa-copartner-yearning.ngrok-free.dev/api/vapi/tools" } },
    { type: "function", function: { name: "find_nearby_water", description: "Use this to find nearby drinking water facilities for the user.", parameters: { type: "object", properties: { location_text: { type: "string" } }, required: ["location_text"] } }, server: { url: "https://alfalfa-copartner-yearning.ngrok-free.dev/api/vapi/tools" } }
  ];

  const commonToolIds = [];
  for (const t of toolsToCreate) {
    const res = await axios.post("https://api.vapi.ai/tool", t, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    commonToolIds.push(res.data.id);
  }

  // Create 3 assistants first
  const createAssistant = async (name: string, lang: string, transcriber: any) => {
    const payload = {
      name,
      firstMessage: lang === "Marathi" ? "नमस्कार, मी विसावा. मी तुम्हाला कशी मदत करू शकेन?" : lang === "Hindi" ? "नमस्ते, मैं विसावा हूँ। मैं आपकी कैसे मदद कर सकता हूँ?" : "Hello, I am Visava. How can I help you?",
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [{ role: "system", content: `${COMMON_SYSTEM_PROMPT}\n\nCRITICAL LANGUAGE RULES: You must strictly speak in ${lang}. If the user speaks a different language, immediately use the transferCall tool to transfer them to the correct language agent.` }]
      },
      transcriber,
      voice: { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM", model: "eleven_turbo_v2_5" }
    };
    const res = await axios.post("https://api.vapi.ai/assistant", payload, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    return res.data;
  };

  const marathiAsst = await createAssistant("VisavaMarathi", "Marathi", { provider: "talkscriber", model: "whisper", language: "mr" });
  const hindiAsst = await createAssistant("VisavaHindi", "Hindi", { provider: "deepgram", model: "nova-2", language: "hi" });
  const englishAsst = await createAssistant("VisavaEnglish", "English", { provider: "deepgram", model: "nova-2", language: "en" });

  console.log("Created Assistants:", marathiAsst.id, hindiAsst.id, englishAsst.id);

  // Create Transfer Tools
  const createTransferTool = async (targetAsst: any) => {
    const payload = {
      type: "transferCall",
      function: {
        name: `transfer_to_visava_${targetAsst.name.replace("Visava", "").toLowerCase()}`,
        description: `Transfer if user speaks ${targetAsst.name.replace("Visava", "")}`,
        parameters: { type: "object", properties: {} }
      },
      destinations: [{ type: "assistant", assistantName: targetAsst.name, description: "Transfer" }]
    };
    const res = await axios.post("https://api.vapi.ai/tool", payload, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    return res.data.id;
  };

  const toolMarathi = await createTransferTool(marathiAsst);
  const toolHindi = await createTransferTool(hindiAsst);
  const toolEnglish = await createTransferTool(englishAsst);

  // Attach tools via toolIds!
  await axios.patch(`https://api.vapi.ai/assistant/${marathiAsst.id}`, { toolIds: [...commonToolIds, toolHindi, toolEnglish] }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  await axios.patch(`https://api.vapi.ai/assistant/${hindiAsst.id}`, { toolIds: [...commonToolIds, toolMarathi, toolEnglish] }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  await axios.patch(`https://api.vapi.ai/assistant/${englishAsst.id}`, { toolIds: [...commonToolIds, toolMarathi, toolHindi] }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });

  // Update phone number
  await axios.patch("https://api.vapi.ai/phone-number/54aaec54-6765-4d1b-9d19-bc62cbc7b386", { assistantId: marathiAsst.id }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  console.log("Rebuild complete. Phone number tied to", marathiAsst.id);
}
rebuild();
