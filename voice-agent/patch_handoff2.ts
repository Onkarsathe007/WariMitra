import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

const ASSISTANTS = {
  marathi: "d6699c02-c244-44e5-9761-9f26cd73f58b",
  hindi: "96b1d8b1-e93a-4277-b9a9-f847ab6741f6",
  english: "ada09182-700a-42b9-8d5a-5873c89c2bda"
};

const TOOLS = {
  toMarathi: "f9951dcd-dcbb-4cc0-95cb-23c8cfa0a4b1",
  toHindi: "f713fce6-c00e-49bc-a50b-b5b96e8feb01",
  toEnglish: "c795afcb-d4ef-4b7b-a22c-8ac3cf8c67a7"
};

async function updateToHandoff(toolId: string, assistantId: string, functionName: string) {
  try {
    const payload = {
      type: "transferCall",
      async: false,
      function: {
        name: functionName,
        description: `Transfer the caller to ${functionName.split('_').pop()} language assistant`,
        parameters: { type: "object", properties: {} }
      },
      destinations: [
        {
          type: "assistant",
          assistantId: assistantId,
          description: "Transfer to assistant"
        }
      ]
    };
    await axios.patch(`https://api.vapi.ai/tool/${toolId}`, payload, {
      headers: { Authorization: `Bearer ${VAPI_KEY}` }
    });
    console.log(`Updated tool ${toolId} to use assistantId for ${assistantId}`);
  } catch(e: any) {
    console.error("Failed to update tool", e.response?.data || e.message);
  }
}

async function run() {
  await updateToHandoff(TOOLS.toMarathi, ASSISTANTS.marathi, "transfer_to_visava_marathi");
  await updateToHandoff(TOOLS.toHindi, ASSISTANTS.hindi, "transfer_to_visava_hindi");
  await updateToHandoff(TOOLS.toEnglish, ASSISTANTS.english, "transfer_to_visava_english");
  console.log("Done updating tools.");
}
run();
