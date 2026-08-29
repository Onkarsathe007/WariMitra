import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const VAPI_TOKEN = "cf73b21f-baf6-42dd-b7f7-fe46c57291d1";
const PHONE_NUMBER_ID = "54aaec54-6765-4d1b-9d19-bc62cbc7b386"; // +14348359762
const NGROK_URL = process.argv[2] || "https://PLACEHOLDER_NGROK_URL.ngrok-free.app";

async function main() {
  console.log("Starting Vapi MCP Client...");

  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@vapi-ai/mcp-server"],
    env: {
      ...process.env,
      VAPI_TOKEN: VAPI_TOKEN
    }
  });

  const client = new Client(
    {
      name: "visava-vapi-setup",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  await client.connect(transport);
  console.log("Connected to Vapi MCP Server.");

  console.log("Creating Visava Assistant...");
  try {
    const createResult = await client.callTool({
      name: "create_assistant",
      arguments: {
        name: "Visava Voice Coordinator",
        voice: {
          provider: "11labs",
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
Do not mention "tools" or "APIs" to the user. Just say "Let me check" or "I am submitting the report".`
            }
          ],
          tools: [
            {
              type: "function",
              messages: [{ type: "request-start", content: "शोधत आहे, कृपया थांबा." }],
              function: {
                name: "find_nearby_services",
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
              server: { url: `${NGROK_URL}/api/v1/voice/tools` }
            },
            {
              type: "function",
              messages: [{ type: "request-start", content: "माहिती नोंदवत आहे, कृपया थांबा." }],
              function: {
                name: "create_missing_person_report",
                description: "Creates a report for a missing person.",
                parameters: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Name of the missing person" },
                    age: { type: "number", description: "Age of the missing person" },
                    description: { type: "string", description: "Physical description and clothing" },
                    last_seen_location: { type: "string", description: "Where they were last seen" }
                  },
                  required: ["name", "age", "description", "last_seen_location"]
                }
              },
              server: { url: `${NGROK_URL}/api/v1/voice/tools` }
            },
            {
              type: "function",
              messages: [{ type: "request-start", content: "आणीबाणी नोंदवत आहे, कृपया थांबा." }],
              function: {
                name: "create_medical_emergency_report",
                description: "Creates an emergency medical report.",
                parameters: {
                  type: "object",
                  properties: {
                    description: { type: "string", description: "Description of the medical emergency" },
                    location_text: { type: "string", description: "Where the emergency is happening" }
                  },
                  required: ["description", "location_text"]
                }
              },
              server: { url: `${NGROK_URL}/api/v1/voice/tools` }
            },
            {
              type: "function",
              messages: [{ type: "request-start", content: "माहिती नोंदवत आहे, कृपया थांबा." }],
              function: {
                name: "create_found_item_report",
                description: "Creates a report for a found item.",
                parameters: {
                  type: "object",
                  properties: {
                    item_name: { type: "string", description: "Name of the found item" },
                    description: { type: "string", description: "Description of the found item" },
                    location_text: { type: "string", description: "Where it was found" }
                  },
                  required: ["item_name", "description", "location_text"]
                }
              },
              server: { url: `${NGROK_URL}/api/v1/voice/tools` }
            },
            {
              type: "function",
              messages: [{ type: "request-start", content: "स्थिती तपासत आहे, कृपया थांबा." }],
              function: {
                name: "get_report_status",
                description: "Gets the status of a report by its ID.",
                parameters: {
                  type: "object",
                  properties: {
                    report_id: { type: "string", description: "The ID of the report" }
                  },
                  required: ["report_id"]
                }
              },
              server: { url: `${NGROK_URL}/api/v1/voice/tools` }
            },
            {
              type: "function",
              messages: [{ type: "request-start", content: "स्वयंसेवक शोधत आहे, कृपया थांबा." }],
              function: {
                name: "find_nearby_helpers",
                description: "Finds nearby helpers/volunteers.",
                parameters: {
                  type: "object",
                  properties: {},
                  required: []
                }
              },
              server: { url: `${NGROK_URL}/api/v1/voice/tools` }
            }
          ]
        },
      }
    });

    const assistantDataStr = createResult.content[0].text;
    const assistantData = JSON.parse(assistantDataStr);
    const assistantId = assistantData.id;

    console.log("✅ Assistant created! ID:", assistantId);
    
    // Now we must update the phone number to point to this assistant ID.
    // The MCP server does not have update_phone_number according to our earlier tools/list,
    // only get_phone_number, list_phone_numbers. Wait! The tools list we saw earlier:
    // list_assistants, create_assistant, get_assistant, update_assistant, list_calls, create_call, get_call, list_phone_numbers, get_phone_number, list_tools, get_tool, create_tool, update_tool.
    // There is no `update_phone_number` in the vapi MCP server.
    // I will log instructions to link them.
    console.log(`\nTo connect the assistant to your phone number (+14348359762), please do it manually on the Vapi dashboard, OR use the REST API since the MCP server lacks 'update_phone_number'.`);

  } catch (error) {
    console.error("Error creating assistant via MCP:", error);
  } finally {
    process.exit(0);
  }
}

main();
