import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

async function run() {
  const payload = {
    type: "handoff",
    function: {
      name: "test_handoff",
      description: "Transfer if user speaks Marathi"
    },
    destinations: [{ type: "assistant", assistantName: "VisavaMarathi", description: "Transfer" }]
  };
  try {
    const res = await axios.post("https://api.vapi.ai/tool", payload, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    console.log("Handoff tool created", res.data);
  } catch(e: any) {
    console.error("Failed", e.response?.data || e.message);
  }
}
run();
