import { readFile } from "fs/promises";
import http from "http";
import https from "https";

import cors from "cors";
import express from "express";

import { AggregateData } from "./interfaces/AggregateData";
import { getGithubData } from "./modules/getGithubData";
import { logHandler } from "./utils/logHandler";

(async () => {
  const cache: AggregateData = {
    "naomi-lgbt": [],
    nhcarrigan: [],
    beccalyria: [],
    rosalianightsong: [],
    beccalia: [],
    nhcommunity: [],
  };
  await getGithubData(cache);
  setInterval(async () => await getGithubData(cache), 1800000);
  const app = express();

  const allowedOrigins = [
    "https://contribute.naomi.lgbt",
    "http://localhost:4200",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
    })
  );

  app.get("/data", (_, res) => res.json(cache));

  app.use("/", (req, res) => {
    res.send("Online!");
  });

  const httpServer = http.createServer(app);

  httpServer.listen(7080, () => {
    logHandler.log("http", "http server listening on port 7080");
  });

  if (process.env.NODE_ENV === "production") {
    const privateKey = await readFile(
      "/etc/letsencrypt/live/contribute-api.naomi.lgbt/privkey.pem",
      "utf8"
    );
    const certificate = await readFile(
      "/etc/letsencrypt/live/contribute-api.naomi.lgbt/cert.pem",
      "utf8"
    );
    const ca = await readFile(
      "/etc/letsencrypt/live/contribute-api.naomi.lgbt/chain.pem",
      "utf8"
    );

    const credentials = {
      key: privateKey,
      cert: certificate,
      ca: ca,
    };

    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(7443, () => {
      logHandler.log("http", "https server listening on port 7443");
    });
  }
})();
