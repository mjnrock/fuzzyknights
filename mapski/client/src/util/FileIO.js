import { v4 as uuid } from "uuid";

export class FileIO {
	static save(data, name, ext) {
		return new Promise((resolve, reject) => {
			let jsonStr;
			try {
				jsonStr = JSON.stringify(data);
			} catch(err) {
				return reject(`Failed to serialize data: ${ err }`);
			}

			const blob = new Blob([ jsonStr ], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${ name || uuid() }.${ ext || 'json' }`;

			link.click();

			resolve(`Data saved as ${ link.download }`);
		});
	}

	static load() {
		return new Promise((resolve, reject) => {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = "application/json";
			input.onchange = (event) => {
				const file = event.target.files[ 0 ];
				const reader = new FileReader();
				reader.onload = (event) => {
					let data;
					try {
						data = JSON.parse(event.target.result);
					} catch(err) {
						return reject(`Failed to parse file data: ${ err }`);
					}
					resolve(data);
				};
				reader.onerror = (err) => {
					reject(`Failed to read file: ${ err }`);
				};
				reader.readAsText(file);
			};

			input.click();
		});
	}
};

export default FileIO;