const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));

app.post("/whatsapp", (req, res) => {
  const message = req.body.Body;

  console.log("User:", message);

  const reply = "وصلت رسالتك 👌";

  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Message>${reply}</Message>
    </Response>
  `);
});

app.listen(3000, () => {
  console.log("Server running");
});
