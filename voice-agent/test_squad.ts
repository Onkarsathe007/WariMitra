import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

async function createSquad() {
  const payload = {
    name: "Visava Squad",
    members: [
      { assistantId: "f3e61c8f-894c-41f0-a1ee-6edb39ce98a3" }, // Marathi
      { assistantId: "7bb66519-cb22-4cf8-9a3c-8701f9200625" }, // Hindi
      { assistantId: "a2ea0fcf-2c87-4823-b01d-7a7163a666f2" }  // English
    ]
  };
  try {
    const res = await axios.post("https://api.vapi.ai/squad", payload, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    console.log("Squad created!", res.data);
  } catch(e: any) {
    console.error("Squad creation failed", e.response?.data || e.message);
  }
}
createSquad();
