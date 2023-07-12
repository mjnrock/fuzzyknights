import { useEffect } from "react";
import { useNode } from "../lib/react/useNode";
import { PixiView } from "../apps/mapski/viewer/modules/pixi/components/PixiView";

import { Reducers, State } from "../apps/structski/main";

export function Struct() {
	const { state: pixiData, dispatch: pixiDispatch } = useNode(State.pixi, Reducers.pixi);
	const { state: contextData, dispatch: contextDispatch } = useNode(State.context, Reducers.context);

	useEffect(() => {
		// if a wheel event happens on the pixi canvas, prevent the default behavior and dispatch the event
		const handler = (e) => {
			e.preventDefault();

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
		pixiData.app.view.addEventListener("wheel", handler);
		return () => pixiData.app.view.removeEventListener("wheel", handler);
	}, [ pixiData.app.view ]);

	const handleMouseMove = (e) => {
		const { offsetX, offsetY } = e.nativeEvent;
		const { render } = contextData;

		for(const key in render) {
			const node = render[ key ];
			const { x, y, r } = node;
			const dx = x - offsetX;
			const dy = y - offsetY;
			const distance = Math.sqrt(dx * dx + dy * dy);
			if(distance < r) {
				if(e.buttons === 1) {
					// dispatch a "move" event to the context dispatcher
					contextDispatch({
						type: "move",
						data: {
							key,
							x: offsetX,
							y: offsetY,
						},
					});
				}

				return;
			}
		}
	};

	const handleDoubleClick = (e) => {
		const { offsetX, offsetY } = e.nativeEvent;
		const { render } = contextData;

		for(const key in render) {
			const node = render[ key ];
			const { x, y, r } = node;
			const dx = x - offsetX;
			const dy = y - offsetY;
			const distance = Math.sqrt(dx * dx + dy * dy);
			if(distance < r) {
				console.log(contextData.data[ key ]);

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
				className="absolute top-0 left-0 z-10 w-full h-full select-none"
				onMouseMove={ handleMouseMove }
				onDoubleClick={ handleDoubleClick }
			>
				This is the UI layer
			</div>
		</div>
	);
}