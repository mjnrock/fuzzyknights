import { useRef } from "react";

import * as PIXI from "pixi.js";
import { PixiView } from "../modules/pixi/components/PixiView";

export function Viewer() {
	const pixi = useRef(new PIXI.Application({
		width: 512,
		height: 512,
		transparent: true,
		antialias: true,
		resolution: window.devicePixelRatio,
	}));

	return (
		<PixiView
			app={ pixi.current }
			className="w-1/2 h-1/2"
		/>
	);
};


export default Viewer;