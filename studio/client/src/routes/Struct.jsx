import Chord from "@lespantsfancy/chord";
import { useEffect } from "react";
import { PixiView } from "../apps/mapski/viewer/modules/pixi/components/PixiView";

import { Reducers, Nodes, flattenGroup, findBall, flattenNodes } from "../apps/structski/main";

export function Struct() {
	const { state: pixiData, dispatch: pixiDispatch } = Chord.Node.React.useNode(Nodes.pixi, Reducers.pixi);
	const { state: contextData, dispatch: contextDispatch } = Chord.Node.React.useNode(Nodes.context, Reducers.context);

	useEffect(() => {
		const handler = (e) => {
			let data;
			if(e.deltaY < 0) {
				data = 1;
			} else {
				data = -1;
			}

			pixiDispatch({
				type: "zoom",
				data,
			});
		};

		window.addEventListener("wheel", handler);

		return () => window.removeEventListener("wheel", handler);
	}, []);

	const handleMouseMove = (e) => {
		const { offsetX, offsetY } = e.nativeEvent;
		const { render, data } = contextData;
		const { x: scaleX, y: scaleY } = pixiData.app.stage.scale;

		const transformedOffsetX = offsetX / scaleX;
		const transformedOffsetY = offsetY / scaleY;

		const nodes = [];
		for(let key in data) {
			const newNodes = flattenGroup(data[ key ], key);

			nodes.push(...newNodes);
		}

		for(const [ keyPath, node ] of nodes.reverse()) {	// pull the "highest" node first
			const lastKey = keyPath.split(".").pop();
			const { x, y, r } = render[ lastKey ];
			const dx = x - transformedOffsetX;
			const dy = y - transformedOffsetY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if(distance < r) {
				if(e.buttons === 1) {
					if(contextData.selectedBall !== null) {
						// If there is a ball currently selected, move it.
						contextDispatch({
							type: "move",
							data: {
								key: contextData.selectedBall,
								x: transformedOffsetX,
								y: transformedOffsetY,
							},
						});
					} else {
						contextDispatch({
							type: "pick",
							data: {
								x: transformedOffsetX,
								y: transformedOffsetY,
							}
						});
					}

					return;
				}
			}
		}
	};

	const handleDoubleClick = (e) => {
		const { offsetX, offsetY } = e.nativeEvent;
		const { x: scaleX, y: scaleY } = pixiData.app.stage.scale;

		const transformedOffsetX = offsetX / scaleX;
		const transformedOffsetY = offsetY / scaleY;

		const ballLabel = findBall(transformedOffsetX, transformedOffsetY, contextData);
		const balls = flattenNodes(contextData.data);
		const ball = balls.find(([ key, value, type, parent, node ]) => key === ballLabel)[ 4 ];

		console.log(ball);

		// Do something with the ball.
	};

	return (
		<div className="w-full h-full">
			<PixiView className="absolute top-0 left-0 z-0 w-full h-full" app={ pixiData.app } resizer={ true } />
			<div
				className="absolute top-0 left-0 z-10 flex flex-col items-center justify-center w-full h-full select-none"
				onMouseMove={ handleMouseMove }
				onDoubleClick={ handleDoubleClick }
				onMouseUp={ () => contextDispatch({ type: "deselect" }) }
			>
				{/* This is the UI layer -- it is middle-center, full screen */ }
			</div>
		</div>
	);
}

export default Struct;