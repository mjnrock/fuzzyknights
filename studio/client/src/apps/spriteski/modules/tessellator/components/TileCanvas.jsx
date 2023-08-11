import { useEffect, useRef } from "react";

export const TileCanvas = ({ tile, width, height, ...props }) => {
	const canvasRef = useRef(null);

	useEffect(() => {
		const ctx = canvasRef.current.getContext("2d");

		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(tile.data, 0, 0, tile.width, tile.height, 0, 0, width, height);
	}, [ tile ]);

	return (
		<canvas
			ref={ canvasRef }
			width={ width }
			height={ height }

			data-id={ tile.$id }
			data-width={ tile.width }
			data-height={ tile.height }

			{ ...props }
		/>
	);
};

export default TileCanvas;