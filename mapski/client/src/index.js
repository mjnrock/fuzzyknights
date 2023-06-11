import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./assets/css/index.css";

// fetch("http://localhost:3100/data/test.json").then(res => res.json()).then(console.log);
fetch("http://localhost:3100/data/terrain/Terrain.js").then(res => res.json()).then(console.log);


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	// <React.StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	// </React.StrictMode>
);