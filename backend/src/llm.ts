import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, Output } from 'ai';
import { z } from 'zod';

const detectedItemSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().describe("Name of the food item"),
      quantity: z.number().describe("Estimated quantity"),
      unit: z.string().describe("Unit of measurement (e.g., pieces, lbs, oz, cups)"),
      category: z.enum([
        "dairy",
        "meat",
        "vegetables",
        "fruits",
        "beverages",
        "condiments",
        "leftovers",
        "other",
      ]).describe("Food category"),
      estimatedExpiryDays: z
        .number()
        .describe("Estimated days until expiration based on typical shelf life"),
      confidence: z.number().describe("Confidence score 0-1"),
    })
  ),
});

export type DetectedItemsResult = z.infer<typeof detectedItemSchema>;

export const analyzeImage = async (base64: string): Promise<DetectedItemsResult> => {
  const imageData = `data:image/jpeg;base64,${base64}`;

  const openRouterHeaders: Record<string, string> = {};

  if (process.env.OPENROUTER_SITE_URL) {
    openRouterHeaders["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
  }

  if (process.env.OPENROUTER_APP_NAME) {
    openRouterHeaders["X-OpenRouter-Title"] = process.env.OPENROUTER_APP_NAME;
  }

  const openrouter = createOpenRouter({
    headers: openRouterHeaders,
  });

  const { output: structuredOutput } = await generateText({
    model: openrouter.chat('google/gemini-2.5-flash'),
    output: Output.object({
      schema: detectedItemSchema,
      name: 'detected_items',
      description: 'Detected fridge items with quantities, categories, confidence, and estimated expiry.',
    }),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this fridge photo and identify all food items. For each item, provide the name, quantity, unit, food category, and estimated days until expiration based on typical shelf life. Be realistic about expiration dates.',
          },
          { type: 'image', image: imageData },
        ],
      },
    ],
  });

  return structuredOutput;
};
