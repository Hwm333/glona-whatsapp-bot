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
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        system: `انت موظف مبيعات ذكي لمتجر GLONA للعناية بالبشرة.

قاعدة اللغة: رد بنفس لغة العميل — عربي خليجي او انجليزي.

اسلوبك:
- اعطِ توصية مباشرة من اول رسالة بدون ما تسأل كثير
- استنتج من كلام العميل وقدم له منتج مناسب فوراً
- سؤال واحد فقط اذا كان الكلام غامق جداً — مو اكثر
- ردودك قصيرة ومركزة (3-4 اسطر كحد اقصى)
- لا تعطي قوائم طويلة او خيارات كثيرة
- اسلوب ودود وخفيف

مثال صح:
العميل: "وش افضل منتج للبشرة الدهنية؟"
الرد: "انصحك بغسول GLONA المنظف للبشرة الدهنية — يقلل الدهون ويمنع الحبوب. سعره 85 ريال وعندنا عرض هالاسبوع 😊"

لا تسأل عن نوع البشرة اذا العميل وضح — اعطِه التوصية مباشرة.`,
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
