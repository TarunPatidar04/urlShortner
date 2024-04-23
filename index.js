const { connectToMongoDB } = require("./connect");
const express = require("express");
const URL = require("./model/url");

const urlRoute = require("./routes/url");
const app = express();
const PORT = 8001;
app.use(express.json());

connectToMongoDB("mongodb://localhost:27017/short-url")
  .then(() => {
    console.log("mondo db is connected");
  })
  .catch((err) => {
    console.log("mongodb error", err);
  });

app.set("view engine", "ejs");

app.get("/test", async (req, res) => {
  const allUrl = await URL.find({});
  return res.end(`
  <html>
  <head></head>
  <body>
  <col>
  ${allUrl
    .map(
      (url) =>
        `<li>${url.shortId} - ${url.redirectURL} - ${url.visitHistory.length}</li>`
    )
    .join(" ")}
  </col>
  
  </body>
  </html>
  
  `);
});

app.get("/", (req, res) => {
  res.send("This is url sorter");
});

app.use("/url", urlRoute);
app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: { timestamp: Date.now() },
      },
    }
  );
  res.redirect(entry.redirectURL);
});
app.listen(PORT, () => {
  console.log(`Server is Started at PORT ${PORT}`);
});
