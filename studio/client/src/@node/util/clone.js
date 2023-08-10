import { isClassInstance } from "./copy.js";

export function clone(obj) {
	if(obj === null) return null;

	let cloned = Array.isArray(obj) ? [] : {};

	for(let i in obj) {
		if(typeof obj[ i ] === "object" && obj[ i ] !== null) {
			if(obj[ i ] instanceof HTMLCanvasElement) {
				let tempCanvas = document.createElement("canvas");
				tempCanvas.width = obj[ i ].width;
				tempCanvas.height = obj[ i ].height;

				let ctx = tempCanvas.getContext("2d");
				ctx.drawImage(obj[ i ], 0, 0);

				cloned[ i ] = tempCanvas;
			} else if(isClassInstance(obj[ i ])) {
				cloned[ i ] = obj[ i ];
			} else {
				cloned[ i ] = clone(obj[ i ]);
			}
		} else {
			cloned[ i ] = obj[ i ];
		}
	}

	return cloned;
};

export function analyze(obj, registry = {}, seen = new Set()) {
	if(obj === null || typeof obj !== "object" || seen.has(obj)) return registry;

	seen.add(obj);

	// Process array or object
	if(Array.isArray(obj)) {
		for(let i in obj) {
			registry = analyze(obj[ i ], registry, seen);
		}
	} else {
		let uuid = obj.$id || obj.id;
		if(uuid) {
			registry[ uuid ] = obj;
		}

		// Process each property of the object
		for(let i in obj) {
			if(typeof obj[ i ] === "object" && obj[ i ] !== null) {
				// Special case for HTMLCanvasElement
				if(obj[ i ] instanceof HTMLCanvasElement) {
					let tempCanvas = document.createElement("canvas");
					tempCanvas.width = obj[ i ].width;
					tempCanvas.height = obj[ i ].height;

					let ctx = tempCanvas.getContext("2d");
					ctx.drawImage(obj[ i ], 0, 0);

					registry[ obj[ i ].id || obj[ i ].$id ] = tempCanvas;
				} else if(isClassInstance(obj[ i ])) {
					registry = analyze(obj[ i ], registry, seen);
				} else {
					registry = analyze(obj[ i ], registry, seen);
				}

				seen.add(obj[ i ]);
			}
		}
	}

	return registry;
}

export default {
	clone,
	analyze,
};