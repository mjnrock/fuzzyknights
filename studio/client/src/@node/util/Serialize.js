import isBase64 from "is-base64";

export class Serialize {
	static stringify(value) {
		// Edge case checks
		if(typeof value === "function") {
			// Convert function to string and then to base64
			return isBase64.encode(value.toString());
		} else if(value instanceof RegExp) {
			// Convert regex to string
			return value.toString();
		} else if(value === null) {
			return "null";
		} else if(value === undefined) {
			// Skip undefined values
			return;
		}

		// Remove undefined keys
		const replacer = (key, value) => value === undefined ? null : value;

		// Default behavior
		return JSON.stringify(value, replacer);
	}

	static parse(value) {
		// Check if it"s base64
		if(isBase64(value)) {
			// Decode base64 to string
			const decoded = isBase64.decode(value);

			// Check if it"s a function
			if(decoded.startsWith("function")) {
				// If it"s a function, eval it
				// Note: Be careful, eval can be dangerous
				return eval(`(${ decoded })`);
			}
		}

		// Check if it"s a RegExp
		const regexPattern = /^\/(.*)\/([gimsuy]*)$/;
		const match = regexPattern.test(value);
		if(match) {
			return new RegExp(match[ 1 ], match[ 2 ] || "");
		}

		// Check if it"s null
		if(value === "null") {
			return null;
		}

		// Default behavior
		return JSON.parse(value);
	}
};

export default Serialize;