import { Elysia, t } from "elysia";
import { openapi } from "@elysiajs/openapi";

import { analyzeImage } from "./llm";

const port = Number(process.env.PORT ?? "3000");

const detectedItemSchema = t.Object({
  name: t.String(),
  quantity: t.Number(),
  unit: t.String(),
  category: t.Union([
    t.Literal("dairy"),
    t.Literal("meat"),
    t.Literal("vegetables"),
    t.Literal("fruits"),
    t.Literal("beverages"),
    t.Literal("condiments"),
    t.Literal("leftovers"),
    t.Literal("other"),
  ]),
  estimatedExpiryDays: t.Number(),
  confidence: t.Number(),
});

const analyzeImageBodySchema = t.Object({
  base64: t.String({
    description: "Base64 encoded image payload without the data URI prefix.",
  }),
});

const analyzeImageResponseSchema = t.Object({
  items: t.Array(detectedItemSchema),
});

const errorResponseSchema = t.Object({
  error: t.String(),
});

const app = new Elysia()
  .use(openapi())
  .get("/", () => ({ status: "ok" }))
  .post(
    "/analyze-image",
    async ({ body, set }) => {
      const { base64 } = body;

      if (!base64) {
        set.status = 400;
        return { error: "Missing base64 image payload." };
      }

      try {
        return await analyzeImage(base64);
      } catch (error) {
        console.error("Image analysis failed", error);
        set.status = 500;
        return { error: "Failed to analyze image." };
      }
    },
    {
      body: analyzeImageBodySchema, 
      response: {
        200: analyzeImageResponseSchema,
        400: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: "Analyze a fridge image",
        description:
          "Detects food items from a fridge photo and estimates their shelf life.",
      },
    }
  )
  .listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
