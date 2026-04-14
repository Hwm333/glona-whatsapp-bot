import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// ✅ جلب API KEY من Railway (آمن)
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error("❌ Missing ANTHROPIC_API_KEY");
}

// ✅ Webhook حق واتساب
app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body || "";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307", // ✅ موديل شغال
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `
أنت موظف مبيعات محترف لمتجر GLONA للعناية بالبشرة.

افهم رسالة العميل حتى لو كانت قصيرة.

تعليمات:
- إذا قال "بشرة دهنية" → اقترح منتجات تقلل الدهون وتمنع الحبوب
- إذا ما وضح → اسأله سؤال بسيط
- أعطِ توصية مباشرة (لا تقول "ما فهمت")
- استخدم أسلوب خليجي بسيط
- حاول تقنع العميل بالشراء بشكل ذكي

مثال:
"إذا بشرتك دهنية أنصحك بغسول ينظف الدهون + سيروم خفيف..."

رسالة العميل:
${incomingMsg}
`
          }
        ]
      })
    });

    const data = await response.json();
    console.log("Claude response:", JSON.stringify(data, null, 2));

    // ✅ استخراج الرد بشكل آمن
    let reply = data?.content?.[0]?.text;

    if (!reply) {
      reply = "حياك الله 💜 ممكن توضح لي أكثر عشان أساعدك بشكل أفضل؟";
    }

    // ✅ رد واتساب (Twilio XML)
    res.set("Content-Type", "text/xml");
    res.send(`
<Response>
  <Message>${reply}</Message>
</Response>
    `);

  } catch (error) {
    console.error("❌ ERROR:", error);

    res.send(`
<Response>
  <Message>صار خطأ مؤقت 🙏 حاول مرة ثانية بعد شوي</Message>
</Response>
    `);
  }
});

// ✅ تشغيل السيرفر
app.listen(3000, () => console.log("🚀 Server running on port 3000"));
