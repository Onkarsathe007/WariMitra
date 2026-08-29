import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

const assistants = {
  "d6699c02-c244-44e5-9761-9f26cd73f58b": "VisavaMarathi",
  "96b1d8b1-e93a-4277-b9a9-f847ab6741f6": "VisavaHindi",
  "ada09182-700a-42b9-8d5a-5873c89c2bda": "VisavaEnglish"
};

const tools = {
  "f9951dcd-dcbb-4cc0-95cb-23c8cfa0a4b1": "VisavaMarathi",
  "f713fce6-c00e-49bc-a50b-b5b96e8feb01": "VisavaHindi",
  "c795afcb-d4ef-4b7b-a22c-8ac3cf8c67a7": "VisavaEnglish"
};

async function run() {
  for (const [id, name] of Object.entries(assistants)) {
    await axios.patch(`https://api.vapi.ai/assistant/${id}`, { name }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    console.log(`Updated assistant ${id} to ${name}`);
  }

  for (const [id, name] of Object.entries(tools)) {
    const desc = `Transfer if user speaks ${name.replace("Visava", "")}`;
    await axios.patch(`https://api.vapi.ai/tool/${id}`, {
      destinations: [{
        type: "assistant",
        assistantName: name,
        description: desc
      }]
    }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    console.log(`Updated tool ${id} to point to ${name}`);
  }
}
run();
