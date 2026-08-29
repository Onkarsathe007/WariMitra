import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

async function run() {
  const payload = {
    assistantId: null,
    squadId: "13be142e-c273-460d-8bc7-b83640d90ede"
  };
  try {
    const res = await axios.patch("https://api.vapi.ai/phone-number/54aaec54-6765-4d1b-9d19-bc62cbc7b386", payload, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    console.log("Phone number updated", res.data);
  } catch(e: any) {
    console.error("Failed", e.response?.data || e.message);
  }
}
run();
