import React from "react";

import Chord from "@lespantsfancy/chord";

import { Nodes, main } from "../core/main.js";

import { PixiView } from "../components/PixiView.jsx";

import * as PIXI from "pixi.js";

//STUB: Get the graphics card info
const renderer = new PIXI.Renderer();
const gl = renderer.gl;

if(gl) {
	const extension = gl.getExtension('WEBGL_debug_renderer_info');
	if(extension) {
		const graphicsCard = gl.getParameter(extension.UNMASKED_RENDERER_WEBGL);
		console.log('Graphics Card:', graphicsCard);
	} else {
		console.log('WEBGL_debug_renderer_info extension not available');
	}
} else {
	console.log('WebGL not supported in this browser');
}
//END STUB


export function Game() {
	// const { state: pixiData, dispatch: pixiDispatch } = Chord.Node.React.useNode(Nodes.renderer);
	const [ state, setState ] = React.useState();

	React.useEffect(() => {
		let fnBlur = null,
			fnFocus = null;

		main().then(({ game, nodes } = {}) => {
			const app = game.renderer.app;

			setState(app);

			const onBlur = (e) => {
				// "Pause" pixi so that it can resume properly upon refocus
				// nodes.renderer.state.app.ticker.stop();
				game.loop.stop();
			};
			const onFocus = (e) => {
				// "Resume" pixi
				// nodes.renderer.state.app.ticker.start();
				game.loop.start();
			};

			window.addEventListener("blur", onBlur);
			window.addEventListener("focus", onFocus);

			fnBlur = onBlur;
			fnFocus = onFocus;
		});

		return () => {
			window.removeEventListener("blur", fnBlur);
			window.removeEventListener("focus", fnFocus);
		}
	}, []);

	if(!state) {
		return null;
	}

	return (
		<>
			<PixiView app={ state } />
		</>
	);
};

export default Game;