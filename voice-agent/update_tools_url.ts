import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

async function run() {
  const toolRes = await axios.get("https://api.vapi.ai/tool", { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  const tools = toolRes.data;

  for (const t of tools) {
    if (t.type === "function" && t.server) {
      const correctUrl = "https://alfalfa-copartner-yearning.ngrok-free.dev/api/v1/voice/tools";
      if (t.server.url !== correctUrl) {
        console.log(`Updating tool ${t.function.name} to correct URL`);
        await axios.patch(`https://api.vapi.ai/tool/${t.id}`, {
          server: { url: correctUrl }
        }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
      }
    }
  }
  
  // Re-attach to assistants to update inline config
  const asstRes = await axios.get("https://api.vapi.ai/assistant", { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  const assistants = asstRes.data;
  
  const updatedToolRes = await axios.get("https://api.vapi.ai/tool", { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  const updatedTools = updatedToolRes.data;

  const commonTools = updatedTools.filter(t => t.type === "function" && !t.name?.startsWith("transfer_")).map(t => t.id);
  const idMarathi = updatedTools.find(t => t.type === "handoff" && t.destinations[0].assistantName === "VisavaMarathi")?.id;
  const idHindi = updatedTools.find(t => t.type === "handoff" && t.destinations[0].assistantName === "VisavaHindi")?.id;
  const idEnglish = updatedTools.find(t => t.type === "handoff" && t.destinations[0].assistantName === "VisavaEnglish")?.id;

  for (const asst of assistants) {
    let toolIds = [...commonTools];
    if (asst.name === "VisavaMarathi") toolIds.push(idHindi, idEnglish);
    if (asst.name === "VisavaHindi") toolIds.push(idMarathi, idEnglish);
    if (asst.name === "VisavaEnglish") toolIds.push(idMarathi, idHindi);
    
    await axios.patch(`https://api.vapi.ai/assistant/${asst.id}`, {
      model: { ...asst.model, toolIds }
    }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    console.log(`Re-attached updated tools to ${asst.name}`);
  }
}
run();
