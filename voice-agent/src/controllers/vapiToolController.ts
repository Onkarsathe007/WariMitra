import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { resolveLocation } from "../utils/resolveLocation";
import { findNearbyServices, findNearbyCamps, createReport, getReport, findHelpers } from "../services/coreApi";
import { getWalkingDirections } from "../services/routing";

export const handleVapiTools = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    
    // Graceful event handling for Vapi
    if (!message || message.type !== "tool-calls") {
      logger.debug("Received non-tool-call message from Vapi:", req.body?.message?.type);
      res.status(200).json({});
      return;
    }

    const assistantId = message.call?.assistantId;
    const isHindi = assistantId === "7bb66519-cb22-4cf8-9a3c-8701f9200625";
    const isEnglish = assistantId === "a2ea0fcf-2c87-4823-b01d-7a7163a666f2";

    const toolWithToolCallList = message.toolWithToolCallList || [];
    const results = [];

    for (const item of toolWithToolCallList) {
      const toolCall = item.toolCall;
      if (toolCall.type === "function") {
        const { name, arguments: argsString } = toolCall.function;
        let resultContent = "";
        let args: any = {};

        try {
          if (typeof argsString === 'string') {
            args = JSON.parse(argsString || '{}');
          } else {
            args = argsString || {};
          }
          switch (name) {
            case "find_nearby_services":
            case "find_nearby_food":
            case "find_nearby_accommodation":
            case "find_nearby_medical":
            case "find_nearby_water":
            case "find_nearby_camps": {
              const { location_text, type } = args;
              let serviceType = "food";
              if (name === "find_nearby_accommodation" || type === "shelter") serviceType = "shelter";
              if (name === "find_nearby_medical" || type === "medical") serviceType = "medical";
              if (name === "find_nearby_water" || type === "water") serviceType = "water";
              // fallback for camps
              if (name === "find_nearby_camps") serviceType = type || "medical";

              if (!location_text || location_text.trim() === "") {
                resultContent = `Error: Location is missing. Ask the user which village or city they are in.`;
                break;
              }

              const coords = await resolveLocation(location_text);
              
              if (!coords) {
                resultContent = `Error: Could not find the location '${location_text}'. Ask the user to clarify the city or village name.`;
                break;
              }

              const [campItems, serviceItems] = await Promise.all([
                findNearbyCamps(serviceType, coords.lat, coords.lng, 50),
                findNearbyServices(serviceType, coords.lat, coords.lng, 50)
              ]);
              const items = [...campItems, ...serviceItems];

              if (items.length > 0) {
                const topItem = items[0];
                resultContent = `Found ${topItem.name} nearby.`;
                
                if (topItem.description) {
                  resultContent += ` Description: ${topItem.description}.`;
                }

                if (topItem.contactPhone) {
                  resultContent += ` Contact number is ${topItem.contactPhone.split("").join(" ")}.`;
                }

                // Add Routing directions
                if (topItem.location && topItem.location.lat && topItem.location.lng) {
                  const destLng = topItem.location.lng;
                  const destLat = topItem.location.lat;
                  const directions = await getWalkingDirections(coords.lat, coords.lng, destLat, destLng);
                  
                  if (directions.length > 0) {
                    resultContent += ` Walking directions: ${directions.join(" ")}`;
                  }
                }
              } else {
                resultContent = `No ${serviceType} services found nearby.`;
              }
              break;
            }

            case "create_missing_person_report": {
              const { name, age, description, last_seen_location } = args;
              const callerPhone = message.call?.customer?.number || "+910000000000";
              const coords = await resolveLocation(last_seen_location);
              
              const report = await createReport({
                type: "missing_person",
                location: {
                  type: "Point",
                  coordinates: [coords?.lng || 74.0, coords?.lat || 17.0],
                },
                description: `Name: ${name}, Age: ${age}, Description: ${description}`,
                reporterPhone: callerPhone,
                radius: 10,
              });

              if (report) {
                resultContent = `Report successfully created. Report ID is ${report.id.substring(0, 4)}. Help will be dispatched soon.`;
              } else {
                resultContent = `Error: Failed to create report. Please try again.`;
              }
              break;
            }

            case "create_medical_emergency_report": {
              const { description, location_text } = args;
              const callerPhone = message.call?.customer?.number || "+910000000000";
              const coords = await resolveLocation(location_text);
              
              const report = await createReport({
                type: "medical_emergency",
                location: {
                  type: "Point",
                  coordinates: [coords?.lng || 74.0, coords?.lat || 17.0],
                },
                description: `Emergency: ${description}`,
                reporterPhone: callerPhone,
                radius: 5,
              });

              if (report) {
                resultContent = `Medical emergency reported successfully. Please stay calm, help is on the way.`;
              } else {
                resultContent = `Error: Failed to send emergency report.`;
              }
              break;
            }

            case "create_found_item_report": {
              const { item_name, description, location_text } = args;
              const callerPhone = message.call?.customer?.number || "+910000000000";
              const coords = await resolveLocation(location_text);
              
              const report = await createReport({
                type: "found_item",
                location: {
                  type: "Point",
                  coordinates: [coords?.lng || 74.0, coords?.lat || 17.0],
                },
                description: `Found Item: ${item_name}, Description: ${description}`,
                reporterPhone: callerPhone,
                radius: 5,
              });

              if (report) {
                resultContent = `Found item report created. Report ID is ${report.id.substring(0, 4)}.`;
              } else {
                resultContent = `Error: Failed to create report.`;
              }
              break;
            }

            case "get_report_status": {
              const { report_id } = args;
              const report = await getReport(report_id);
              if (report) {
                resultContent = `The current status of your report is '${report.status}'.`;
              } else {
                resultContent = `Error: Could not find any report with ID ${report_id}.`;
              }
              break;
            }

            case "find_nearby_helpers": {
              const helpers = await findHelpers();
              if (helpers && helpers.length > 0) {
                const helper = helpers[0];
                resultContent = `Found a volunteer named ${helper.name || 'Volunteer'}. Transferring call now.`;
              } else {
                resultContent = `Sorry, no volunteers are currently available.`;
              }
              break;
            }

            default:
              logger.warn({ name }, "Unknown Vapi tool called");
              resultContent = "Error: Unknown tool.";
          }
        } catch (toolError) {
          logger.error({ err: toolError, name, args }, "Error executing Vapi tool");
          resultContent = "Error: A technical error occurred while processing the request.";
        }

        results.push({
          toolCallId: toolCall.id,
          result: resultContent,
        });
      }
    }

    res.json({ results });
  } catch (error) {
    logger.error({ err: error }, "Failed to process Vapi tool call");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
