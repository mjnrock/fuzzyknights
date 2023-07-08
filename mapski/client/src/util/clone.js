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
			} else {
				cloned[ i ] = clone(obj[ i ]);
			}
		} else {
			cloned[ i ] = obj[ i ];
		}
	}

	return cloned;
};

export default clone;