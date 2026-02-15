import { Router } from 'express';
import { CopilotRuntime } from '@copilotkit/backend';

const router = Router();

// Ensure OPENAI_API_KEY is set in your environment variables for the backend
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in the backend environment. CopilotKit backend AI features will not function.');
}

const copilotRuntime = new CopilotRuntime({
  actions: [
    // Define any custom backend actions your AI can invoke here.
    // These actions can interact with your database, other APIs, etc.
    // Example:
    // {
    //   name: "getSupplierRfqHistory",
    //   description: "Fetches the RFQ history for a specific supplier.",
    //   argumentAnnotations: [
    //     { name: "supplierId", type: "string", description: "The ID of the supplier.", required: true },
    //   ],
    //   implementation: async (supplierId) => {
    //     // Replace with your actual logic to fetch supplier RFQ history
    //     console.log(`Backend Action: Fetching RFQ history for supplier: ${supplierId}`);
    //     return { rfqCount: 10, lastRfqDate: "2024-05-01" }; // Example data
    //   },
    // },
  ],
  // If you are using LangServe, you can configure it here:
  // langserve: [
  //   {
  //     chainUrl: "http://localhost:8080/my-chain", // URL of your LangServe chain
  //     name: "myCustomChain",
  //     description: "A custom LangServe chain for specific tasks."
  //   }
  // ]
  // The OpenAI API key is typically picked up from process.env.OPENAI_API_KEY by default.
  // You can explicitly pass it if needed: openaiApiKey: process.env.OPENAI_API_KEY,
});

router.post('/chat', async (req, res) => {
  try {
    // streamHttpServerResponse handles the request and streams the response back to the client.
    // It uses the messages from req.body and any configured actions/LangServe chains.
    await copilotRuntime.streamHttpServerResponse(req, res);
  } catch (error) {
    console.error('Error in /api/ai/chat endpoint:', error);
    // Ensure headers are not already sent before trying to send an error response
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process AI request due to an internal server error.' });
    }
  }
});

export default router;
