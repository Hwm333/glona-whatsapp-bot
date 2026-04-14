import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `
أنت موظف مبيعات لمتجر GLONA.
تكلم بأسلوب احترافي وبسيط.
اقترح منتجات إذا مناسب.
حاول تقنع العميل بالشراء.

رسالة العميل:
${incomingMsg}
`
          }
        ]
      })
    });

    const data = await response.json();
    const reply = data.content[0].text;

    res.set("Content-Type", "text/xml");
    res.send(`
      <Response>
        <Message>${reply}</Message>
      </Response>
    `);

  } catch (error) {
    console.error(error);
    res.send(`
      <Response>
        <Message>صار خطأ، حاول مرة ثانية</Message>
      </Response>
    `);
  }
});

app.listen(3000, () => console.log("Server running"));
