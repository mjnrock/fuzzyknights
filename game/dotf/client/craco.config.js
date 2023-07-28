const path = require("path");

module.exports = {
	webpack: {
		alias: {
			Common: path.resolve(__dirname, "../../../common"),
			Data: path.resolve(__dirname, "../../../common/data"),
		}
	}
};