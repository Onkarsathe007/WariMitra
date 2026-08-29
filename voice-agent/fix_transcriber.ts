import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

const ASSISTANTS = {
  marathi: "d6699c02-c244-44e5-9761-9f26cd73f58b",
  hindi: "96b1d8b1-e93a-4277-b9a9-f847ab6741f6",
  english: "ada09182-700a-42b9-8d5a-5873c89c2bda"
};

async function fixTranscriber(id: string, lang: string) {
  try {
    await axios.patch(`https://api.vapi.ai/assistant/${id}`, {
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: lang
      }
    }, {
      headers: { Authorization: `Bearer ${VAPI_KEY}` }
    });
    console.log(`Fixed transcriber for ${id}`);
  } catch(e: any) {
    console.error(`Failed to fix transcriber for ${id}`, e.response?.data || e.message);
  }
}

async function run() {
  await fixTranscriber(ASSISTANTS.marathi, "mr");
  await fixTranscriber(ASSISTANTS.hindi, "hi");
  await fixTranscriber(ASSISTANTS.english, "en");
}
run();
