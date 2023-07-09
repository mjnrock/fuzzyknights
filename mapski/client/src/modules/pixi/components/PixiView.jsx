import React, { useEffect, useRef } from "react";

export function PixiView({ app } = {}) {
	const canvasRef = useRef(null);

	useEffect(() => {
		const ref = canvasRef.current;
		ref.appendChild(app.view);

		return () => {
			ref.removeChild(app.view);
		}
	}, []);

	return (
		<div ref={ canvasRef } />
	);
};

export default PixiView;