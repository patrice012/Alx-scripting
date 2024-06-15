const express = require("express");
const app = express();

require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const router = require("./routes");
const {
  scrapingFoundationResources,
  scrapingSpecialisationResources,
  scrapingResources,
  scrapingConcepts,
} = require("./puppeteerCluster/job");

const runTestScript = require("./puppeteerCluster/testJob");

// // cors
// let alloweds = {
//   origin: [process.env.DOMAIN, process.env.PUBLINK, process.env.PUBLINKLIVE],
// };
// app.use(
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
// app.use((req, res, next) => {
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

// cookies
app.use(cookieParser());

// body parsing
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// morgan
app.use(morgan("dev"));

app.use("/api/v1", router);

// default route
app.get("/", (req, res) => {
  res.status(200).send("app up");
});

app.get("/foundation-job", scrapingFoundationResources);

app.get("/specialisation-job", scrapingSpecialisationResources);

app.get("/resources-job", scrapingResources);

app.get("/concepts-job", scrapingConcepts);

app.get("/test-job", runTestScript);



// Export the app app for testing
module.exports = app;

let server;

const startServer = () => {
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

const stopServer = () => {
  if (server) {
    server.close();
  }
};

const connectToDB = () => {
  mongoose.set("strictQuery", false);
  mongoose.connect(process.env.DB_URI, (err) => {
    if (err) {
      console.log(err, "mongoose db connection error");
    } else {
      console.log("connected to db");
    }
  });
};

const disconnectDB = () => {
  mongoose.connection.close();
};

module.exports = { app, startServer, stopServer };

// Start the server only if this file is run directly
if (require.main === module) {
  startServer();
  connectToDB();
}
