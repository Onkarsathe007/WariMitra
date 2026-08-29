import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

async function run() {
  try {
    const res = await axios.patch("https://api.vapi.ai/assistant/f3e61c8f-894c-41f0-a1ee-6edb39ce98a3", {
      transcriber: {
        provider: "gladia",
        language: "mr"
      }
    }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    console.log("Updated Marathi to Gladia");
  } catch(e: any) {
    console.error("Gladia failed, trying Azure...", e.response?.data || e.message);
    try {
      const res = await axios.patch("https://api.vapi.ai/assistant/f3e61c8f-894c-41f0-a1ee-6edb39ce98a3", {
        transcriber: {
          provider: "azure",
          language: "mr-IN"
        }
      }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
      console.log("Updated Marathi to Azure");
    } catch(e2: any) {
      console.error("Azure failed", e2.response?.data || e2.message);
    }
  }
}
run();
