import { useEffect } from "react";
import { useNode } from "../lib/react/useNode";
import { Reducers, State } from "../apps/viewer/main";

import { PixiView } from "../modules/pixi/components/PixiView";

export function Viewer() {
	const { state: mapData, dispatch: mapDispatch } = useNode(State.map, Reducers.map);
	const { state: terrainData, dispatch: terrainDispatch } = useNode(State.terrain, Reducers.terrain);
	const { state: viewportData, dispatch: viewportDispatch } = useNode(State.viewport, Reducers.viewport);
	const { state: pixiData, dispatch: pixiDispatch } = useNode(State.pixi, Reducers.pixi);

	useEffect(() => {
		pixiData.app.start();

		return () => {
			pixiData.app.stop();
		}
	}, []);

	return (
		<PixiView
			app={ pixiData.app }
			className="w-1/2 h-1/2"
		/>
	);
};


export default Viewer;