const express = require("express");
const server = express();

require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");

const router = require("./routes");
const scrapingResources = require("./puppeteerCluster/job");
const morgan = require("morgan");

// // cors
// let alloweds = {
//   origin: [process.env.DOMAIN, process.env.PUBLINK, process.env.PUBLINKLIVE],
// };
// server.use(
//   cors({
//     origin: (origin, callback) => {
//       // Check if the origin is allowed
//       if (alloweds.origin.includes(origin)) {
//         callback(null, true);
//       } else {
//         // callback(new Error("Not allowed by CORS"));
//         callback(null, true);
//       }
//     },
//     credentials: true,
//     optionSuccessStatus: 200,
//   })
// );

// // set headers globally
// server.use((req, res, next) => {
//   // const origin =
//   //   alloweds?.origin?.includes(req.header("origin")?.toLowerCase()) &&
//   //   req.headers.origin;
//   const origin = req.headers.origin;
//   // console.log(origin);
//   res.header("Access-Control-Allow-Origin", origin);
//   res.set({
//     "Access-Control-Allow-Credentials": true,
//     "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//     "Access-Control-Allow-Headers": "Origin, Content-Type, Accept",
//   });
//   next();
// });

// // body parsing
// server.use(express.json({ limit: "100mb" }));
// // parse requests of content-type - application/x-www-form-urlencoded
// server.use(express.urlencoded({ extended: false }));

// cookies
server.use(cookieParser());

// parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
server.use(bodyParser.json());

// morgan
server.use(morgan("dev"));

// connect mongoose
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_URI, (err) => {
  if (err) {
    console.log(err, "mongoose db connection error");
  } else {
    console.log("connected to db");
  }
});

server.get("/", (req, res) => {
  res.status(200).send("Server up");
});

server.post("/scraping", scrapingResources);

server.use("/api/v1", router);

server.listen(process.env.PORT, () =>
  console.log(`app listen on port ${process.env.PORT}`)
);
