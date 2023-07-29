import React from "react";

import { main } from "../core/main.js";

import { PixiView } from "../components/PixiView.jsx";

export function Game() {
	const [ pixi, setPixi ] = React.useState(null);

	React.useEffect(() => {
		main().then((app) => {
			setPixi(app);
		});
	}, []);

	return (
		<>
			{ pixi && <PixiView app={ pixi } /> }
		</>
	);
};

export default Game;