// Importing required libraries
import express from "express";
import cors from "cors";
import expressWs from "express-ws";
import path from "path";
import { fileURLToPath } from "url";

import { main as dataRouter } from "./routes/data.js";

// Initial configurations
const app = express();
const ws = expressWs(app);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Enabling CORS
app.use(cors());
// Enabling JSON parsing
app.use(express.json());

// Data Endpoint
app.use("/data", dataRouter(__dirname));

// Starting server
const port = 3100;
app.listen(port, () => {
	console.log(`[${ Date.now() }]: Mapski Server is running on Port: ${ port }`);
});