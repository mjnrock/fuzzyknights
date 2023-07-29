import React from "react";

import { main } from "../core/main.js";
import main2 from "../core/main2.js";

import { PixiView } from "../components/PixiView.jsx";

export function Game() {
	const [ pixi, setPixi ] = React.useState(null);

	React.useEffect(() => {
		main().then((app) => {
			setPixi(app);
		});
		// main2().then((app) => {
		// 	setPixi(app);
		// });
	}, []);

	return (
		<>
			{ pixi && <PixiView app={ pixi } /> }
		</>
	);
};

export default Game;