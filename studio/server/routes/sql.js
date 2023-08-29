import express from "express";
import path from "path";
import SqlExecutor, { localhostConfig } from "../lib/SqlExecutor.js";

export function main(wd) {
	wd = path.join(wd, "sql");

	const sql = new SqlExecutor({
		...localhostConfig,
		server: process.env.MSSQL_SERVER,
		database: process.env.MSSQL_DATABASE,
		user: process.env.MSSQL_USERNAME,
		password: process.env.MSSQL_PASSWORD,
	});

	const routes = [
		{
			methods: [ "POST" ],
			path: "/exec",
			handlers: [
				async (req, res) => {
					try {
						const {
							sproc,
							params = {},
						} = req.body;

						await sql.connect();
						const result = await sql.exec(sproc, params);

						res.json(result);
					} catch(err) {
						res.status(500).json({ error: err.message });
					}
				},
			],
		},
		{
			methods: [ "POST" ],
			path: "/query",
			handlers: [
				async (req, res) => {
					try {
						const {
							query,
							params = [],
						} = req.body;

						await sql.connect();
						const result = await sql.query(query, params);

						res.json(result);
					} catch(err) {
						res.status(500).json({ error: err.message });
					}
				},
			],
		},
		{
			methods: [ "POST" ],
			path: "/tvf",
			handlers: [
				async (req, res) => {
					try {
						const {
							name,
							params = [],
						} = req.body;

						await sql.connect();
						const result = await sql.tvf(name, params);

						console.log(result)

						res.json(result);
					} catch(err) {
						res.status(500).json({ error: err.message });
					}
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