const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const D360_API_KEY = process.env.D360_API_KEY;

app.get("/", (req, res) => {
  res.send("WhatsApp Gemini Bot is running ✅");
});

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const messages =
      req.body?.messages ||
      req.body?.entry?.[0]?.changes?.[0]?.value?.messages;

    if (!messages || !messages.length) return;

    const message = messages[0];

    if (message.type !== "text") return;

    const from = message.from;
    const text = message.text?.body;

    if (!from || !text) return;

    if (!GEMINI_API_KEY || !D360_API_KEY) {
      console.error("Missing API keys");
      return;
    }

    // Send user message to Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: text,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      console.error(
        "Gemini error:",
        geminiResponse.status,
        await geminiResponse.text()
      );
      return;
    }

    const geminiData = await geminiResponse.json();

    const reply =
      geminiData?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

    if (!reply) {
      console.error("No Gemini reply");
      return;
    }

    // Send Gemini reply through 360dialog Sandbox
    const whatsappResponse = await fetch(
      "https://waba-sandbox.360dialog.io/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "D360-API-KEY": D360_API_KEY,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: from,
          type: "text",
          text: {
            body: reply,
          },
        }),
      }
    );

    if (!whatsappResponse.ok) {
      console.error(
        "360dialog error:",
        whatsappResponse.status,
        await whatsappResponse.text()
      );
      return;
    }

    console.log("Reply sent successfully");
  } catch (error) {
    console.error("Webhook error:", error);
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Bot running on port ${PORT}`);
});
