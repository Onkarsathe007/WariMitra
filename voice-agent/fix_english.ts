import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

async function run() {
  const toolRes = await axios.get("https://api.vapi.ai/tool", { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  const tools = toolRes.data;

  const commonTools = tools.filter(t => t.type === "function").map(t => t.id);
  const idMarathi = tools.find(t => t.type === "handoff" && t.destinations[0].assistantName === "VisavaMarathi")?.id;
  const idHindi = tools.find(t => t.type === "handoff" && t.destinations[0].assistantName === "VisavaHindi")?.id;
  const idEnglish = tools.find(t => t.type === "handoff" && t.destinations[0].assistantName === "VisavaEnglish")?.id;

  const asstRes = await axios.get("https://api.vapi.ai/assistant", { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  
  for (const asst of asstRes.data) {
    let newToolIds = [...commonTools];
    if (asst.name === "VisavaMarathi") newToolIds.push(idHindi, idEnglish);
    if (asst.name === "VisavaHindi") newToolIds.push(idMarathi, idEnglish);
    if (asst.name === "VisavaEnglish") newToolIds.push(idMarathi, idHindi);
    
    // Filter out undefined just in case
    newToolIds = newToolIds.filter(Boolean);

    console.log(`Setting tools for ${asst.name} to:`, newToolIds);

    const updatedModel = {
      provider: asst.model.provider,
      model: asst.model.model,
      messages: asst.model.messages,
      toolIds: newToolIds
    };

    try {
      await axios.patch(`https://api.vapi.ai/assistant/${asst.id}`, {
        model: updatedModel
      }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
      console.log(`Updated ${asst.name}`);
    } catch(e: any) {
      console.error(`Failed ${asst.name}`, e.response?.data || e.message);
    }
  }
}
run();
