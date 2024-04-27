const { connectToMongoDB } = require("./connect");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const URL = require("./model/url");
const staticRouter = require("./routes/staticRouter");
const userRoute = require("./routes/user");
const urlRoute = require("./routes/url");
const { restrictToLoggedinUserOnly, checkAuth } = require("./middleware/auth");
const app = express();
const PORT = 8001;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

connectToMongoDB("mongodb://localhost:27017/short-url")
  .then(() => {
    console.log("mondo db is connected");
  })
  .catch((err) => {
    console.log("mongodb error", err);
  });

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// app.get("/test", async (req, res) => {
//   const allUrl = await URL.find({});
//   return res.end(`
//   <html>
//   <head></head>
//   <body>
//   <col>
//   ${allUrl
//     .map(
//       (url) =>
//         `<li>${url.shortId} - ${url.redirectURL} - ${url.visitHistory.length}</li>`
//     )
//     .join(" ")}
//   </col>

//   </body>
//   </html>

//   `);
// });

// app.get("/test", async (req, res) => {
//   const allUrl = await URL.find({});
//   return res.render("home", {
//     urls: allUrl,
//   });
// });

// app.get("/", (req, res) => {
//   res.send("This is url sorter");
// });

app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use("/", checkAuth, staticRouter);
app.use("/user", userRoute);

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
