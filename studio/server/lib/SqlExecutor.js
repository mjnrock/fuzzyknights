import mssql from "mssql";
import moment from "moment";
import fs from "fs/promises";

export const localhostConfig = {
	server: "localhost",               // use "localhost" to connect to your local instance
	database: "your_database_name",    // replace with your database name
	user: "your_username",             // replace with your SQL Server username
	password: "your_password",         // replace with your SQL Server password
	requestTimeout: 300000,            // request timeout
	options: {
		encrypt: true,                 // for AzureDB users, this should be set to true
		trustServerCertificate: true   // use this when connecting to a local instance, for production you'd want proper certificates
	},
	pool: {
		max: 10,                       // max number of connections in the pool
		min: 0,
		idleTimeoutMillis: 30000       // how long a connection should be idle before being released
	},
};

export class SqlExecutor {
	constructor (config) {
		this.pool = new mssql.ConnectionPool(config);
		this.pool.on("error", err => {
			console.error("SQL Database Connection Error:", err);
		});
	}

	get mssql() {
		return mssql;
	}

	async connect() {
		if(this.pool.connected || this.pool.connecting) {
			return;
		}

		return this.pool.connect();
	}
	async disconnect() {
		if(this.pool.connected || this.pool.connecting) {
			return this.pool.close();
		}

		return;
	}

	sanitizeValue(value, useExplicitTyping = false) {
		let result;

		if(value === "NULL" || value === null) {
			result = [ null, null ];
		} else if(value === "DEFAULT") {
			return [ mssql.Default, mssql.Default ]
		} else if(typeof value === "object") {
			result = [ mssql.NVarChar, JSON.stringify(value) ];
		} else if(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}Z)?$/.test(value)) {
			result = [ mssql.DateTime2, moment(value, moment.ISO_8601, true).toDate() ];
		} else if(typeof +value === "number" && !isNaN(+value)) {
			if(value % 1 === 0) {
				result = [ mssql.Int, +value ];
			} else {
				result = [ mssql.Real, +value ];
			}
		} else if(value.substring(0, 2) === "N'") {
			result = [ mssql.NVarChar, value ];
		} else {
			result = [ mssql.VarChar, value ];
		}

		if(useExplicitTyping) {
			return result;
		} else {
			return result[ 1 ];
		}
	}
	sanitizeParams(params, useExplicitTyping = false) {
		if(Array.isArray(params)) {
			return params.map(param => this.sanitizeValue(param, useExplicitTyping));
		} else if(typeof params === "object") {
			const sanitized = {};
			for(let [ key, value ] of Object.entries(params)) {
				sanitized[ key ] = this.sanitizeValue(value, useExplicitTyping);
			}

			return sanitized;
		} else {
			return params;
		}
	}

	async tvf(name, params = [], recordsetOnly = true) {
		await this.connect();
		const request = this.pool.request();

		this.sanitizeParams(params).forEach((param, index) => {
			request.input(`param${ index + 1 }`, param);
		});

		try {
			const result = await request.query(`SELECT * FROM ${ name }(${ params.map((_, index) => `@param${ index + 1 }`).join(", ")
				})`);

			if(recordsetOnly) {
				return result.recordset;
			}

			return result;
		} catch(err) {
			console.error("Error executing the table-valued function:", err);
			throw err;  // or handle the error in another way, if preferred
		}
	}

	async exec(name, params = {}, recordsetOnly = true) {
		await this.connect();
		const request = this.pool.request();
		const sanitizedParams = this.sanitizeParams(params);

		for(let [ key, value ] of Object.entries(sanitizedParams)) {
			request.input(key, value);
		}

		try {
			const result = await request.execute(name);

			if(recordsetOnly) {
				return result.recordset;
			}

			return result;
		} catch(err) {
			console.error("Error executing the stored procedure:", err);
			throw err;  // or handle the error in another way, if preferred
		}
	}

	async query(query, params = [], recordsetOnly = true) {
		await this.connect();
		const preparedStatement = new mssql.PreparedStatement(this.pool);

		const sanitizedParams = this.sanitizeParams(params, true);
		const values = {};

		sanitizedParams.forEach((param, index) => {
			const [ type, value ] = param;
			const paramName = `param${ index + 1 }`;

			preparedStatement.input(paramName, type ?? sql.VarChar, value);
			values[ paramName ] = value;
		});

		try {
			await preparedStatement.prepare(query);
			const result = await preparedStatement.execute(values);  // Bind the *actual* values to the prepared statement.
			await preparedStatement.unprepare();

			if(recordsetOnly) {
				return result.recordset;
			}

			return result;
		} catch(err) {
			console.error("Error executing the prepared statement:", err);
			throw err;  // or handle the error in another way, if preferred
		}
	}
	async queryFromFile(path, params = [], recordsetOnly = true) {
		try {
			const query = await fs.readFile(path, "utf8");

			return this.query(query, params, recordsetOnly);
		} catch(err) {
			console.error("Error reading or executing the SQL file:", err);
			throw err;
		}
	}
};

export default SqlExecutor;