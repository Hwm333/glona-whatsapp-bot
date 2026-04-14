import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const API_KEY = process.env.ANTHROPIC_API_KEY;

app.get("/", (req, res) => {
  res.send("Bot is running OK");
});

app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body?.trim() || "";
  console.log("Incoming:", incomingMsg);

  if (!incomingMsg) {
    res.set("Content-Type", "text/xml");
    return res.send(`<Response><Message><![CDATA[اهلاً بك في GLONA! كيف اقدر اساعدك؟ 💜]]></Message></Response>`);
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        system: `You are a professional sales assistant for GLONA skincare store.

IMPORTANT LANGUAGE RULE: Always detect the language of the customer's message and reply in the SAME language.
- If the customer writes in Arabic → reply in Arabic (Gulf dialect)
- If the customer writes in English → reply in English
- If mixed → use the dominant language

Sales instructions:
- If they mention oily skin → suggest products that reduce oil and prevent acne
- If unclear → ask one simple question
- Give direct recommendations
- Be friendly and persuasive
- Never say "I don't understand"`,
        messages: [{ role: "user", content: incomingMsg }]
      })
    });

    const data = await response.json();
    console.log("Claude status:", response.status);

    let reply = data?.content?.[0]?.text || "حياك الله، ممكن توضح اكثر؟";
    console.log("Reply:", reply.substring(0, 80));

    res.set("Content-Type", "text/xml");
    res.send(`<Response><Message><![CDATA[${reply}]]></Message></Response>`);

  } catch (error) {
    console.error("ERROR:", error.message);
    res.set("Content-Type", "text/xml");
    res.send(`<Response><Message><![CDATA[صار خطأ مؤقت، حاول مرة ثانية]]></Message></Response>`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
