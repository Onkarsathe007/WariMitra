import axios from "axios";
import { logger } from "../src/utils/logger";

const BASE_URL = "http://localhost:4000/api/v1/voice/tools";

async function testWebhook() {
  console.log("Testing Vapi Webhook - Event: Non-tool-call (status-update)...");
  try {
    const statusUpdateRes = await axios.post(BASE_URL, {
      message: {
        type: "status-update",
        status: "in-progress"
      }
    });
    console.log("✅ status-update response:", statusUpdateRes.data);
  } catch (e: any) {
    console.error("❌ status-update failed:", e.message);
  }

  console.log("\nTesting Vapi Webhook - Event: tool-calls (find_nearby_helpers)...");
  try {
    const toolCallRes = await axios.post(BASE_URL, {
      message: {
        type: "tool-calls",
        call: {
          customer: {
            number: "+919876543210"
          }
        },
        toolWithToolCallList: [
          {
            tool: {
              type: "function",
              function: {
                name: "find_nearby_helpers"
              }
            },
            toolCall: {
              id: "call_abc123",
              type: "function",
              function: {
                name: "find_nearby_helpers",
                arguments: "{}"
              }
            }
          }
        ]
      }
    });
    console.log("✅ tool-calls (find_nearby_helpers) response:", JSON.stringify(toolCallRes.data, null, 2));
  } catch (e: any) {
    console.error("❌ tool-calls failed:", e.message);
  }
}

testWebhook();
