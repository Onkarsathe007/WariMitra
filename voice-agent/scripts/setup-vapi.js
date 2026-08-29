const axios = require("axios");

const VAPI_PRIVATE_KEY = "f3650da9-2910-42dc-80cd-cd432ffc6146";
const PHONE_NUMBER_ID = "54aaec54-6765-4d1b-9d19-bc62cbc7b386"; // +14348359762

const vapiApi = axios.create({
  baseURL: "https://api.vapi.ai",
  headers: {
    Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
    "Content-Type": "application/json",
  },
});

async function main() {
  const ngrokUrl = process.argv[2];
  if (!ngrokUrl) {
    console.log("Please provide your public Ngrok URL as an argument.");
    console.log("Example: node setup-vapi.js https://xyz.ngrok-free.app");
    return;
  }

  console.log("Creating Visava Vapi Assistant...");

  try {
    // 1. Create the assistant
    const assistantResponse = await vapiApi.post("/assistant", {
      name: "Visava Voice Coordinator",
      voice: {
        provider: "11labs", // Or standard google/azure depending on language needs
        voiceId: "cgSgspJ2msm6clMCkdW9",
      },
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are Visava, a helpful AI emergency coordinator for the Varkaris. 
            Speak in Marathi or Hindi primarily. You help them find medical camps, food, water, and report missing persons.
            Use the available tools to find information or submit reports.
            Do not mention "tools" or "APIs" to the user. Just say "let me check" or "I am submitting the report".`,
          },
        ],
        tools: [
          {
            type: "dtmf"
          },
          {
            type: "function",
            messages: [
              {
                type: "request-start",
                content: "Let me check for nearby facilities."
              }
            ],
            function: {
              name: "find_services",
              description: "Finds nearby medical, food, or water camps.",
              parameters: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["medical", "food", "water", "shelter"] },
                  location_text: { type: "string", description: "The spoken location name, e.g., Pandharpur" }
                },
                required: ["type", "location_text"]
              }
            },
            server: {
              url: `${ngrokUrl}/api/v1/vapi/tools`
            }
          }
        ]
      },
    });

    const assistantId = assistantResponse.data.id;
    console.log("✅ Assistant created successfully! ID:", assistantId);

    // 2. Attach it to the phone number
    console.log(`Attaching assistant to phone number ID: ${PHONE_NUMBER_ID}...`);
    await vapiApi.patch(`/phone-number/${PHONE_NUMBER_ID}`, {
      assistantId: assistantId,
    });

    console.log("✅ Phone number updated successfully! You can now call +14348359762 to test.");
    console.log("");
    console.log("Make sure to update index.html with this ASSISTANT_ID if you want to use the Web client.");
  } catch (error) {
    console.error("❌ Error setting up Vapi:");
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

main();
