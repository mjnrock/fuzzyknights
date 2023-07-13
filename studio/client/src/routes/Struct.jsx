import { useEffect } from "react";
import { useNode } from "../lib/react/useNode";
import { PixiView } from "../apps/mapski/viewer/modules/pixi/components/PixiView";

import { Reducers, State, flattenGroup } from "../apps/structski/main";

export function Struct() {
	const { state: pixiData, dispatch: pixiDispatch } = useNode(State.pixi, Reducers.pixi);
	const { state: contextData, dispatch: contextDispatch } = useNode(State.context, Reducers.context);

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

		for(const [ keyPath, node ] of nodes) {
			const lastKey = keyPath.split(".").pop();
			const { x, y, r } = render[ lastKey ];
			const dx = x - transformedOffsetX;
			const dy = y - transformedOffsetY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if(distance < r) {
				if(e.buttons === 1) {
					contextDispatch({
						type: "move",
						data: {
							key: lastKey,
							x: transformedOffsetX,
							y: transformedOffsetY,
						},
					});

					return;
				}

			}
		}
	};

	const handleDoubleClick = (e) => {
		const { offsetX, offsetY } = e.nativeEvent;
		const { data, render } = contextData;
		const { x: scaleX, y: scaleY } = pixiData.app.stage.scale;

		const transformedOffsetX = offsetX / scaleX;
		const transformedOffsetY = offsetY / scaleY;

		const nodes = [];
		for(let key in data) {
			const newNodes = flattenGroup(data[ key ], key);

			nodes.push(...newNodes);
		}

		for(const [ keyPath, node ] of nodes) {
			const lastKey = keyPath.split(".").pop();
			const { x, y, r } = contextData.render[ lastKey ];
			const dx = x - transformedOffsetX;
			const dy = y - transformedOffsetY;
			const distance = Math.sqrt(dx * dx + dy * dy);
			if(distance < r) {
				console.log(node);

				return;
			}
		}
	};

	return (
		<div className="w-full h-full">
			<PixiView
				className="absolute top-0 left-0 z-0 w-full h-full"
				app={ pixiData.app }
				resizer={ true }
			/>
			<div
				className="absolute top-0 left-0 z-10 flex flex-col items-center justify-center w-full h-full select-none"
				onMouseMove={ handleMouseMove }
				onDoubleClick={ handleDoubleClick }
			>
				{/* This is the UI layer -- it is middle-center, full screen */ }
			</div>
		</div>
	);
};

export default Struct;