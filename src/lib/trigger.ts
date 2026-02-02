import { client } from "@trigger.dev/sdk/v3";

// Initialize Trigger.dev client
export const triggerClient = client({
  id: "skyfall-dashboard",
  apiKey: process.env.TRIGGER_API_KEY!,
});
