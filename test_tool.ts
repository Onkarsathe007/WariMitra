import axios from "axios";
const VAPI_KEY = "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

async function run() {
  const res = await axios.get("https://api.vapi.ai/tool/f9951dcd-dcbb-4cc0-95cb-23c8cfa0a4b1", {
    headers: { Authorization: `Bearer ${VAPI_KEY}` }
  });
  console.log(JSON.stringify(res.data, null, 2));
}
run();
