import axios from "axios";
import "dotenv/config";
const VAPI_KEY = process.env.VAPI_PRIVATE_KEY || "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";

async function run() {
  const toolRes = await axios.get("https://api.vapi.ai/tool", { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  const tools = toolRes.data;

  // Delete all transferCall and handoff tools
  for (const t of tools) {
    if (t.type === "transferCall" || t.type === "handoff") {
      console.log(`Deleting ${t.type} tool ${t.id}`);
      await axios.delete(`https://api.vapi.ai/tool/${t.id}`, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    }
  }

  // Create new handoff tools
  const createHandoff = async (lang: string, asstName: string) => {
    const payload = {
      type: "handoff",
      function: {
        name: `transfer_to_visava_${lang.toLowerCase()}`,
        description: `Transfer if user speaks ${lang}`
      },
      destinations: [{ type: "assistant", assistantName: asstName, description: "Transfer" }]
    };
    const res = await axios.post("https://api.vapi.ai/tool", payload, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    return res.data.id;
  };

  const idMarathi = await createHandoff("Marathi", "VisavaMarathi");
  const idHindi = await createHandoff("Hindi", "VisavaHindi");
  const idEnglish = await createHandoff("English", "VisavaEnglish");
  console.log("Created handoffs:", idMarathi, idHindi, idEnglish);

  // Attach to assistants
  const asstRes = await axios.get("https://api.vapi.ai/assistant", { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
  const assistants = asstRes.data;

  const commonTools = tools.filter(t => t.type === "function" && !t.name?.startsWith("transfer_")).map(t => t.id);

  for (const asst of assistants) {
    let toolIds = [...commonTools];
    if (asst.name === "VisavaMarathi") toolIds.push(idHindi, idEnglish);
    if (asst.name === "VisavaHindi") toolIds.push(idMarathi, idEnglish);
    if (asst.name === "VisavaEnglish") toolIds.push(idMarathi, idHindi);
    
    await axios.patch(`https://api.vapi.ai/assistant/${asst.id}`, {
      model: { ...asst.model, toolIds }
    }, { headers: { Authorization: `Bearer ${VAPI_KEY}` } });
    console.log(`Attached handoffs to ${asst.name}`);
  }
}
run();
