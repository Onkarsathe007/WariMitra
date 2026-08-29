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

    const toolWithToolCallList = message.toolWithToolCallList || [];
    const results = [];

    for (const item of toolWithToolCallList) {
      const toolCall = item.toolCall;
      if (toolCall.type === "function") {
        const { name, arguments: argsString } = toolCall.function;
        let resultContent = "";
        const args = typeof argsString === 'string' ? JSON.parse(argsString || '{}') : (argsString || {});

        try {
          switch (name) {

            case "find_nearby_food":
            case "find_nearby_accommodation":
            case "find_nearby_medical":
            case "find_nearby_water":
            case "find_nearby_camps": {
              const { location_text } = args;
              let serviceType = "food";
              if (name === "find_nearby_accommodation") serviceType = "shelter";
              if (name === "find_nearby_medical") serviceType = "medical";
              if (name === "find_nearby_water") serviceType = "water";
              // fallback for camps
              if (name === "find_nearby_camps") serviceType = args.type || "medical";

              const coords = await resolveLocation(location_text);
              
              if (!coords) {
                resultContent = `माफ करा, '${location_text}' हे ठिकाण मला सापडले नाही. कृपया दुसरे ठिकाण सांगा.`;
                break;
              }

              let items = [];
              if (name === "find_nearby_camps") {
                items = await findNearbyCamps(serviceType, coords.lat, coords.lng);
              } else {
                items = await findNearbyServices(serviceType, coords.lat, coords.lng);
              }

              if (items.length > 0) {
                const topItem = items[0];
                resultContent = `तुमच्या जवळ ${topItem.name} आहे.`;
                
                if (topItem.description) {
                  resultContent += ` ${topItem.description}`;
                }

                if (topItem.contactPhone) {
                  resultContent += ` त्यांचा संपर्क क्रमांक ${topItem.contactPhone.split("").join(" ")} आहे.`;
                }

                // Add Routing directions
                if (topItem.location && topItem.location.lat && topItem.location.lng) {
                  const destLng = topItem.location.lng;
                  const destLat = topItem.location.lat;
                  const directions = await getWalkingDirections(coords.lat, coords.lng, destLat, destLng);
                  
                  if (directions.length > 0) {
                    resultContent += ` येथे जाण्यासाठी मार्ग: ${directions.join(" ")}`;
                  }
                }
              } else {
                resultContent = `सध्या तुमच्या जवळ कोणतीही ${serviceType === 'medical' ? 'वैद्यकीय' : serviceType} सुविधा सापडली नाही.`;
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
                resultContent = `तुमची माहिती नोंदवली गेली आहे. तुमचा रिपोर्ट आयडी ${report.id.substring(0, 4)} आहे. आम्ही लवकरच मदत पाठवू.`;
              } else {
                resultContent = `माफ करा, रिपोर्ट बनवताना अडचण आली. कृपया पुन्हा प्रयत्न करा.`;
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
                resultContent = `वैद्यकीय आणीबाणी नोंदवली गेली आहे. कृपया शांत रहा, मदत पोहोचत आहे.`;
              } else {
                resultContent = `माफ करा, आपत्कालीन रिपोर्ट पाठवण्यात अडचण आली.`;
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
                resultContent = `धन्यवाद, तुमची माहिती नोंदवली गेली आहे. तुमचा रिपोर्ट आयडी ${report.id.substring(0, 4)} आहे.`;
              } else {
                resultContent = `माफ करा, माहिती नोंदवताना अडचण आली.`;
              }
              break;
            }

            case "get_report_status": {
              const { report_id } = args;
              const report = await getReport(report_id);
              if (report) {
                resultContent = `तुमच्या रिपोर्टची सद्यस्थिती '${report.status}' आहे.`;
              } else {
                resultContent = `माफ करा, ${report_id} या क्रमांकाचा कोणताही रिपोर्ट सापडला नाही.`;
              }
              break;
            }

            case "find_nearby_helpers": {
              const helpers = await findHelpers();
              if (helpers && helpers.length > 0) {
                const helper = helpers[0];
                resultContent = `आम्हाला एक स्वयंसेवक सापडला आहे. त्यांचे नाव ${helper.name || 'स्वयंसेवक'} आहे. मी कॉल ट्रान्सफर करत आहे.`;
              } else {
                resultContent = `माफ करा, सध्या कोणताही स्वयंसेवक उपलब्ध नाही.`;
              }
              break;
            }

            default:
              logger.warn({ name }, "Unknown Vapi tool called");
              resultContent = "Error: Unknown tool.";
          }
        } catch (toolError) {
          logger.error({ err: toolError, name, args }, "Error executing Vapi tool");
          resultContent = "माफ करा, तांत्रिक अडचण आली आहे.";
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
