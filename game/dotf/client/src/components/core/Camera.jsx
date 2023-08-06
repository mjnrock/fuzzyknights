import { PixiView } from "../PixiView.jsx";

export function Camera({ game, observer }) {
	const app = game?.renderer?.app;

	if(!app) return null;

	return (
		<PixiView
			app={ app }
			observer={ observer }
		/>
	);
};

export default Camera;