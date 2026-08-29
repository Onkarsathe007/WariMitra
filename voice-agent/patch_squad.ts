import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

const COMMON_TOOL_IDS = [
  "f3d4d839-5d62-4d68-914b-60a9a01729c8", // find_nearby_food
  "44dd7e26-e3c6-4f5e-abdc-84865de2999e", // find_nearby_accommodation
  "41732762-f609-49c0-9ad0-14ee7ae83dd2", // find_nearby_medical
  "6be4be2b-9042-4dba-a635-71529e011586", // find_nearby_water
  "79395c96-e9fc-45f3-bfcf-67365609a46c", // create_missing_person_report
  "e2823ffd-22e6-4764-b76a-02335632e387", // create_medical_emergency_report
  "7e1bb2c0-fac1-4fb6-8d9d-bf281a3ae702", // create_found_item_report
  "39e5bacd-527f-4eec-a83b-5ceeabf276e5", // get_report_status
  "ad2097fb-7247-4255-b3cc-c668bcb02801"  // find_nearby_helpers
];

async function fetchTool(id: string) {
  const res = await axios.get(`https://api.vapi.ai/tool/${id}`, {
    headers: { Authorization: `Bearer ${VAPI_KEY}` }
  });
  return res.data;
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

async function patchAgent(id: string, extraTools: string[], language: string) {
  try {
    const allIds = [...COMMON_TOOL_IDS, ...extraTools];
    const tools = await Promise.all(allIds.map(fetchTool));
    
    const cleanTools = tools.map(t => {
      const { id, orgId, createdAt, updatedAt, latestVersion, ...rest } = t;
      return rest;
    });

    const res = await axios.patch(`https://api.vapi.ai/assistant/${id}`, {
      model: {
        provider: "openai",
        model: "gpt-4o",
        tools: cleanTools,
        messages: [
          {
            role: "system",
            content: `${COMMON_SYSTEM_PROMPT}\n\nCRITICAL LANGUAGE RULES: You must strictly speak in ${language}. If the user speaks a different language, immediately use the transferCall tool to transfer them to the correct language agent.`
          }
        ]
      }
    }, {
      headers: { Authorization: `Bearer ${VAPI_KEY}` }
    });
    console.log(`Success for ${id}`);
  } catch (e: any) {
    console.error(`Failed for ${id}:`, e.response?.data || e.message);
  }
}

async function main() {
  await patchAgent("d6699c02-c244-44e5-9761-9f26cd73f58b", ["f713fce6-c00e-49bc-a50b-b5b96e8feb01", "c795afcb-d4ef-4b7b-a22c-8ac3cf8c67a7"], "Marathi"); 
  await patchAgent("96b1d8b1-e93a-4277-b9a9-f847ab6741f6", ["f9951dcd-dcbb-4cc0-95cb-23c8cfa0a4b1", "c795afcb-d4ef-4b7b-a22c-8ac3cf8c67a7"], "Hindi"); 
  await patchAgent("ada09182-700a-42b9-8d5a-5873c89c2bda", ["f9951dcd-dcbb-4cc0-95cb-23c8cfa0a4b1", "f713fce6-c00e-49bc-a50b-b5b96e8feb01"], "English"); 
}

main();
