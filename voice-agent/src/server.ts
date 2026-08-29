import app from "./index";
import { env } from "./config/env";
import { logger } from "./utils/logger";

app.listen(env.PORT, () => {
  logger.info(`Voice Agent Webhook server running on port ${env.PORT}`);
  logger.info(`Health check: http://localhost:${env.PORT}/health`);
  logger.info(`Vapi Tools Webhook: POST http://localhost:${env.PORT}/api/v1/voice/tools`);
});
