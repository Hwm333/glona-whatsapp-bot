import express from "express";
import bodyParser from "body-parser";

console.log("Starting app...");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const API_KEY = process.env.ANTHROPIC_API_KEY;
console.log("API_KEY loaded:", API_KEY ? "YES" : "NO");

app.get("/", (req, res) => {
  res.send("Bot is running OK");
});

app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body?.trim() || "";
  console.log("Incoming message:", incomingMsg);

  if (!incomingMsg) {
    res.set("Content-Type", "text/xml");
    return res.send(`<Response><Message><![CDATA[ahlan! kaif agdar asaedak?]]></Message></Response>`);
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
        system: "You are a helpful sales assistant for GLONA skincare store. Respond in Arabic Gulf dialect. Be friendly and helpful.",
        messages: [{ role: "user", content: incomingMsg }]
      })
    });

    const data = await response.json();
    console.log("Claude status:", response.status);

    let reply = data?.content?.[0]?.text || "hayak allah, momken towadeh akthar?";
    console.log("Reply:", reply.substring(0, 50));

    res.set("Content-Type", "text/xml");
    res.send(`<Response><Message><![CDATA[${reply}]]></Message></Response>`);

  } catch (error) {
    console.error("ERROR:", error.message);
    res.set("Content-Type", "text/xml");
    res.send(`<Response><Message><![CDATA[sara5 mowaqat, hawi mara thanya]]></Message></Response>`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
