import "./dotenv.js";
import express from "express";
import cors from "cors";
import expressWs from "express-ws";
import path from "path";
import fs from "fs";
import https from "https";
import { fileURLToPath } from "url";

import { main as fsRouter } from "./routes/data.js";
import { main as sqlRouter } from "./routes/sql.js";

// Read the certificate files
const privateKey = fs.readFileSync("./certs/kiszka.key", "utf8");
const certificate = fs.readFileSync("./certs/kiszka.crt", "utf8");

// Create a credentials object using the private key and certificate
const credentials = { key: privateKey, cert: certificate };

// Initial configurations
const app = express();
const ws = expressWs(app);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Enabling CORS
app.use(cors());
// Enabling JSON parsing
app.use(express.json());

app.use("/sql", sqlRouter(__dirname));
app.use("/fs", fsRouter(__dirname));

// Starting HTTPS server
const port = 3100;
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
	console.log(`[${ Date.now() }]: FuzzyKnights Server is running on Port: ${ port }`);
});