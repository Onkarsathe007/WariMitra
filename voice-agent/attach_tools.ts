import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

async function attachTools() {
  const asstRes = await axios.get("https://api.vapi.ai/assistant", { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  const assistants = asstRes.data;
  
  const toolRes = await axios.get("https://api.vapi.ai/tool", { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  const tools = toolRes.data;

  const commonTools = tools.filter(t => t.type === "function").map(t => t.id);
  const transferMarathi = tools.find(t => t.function?.name === "transfer_to_visava_marathi")?.id;
  const transferHindi = tools.find(t => t.function?.name === "transfer_to_visava_hindi")?.id;
  const transferEnglish = tools.find(t => t.function?.name === "transfer_to_visava_english")?.id;

  for (const asst of assistants) {
    let toolIds = [...commonTools];
    if (asst.name === "VisavaMarathi") {
      toolIds.push(transferHindi, transferEnglish);
    } else if (asst.name === "VisavaHindi") {
      toolIds.push(transferMarathi, transferEnglish);
    } else if (asst.name === "VisavaEnglish") {
      toolIds.push(transferMarathi, transferHindi);
    }
    
    await axios.patch(`https://api.vapi.ai/assistant/${asst.id}`, {
      model: {
        ...asst.model,
        toolIds: toolIds
      }
    }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    console.log(`Attached tools to ${asst.name}`);
  }
}
attachTools();
