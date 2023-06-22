import { useEffect, useRef, useState } from "react";

export const RenderTileMap = {
	0: "#FFF",
	1: "#000",
	2: "#F00",
	3: "#0F0",
	4: "#00F",
}

export function drawTerrain(canvas, data) {
	const ctx = canvas.getContext("2d");

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for(let y = 0; y < data.rows; y++) {
		for(let x = 0; x < data.columns; x++) {
			const tile = data.tiles[ y ][ x ];

			ctx.fillStyle = RenderTileMap[ tile.data ];
			ctx.fillRect(x * data.tw, y * data.th, data.tw, data.th);
		}
	}
};

export function TileMap({ data }) {
	const canvas = useRef(document.createElement("canvas"));
	const [ render, setRender ] = useState(0);
	
	useEffect(() => {
		if(!canvas.current) return;

		canvas.current.width = data.tw * data.columns;
		canvas.current.height = data.th * data.rows;

		drawTerrain(canvas.current, data);

		setRender(render + 1);
	}, [ canvas.current, data ]);

	return (
		<>
			<canvas ref={ canvas } />
		</>
	);
};

export default TileMap;