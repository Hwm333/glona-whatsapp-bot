import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const API_KEY = process.env.ANTHROPIC_API_KEY;

// ✅ تأكد المفتاح موجود
if (!API_KEY) {
  console.error("❌ Missing ANTHROPIC_API_KEY");
}

app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body;

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
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `أنت موظف مبيعات محترف لمتجر GLONA متخصص في منتجات العناية بالبشرة.

التعليمات:
- افهم طلب العميل بسرعة
- رد بشكل مباشر بدون تعقيد
- اقترح منتجات مناسبة حسب نوع البشرة
- اذكر الفوائد بشكل مختصر
- حاول تقنع العميل بالشراء
- لا تقول "ما فهمت" أبداً
- استخدم أسلوب واثق ومريح

رسالة العميل:
${incomingMsg}
`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    console.log("Claude response:", JSON.stringify(data, null, 2));

    // ✅ تحقق من الأخطاء
    if (!data || data.error) {
      throw new Error("Claude API Error");
    }

    const reply =
      data?.content?.[0]?.text ||
      "حالياً ما قدرت أحدد المنتج المناسب، لكن أقدر أساعدك لو تعطيني تفاصيل أكثر عن بشرتك 👌";

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
        <Message>صار خطأ مؤقت، حاول مرة ثانية بعد شوي 🙏</Message>
      </Response>
    `);
  }
});

app.listen(3000, () => console.log("🚀 Server running"));
