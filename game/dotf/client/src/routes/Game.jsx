import React from "react";

import Chord from "@lespantsfancy/chord";

import { Nodes, main } from "../core/main.js";

import { PixiView } from "../components/PixiView.jsx";

export function Game() {
	// const { state: pixiData, dispatch: pixiDispatch } = Chord.Node.React.useNode(Nodes.pixi);
	const [ state, setState ] = React.useState();

	React.useEffect(() => {
		main().then((nodes) => {
			//TODO: This is a hack to get the PixiView to render
			setState(nodes.pixi.state.app);
		});
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