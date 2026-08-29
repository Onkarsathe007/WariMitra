import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

const marathiId = "d6699c02-c244-44e5-9761-9f26cd73f58b";

async function run() {
  try {
    await axios.patch(`https://api.vapi.ai/assistant/${marathiId}`, {
      transcriber: {
        provider: "talkscriber",
        model: "whisper",
        language: "mr"
      }
    }, {
      headers: { Authorization: `Bearer ${VAPI_KEY}` }
    });
    console.log(`Fixed transcriber for ${marathiId}`);
  } catch(e: any) {
    console.error(`Failed to fix transcriber for ${marathiId}`, e.response?.data || e.message);
  }
}
run();
