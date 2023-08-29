export const query = async (query, params = []) => {
	try {
		const res = await fetch("https://kiszka.com:3100/sql/query", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				query,
				params,
			}),
		});

		return await res.json();
	} catch(err) {
		return err;
	}
};
export const tvf = async (name, params = []) => {
	try {
		const res = await fetch("https://kiszka.com:3100/sql/tvf", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				name,
				params,
			}),
		});

		return await res.json();
	} catch(err) {
		return err;
	}
};
export const exec = async (sproc, params = {}) => {
	try {
		const res = await fetch("https://kiszka.com:3100/sql/exec", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				sproc,
				params,
			}),
		});

		return await res.json();
	} catch(err) {
		return err;
	}
};

export default {
	exec,
	query,
	tvf,
};


//TEST
// import SqlHelper from "./lib/SqlHelper.js";
// SqlHelper.query(`SELECT GETDATE() AS CurrentDateTime`).then(result => console.log(result));
// SqlHelper.exec(`spTEST`).then(result => console.log(result));