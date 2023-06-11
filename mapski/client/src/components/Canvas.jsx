import { useEffect, useRef } from "react";

export function Canvas({ source, width, height, ...props }) {
	const canvasRef = useRef(null);

	useEffect(() => {
		if(!source) return;

		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");

		// Set the width and height
		canvas.width = width || source.width;
		canvas.height = height || source.height;

		// Draw the source canvas onto this one
		context.drawImage(source, 0, 0, canvas.width, canvas.height);
	}, [ source, width, height ]);

	return <canvas ref={ canvasRef } width={ width } height={ height } { ...props } />;
};

export default Canvas;