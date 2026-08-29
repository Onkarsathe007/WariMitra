import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

// The only IDs we want to KEEP
const KEEP_ASSISTANTS = [
  "d6699c02-c244-44e5-9761-9f26cd73f58b", // VisavaMarathi
  "96b1d8b1-e93a-4277-b9a9-f847ab6741f6", // VisavaHindi
  "ada09182-700a-42b9-8d5a-5873c89c2bda"  // VisavaEnglish
];

const KEEP_TOOLS = [
  "f3d4d839-5d62-4d68-914b-60a9a01729c8", // find_nearby_food
  "44dd7e26-e3c6-4f5e-abdc-84865de2999e", // find_nearby_accommodation
  "41732762-f609-49c0-9ad0-14ee7ae83dd2", // find_nearby_medical
  "6be4be2b-9042-4dba-a635-71529e011586", // find_nearby_water
  "79395c96-e9fc-45f3-bfcf-67365609a46c", // create_missing_person_report
  "e2823ffd-22e6-4764-b76a-02335632e387", // create_medical_emergency_report
  "7e1bb2c0-fac1-4fb6-8d9d-bf281a3ae702", // create_found_item_report
  "39e5bacd-527f-4eec-a83b-5ceeabf276e5", // get_report_status
  "ad2097fb-7247-4255-b3cc-c668bcb02801", // find_nearby_helpers
  "f9951dcd-dcbb-4cc0-95cb-23c8cfa0a4b1", // transfer_to_visava_marathi
  "f713fce6-c00e-49bc-a50b-b5b96e8feb01", // transfer_to_visava_hindi
  "c795afcb-d4ef-4b7b-a22c-8ac3cf8c67a7"  // transfer_to_visava_english
];

async function run() {
  console.log("Fetching all assistants...");
  const asstRes = await axios.get("https://api.vapi.ai/assistant", { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  for (const asst of asstRes.data) {
    if (!KEEP_ASSISTANTS.includes(asst.id)) {
      console.log(`Deleting old assistant: ${asst.name} (${asst.id})`);
      try {
        await axios.delete(`https://api.vapi.ai/assistant/${asst.id}`, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
      } catch(e: any) { console.error("Failed to delete", asst.id, e.response?.data); }
    }
  }

  console.log("Fetching all tools...");
  const toolRes = await axios.get("https://api.vapi.ai/tool", { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  for (const tool of toolRes.data) {
    if (!KEEP_TOOLS.includes(tool.id)) {
      console.log(`Deleting old tool: ${tool.name || tool.type} (${tool.id})`);
      try {
        await axios.delete(`https://api.vapi.ai/tool/${tool.id}`, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
      } catch(e: any) { console.error("Failed to delete tool", tool.id); }
    }
  }

  console.log("Updating phone number...");
  try {
    await axios.patch("https://api.vapi.ai/phone-number/54aaec54-6765-4d1b-9d19-bc62cbc7b386", {
      assistantId: KEEP_ASSISTANTS[0] // Bind to VisavaMarathi
    }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    console.log("Phone number linked to VisavaMarathi");
  } catch(e: any) { console.error("Failed to bind phone number", e.response?.data); }

  console.log("Nuke and Pave Complete!");
}
run();
