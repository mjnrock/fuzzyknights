import React, { useEffect, useRef } from "react";

export function PixiView({ app, resizer = false, ...props }) {
	const canvasRef = useRef(null);

	useEffect(() => {
		const ref = canvasRef.current;
		ref.appendChild(app.view);

		return () => {
			ref.removeChild(app.view);
		}
	}, []);

	useEffect(() => {
		const ref = canvasRef.current;
		const resize = () => {
			app.renderer.resize(ref.clientWidth, ref.clientHeight);
		};

		if(resizer) {
			resize();
			window.addEventListener("resize", resize);
		} else {
			window.removeEventListener("resize", resize);
		}

		return () => {
			window.removeEventListener("resize", resize);
		}
	}, [ resizer ]);

	return (
		<div ref={ canvasRef } {...props} />
	);
};

export default PixiView;