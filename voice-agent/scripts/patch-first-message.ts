import axios from "axios";

const VAPI_KEY = "f3650da9-2910-42dc-80cd-cd432ffc6146";

const HINDI_FIRST_MESSAGE = "नमस्ते, मैं विसावा हूँ। मैं आपको खाना, पानी, मेडिकल या रुकने की जगह ढूंढने में मदद कर सकता हूँ। आपको क्या चाहिए?";
const MARATHI_FIRST_MESSAGE = "नमस्कार, मी विसावा आहे. मी तुम्हाला जेवण, पाणी, वैद्यकीय मदत किंवा निवारा शोधण्यात मदत करू शकतो. तुम्हाला काय हवे आहे?";
const ENGLISH_FIRST_MESSAGE = "Hello, I am Visava. I can help you find food, water, medical camps, or shelter. How can I help you today?";

async function patchAssistant(id: string, firstMessage: string) {
  try {
    const res = await axios.patch(`https://api.vapi.ai/assistant/${id}`, {
      firstMessage: firstMessage,
      firstMessageMode: "assistant-speaks-first"
    }, {
      headers: { Authorization: `Bearer ${VAPI_KEY}`, "Content-Type": "application/json" }
    });
    console.log(`✅ Patched Assistant ${id} with firstMessage successfully.`);
  } catch (e: any) {
    console.error(`❌ Failed to patch assistant ${id}`, e.response?.data || e.message);
  }
}

async function main() {
  await patchAssistant("3691ae1c-c192-4c79-971b-d540d32ab15c", HINDI_FIRST_MESSAGE);
  await patchAssistant("3760d6bc-5de6-4bbf-b295-9beaeaf657b2", MARATHI_FIRST_MESSAGE);
  await patchAssistant("be4d8321-13cc-4abf-b37d-c2ff616a8c00", ENGLISH_FIRST_MESSAGE);
  console.log("Done!");
}

main();
