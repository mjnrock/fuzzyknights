import express from "express";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * Hard-coding a project ID for now, eventually elevate to a project selection screen
 */
export function main(wd, project = "35fdf625-64bb-40d3-af9e-63b6e40eef99") {
	wd = path.join(wd, "data", project);

	const routes = [
		{
			methods: [ "GET" ],
			path: "/:filepath*",
			handlers: [
				async (req, res) => {
					const filePath = path.join(wd, req.params.filepath, req.params[ 0 ]);
					const fileURL = pathToFileURL(filePath);

					try {
						// Try importing the file as a JS module
						const module = await import(fileURL);

						res.json(module.default);
					} catch(err) {
						if(err.code === "ERR_MODULE_NOT_FOUND") {
							// If that fails, try reading the file as JSON
							fs.readFile(filePath, "utf-8", (err, data) => {
								if(err) {
									res.status(500).json({ error: err.message });
									return;
								}

								try {
									const jsonData = JSON.parse(data);
									res.json(jsonData);
								} catch(err) {
									res.status(500).json({ error: "Error parsing JSON data" });
								}
							});
						} else {
							res.status(500).json({ error: err.message });
						}
					}
				},
			],
		},
		{
			methods: [ "POST" ],
			path: "/:filepath*",
			handlers: [
				async (req, res) => {
					const filePath = path.join(wd, req.params.filepath, req.params[ 0 ]);
					const data = req.body;

					// Ensuring all directories exist
					await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

					// Writing data to file
					fs.promises.writeFile(filePath, JSON.stringify(data, null, 2))
						.then(() => res.json({ message: "Data written successfully" }))
						.catch((err) => res.status(500).json({ error: err.message }));
				},
			],
		},
	];

	const router = express.Router();
	for(const route of routes) {
		for(const method of route.methods) {
			router[ method.toLowerCase() ](route.path, ...route.handlers);
		}
	}

	return router;
};

export default main;