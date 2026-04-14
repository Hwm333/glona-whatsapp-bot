import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) console.error("❌ Missing ANTHROPIC_API_KEY");

app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body?.trim() || "";

  // رسالة فارغة
  if (!incomingMsg) {
    res.set("Content-Type", "text/xml");
    return res.send(`<Response><Message><![CDATA[أهلاً! كيف أقدر أساعدك؟ 💜]]></Message></Response>`);
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
        system: `أنت موظف مبيعات محترف لمتجر GLONA للعناية بالبشرة.
افهم رسالة العميل حتى لو كانت قصيرة.
تعليمات:
- إذا قال "بشرة دهنية" → اقترح منتجات تقلل الدهون وتمنع الحبوب
- إذا ما وضح → اسأله سؤال بسيط
- أعطِ توصية مباشرة (لا تقول "ما فهمت")
- استخدم أسلوب خليجي بسيط
- حاول تقنع العميل بالشراء بشكل ذكي`,
        messages: [{ role: "user", content: incomingMsg }]
      })
    });

    const data = await response.json();
    console.log("Claude response:", JSON.stringify(data, null, 2));

    let reply = data?.content?.[0]?.text
      || "حياك الله 💜 ممكن توضح لي أكثر عشان أساعدك بشكل أفضل؟";

    res.set("Content-Type", "text/xml");
    res.send(`<Response><Message><![CDATA[${reply}]]></Message></Response>`);

  } catch (error) {
    console.error("❌ ERROR:", error);
    res.set("Content-Type", "text/xml");
    res.send(`<Response><Message><![CDATA[صار خطأ مؤقت 🙏 حاول مرة ثانية بعد شوي]]></Message></Response>`);
  }
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () =>
  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`)
);
