import express from "express";
import fs from "fs";
import path from "path";

export function main(wd) {
	const routes = [
		{
			methods: [ "GET" ],
			path: "/:filename",
			handler: (req, res) => {
				const fileName = req.params.filename;
				const filePath = path.join(wd, "data", fileName);

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
			}
		},
		{
			methods: [ "POST" ],
			path: "/:filepath*",
			handler: async (req, res) => {
				const filePath = path.join(wd, "data", req.params.filepath, req.params[ 0 ]);
				const data = req.body;

				// Ensuring all directories exist
				await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

				// Writing data to file
				fs.promises.writeFile(filePath, JSON.stringify(data, null, 2))
					.then(() => res.json({ message: "Data written successfully" }))
					.catch((err) => res.status(500).json({ error: err.message }));
			}
		},
	];

	const router = express.Router();
	for(const route of routes) {
		for(const method of route.methods) {
			router[ method.toLowerCase() ](route.path, route.handler);
		}
	}

	return router;
};

export default main;