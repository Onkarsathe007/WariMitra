import axios from "axios";
import fs from "fs";

const VAPI_KEY = "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";
const ASSISTANT_ID = "db6b12eb-09c5-4292-acc6-e8abb62d21d6";

const toolsConfig = [
  {
    type: "function",
    messages: [{ type: "request-start", content: "शोधत आहे, कृपया थांबा." }],
    function: {
      name: "find_nearby_services",
      description: "Finds nearby medical, food, water, or shelter camps in the database.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["medical", "food", "water", "shelter"] },
          location_text: { type: "string", description: "The spoken location name, e.g., Pandharpur" }
        },
        required: ["type", "location_text"]
      }
    },
    server: { url: "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools" }
  },
  {
    type: "function",
    messages: [{ type: "request-start", content: "माहिती नोंदवत आहे, कृपया थांबा." }],
    function: {
      name: "create_missing_person_report",
      description: "Creates a report for a missing person in the database.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of the missing person" },
          age: { type: "number", description: "Age of the missing person" },
          description: { type: "string", description: "Physical description and clothing" },
          last_seen_location: { type: "string", description: "Where they were last seen" }
        },
        required: ["name", "age", "description", "last_seen_location"]
      }
    },
    server: { url: "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools" }
  },
  {
    type: "function",
    messages: [{ type: "request-start", content: "आणीबाणी नोंदवत आहे, कृपया थांबा." }],
    function: {
      name: "create_medical_emergency_report",
      description: "Creates an emergency medical report.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string", description: "Description of the medical emergency" },
          location_text: { type: "string", description: "Where the emergency is happening" }
        },
        required: ["description", "location_text"]
      }
    },
    server: { url: "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools" }
  },
  {
    type: "function",
    messages: [{ type: "request-start", content: "माहिती नोंदवत आहे, कृपया थांबा." }],
    function: {
      name: "create_found_item_report",
      description: "Creates a report for a found item.",
      parameters: {
        type: "object",
        properties: {
          item_name: { type: "string", description: "Name of the found item" },
          description: { type: "string", description: "Description of the found item" },
          location_text: { type: "string", description: "Where it was found" }
        },
        required: ["item_name", "description", "location_text"]
      }
    },
    server: { url: "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools" }
  },
  {
    type: "function",
    messages: [{ type: "request-start", content: "स्थिती तपासत आहे, कृपया थांबा." }],
    function: {
      name: "get_report_status",
      description: "Gets the status of a report by its ID.",
      parameters: {
        type: "object",
        properties: {
          report_id: { type: "string", description: "The ID of the report" }
        },
        required: ["report_id"]
      }
    },
    server: { url: "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools" }
  },
  {
    type: "function",
    messages: [{ type: "request-start", content: "स्वयंसेवक शोधत आहे, कृपया थांबा." }],
    function: {
      name: "find_nearby_helpers",
      description: "Finds nearby helpers/volunteers.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    },
    server: { url: "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools" }
  }
];

const STRICT_PROMPT = `You are Visava, an AI emergency coordinator for the Varkaris in Pandharpur.

CRITICAL LANGUAGE RULES:
1. PRIMARY LANGUAGE: Marathi. ALWAYS reply in Marathi first if the user speaks Marathi.
2. SECONDARY LANGUAGE: English/Hindi. If the user speaks English or Hindi, reply in that language.

CRITICAL DATABASE & TOOL RULES (DO OR DIE):
- You MUST fetch data from the MongoDB database using your tools.
- NEVER invent, hallucinate, or guess locations, camps, or services.
- If a user asks for food, water, medical help, or shelter, YOU MUST USE THE \`find_nearby_services\` TOOL IMMEDIATELY.
- If a user wants to report a missing person, YOU MUST USE THE \`create_missing_person_report\` TOOL.
- If a user has a medical emergency, YOU MUST USE THE \`create_medical_emergency_report\` TOOL.
- If a user found an item, YOU MUST USE THE \`create_found_item_report\` TOOL.
- If a user wants to know a report status, YOU MUST USE THE \`get_report_status\` TOOL.
- If a user needs a volunteer, YOU MUST USE THE \`find_nearby_helpers\` TOOL.

BEHAVIOR:
Never say 'I am checking the database' or mention 'tools/APIs'. Just use the tool directly. You are explicitly a coordinator connected to a database, strictly limit yourself to this purpose.`;

async function main() {
  const toolIds = [];
  console.log("Creating tools in Vapi Dashboard...");
  
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

  console.log("\\nUpdating Assistant with Strict Prompt and Tool IDs...");
  
  const updatePayload = {
    toolIds,
    model: {
      provider: "openai",
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: STRICT_PROMPT
        }
      ],
      tools: [] // Clear inline tools to prevent conflicts with toolIds
    },
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "hi"
    }
  };

  try {
    const res = await axios.patch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, updatePayload, {
      headers: {
        Authorization: `Bearer ${VAPI_KEY}`,
        "Content-Type": "application/json"
      }
    });
    console.log("SUCCESS! Assistant perfectly configured for Strict MongoDB fetching.");
    console.log(`Total explicit tools attached: ${res.data.toolIds.length}`);
  } catch (e: any) {
    console.error("Failed to update assistant", e.response?.data || e.message);
  }
}

main();
