import { serve } from "inngest/next";
import { enrichMessage } from "@/inngest/functions/on-message-created";
import { inngest } from "@/inngest/client";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [enrichMessage],
});
