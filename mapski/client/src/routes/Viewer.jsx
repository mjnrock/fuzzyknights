import { useEffect } from "react";
import { useNode } from "../lib/react/useNode";
import { Reducers, State } from "../apps/viewer/main";

import { PixiView } from "../modules/pixi/components/PixiView";

import FileMenu from "../modules/menubar/components/FileMenu";
import { FileIO } from "../util/FileIO";
import Base64 from "../util/Base64";

export function Viewer() {
	const { state: menubarData, dispatch: menubarDispatch } = useNode(State.menubar, Reducers.menubar);
	const { state: mapData, dispatch: mapDispatch } = useNode(State.map, Reducers.map);
	const { state: terrainData, dispatch: terrainDispatch } = useNode(State.terrain, Reducers.terrain);
	const { state: viewportData, dispatch: viewportDispatch } = useNode(State.viewport, Reducers.viewport);
	const { state: pixiData, dispatch: pixiDispatch } = useNode(State.pixi, Reducers.pixi);

	const loadMap = async () => {
		console.log("Loading map...");

		FileIO.load()
			.then(async (data) => {
				for(const [ key, obj ] of Object.entries(data.terrain.terrains)) {
					if(Base64.test(obj.texture)) {
						data.terrain.terrains[ key ].texture = await Base64.Decode(obj.texture);
					}
				};

				return data;
			})
			.then((data) => {
				const { rows, columns: cols, tw, th, tiles } = data.map;
				terrainDispatch({ type: "set", data: data.terrain.terrains });
				mapDispatch({
					type: "set",
					data: {
						rows,
						cols,
						tw,
						th,
						tiles,
					},
				});
			})
			.catch((error) => console.error(error));
	};

	const exec = (command) => {
		if(command.type === "file/load") {
			loadMap();
		}
	};

	useEffect(() => {

		// bind the viewport's .tick method to the pixi app's ticker
		const tick = delta => {
			State.viewport.dispatch("tick", { dt: delta });
		};
		pixiData.app.ticker.add(tick);
		pixiData.app.start();

		return () => {
			pixiData.app.stop();
			pixiData.app.ticker.remove(tick);
		}
	}, []);

	// bind key events to the canvas
	useEffect(() => {
		const onKeyDown = (e) => {
			if(e.code === "KeyW" || e.code === "ArrowUp") {
				State.viewport.dispatch("move", { x: 0, y: -1 });
			} else if(e.code === "KeyS" || e.code === "ArrowDown") {
				State.viewport.dispatch("move", { x: 0, y: 1 });
			} else if(e.code === "KeyA" || e.code === "ArrowLeft") {
				State.viewport.dispatch("move", { x: -1, y: 0 });
			} else if(e.code === "KeyD" || e.code === "ArrowRight") {
				State.viewport.dispatch("move", { x: 1, y: 0 });
			} else if(e.code === "Space" && e.ctrlKey) {
				State.viewport.dispatch("center");
			}
		};

		const onWheel = (e) => {
			if(e.deltaY > 0) {
				State.viewport.dispatch("zoom", { zoom: -0.01 });
			} else if(e.deltaY < 0) {
				State.viewport.dispatch("zoom", { zoom: 0.01 });
			}
		};

		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("wheel", onWheel);

		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("wheel", onWheel);
		}
	}, [ viewportDispatch ]);

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="flex flex-row items-center justify-center w-full gap-2">
				<FileMenu
					data={ menubarData.menu }
					onSelect={ (command) => exec({ type: command }) }
				/>
			</div>

			<PixiView
				app={ pixiData.app }
			/>

			<div className="flex flex-row items-center justify-center">
				<p className="text-sm text-neutral-500">Use the arrow keys or WASD to move, and scroll to zoom.</p>
			</div>

			<ViewportConfig
				data={ { viewportData } }
				update={ { viewportDispatch } }
			/>
		</div>
	);
};

export function ViewportConfig({ data, update }) {
	const { viewportData } = data;
	const { viewportDispatch } = update;

	const onChange = (e) => {
		viewportDispatch({
			type: "merge",
			data: {
				[ e.target.name ]: +e.target.value,
			},
		});
	};

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="flex flex-row items-center justify-center">
				<label className="text-sm text-neutral-500">Width</label>
				<input
					className="w-24 ml-2 border border-solid rounded shadow border-neutral-200"
					type="number"
					name="w"
					value={ viewportData.w }
					onChange={ onChange }
				/>
			</div>

			<div className="flex flex-row items-center justify-center">
				<label className="text-sm text-neutral-500">Height</label>
				<input
					className="w-24 ml-2 border border-solid rounded shadow border-neutral-200"
					type="number"
					name="h"
					value={ viewportData.h }
					onChange={ onChange }
				/>
			</div>

			<div className="flex flex-row items-center justify-center">
				<label className="text-sm text-neutral-500">Zoom</label>
				<input
					className="w-24 ml-2 border border-solid rounded shadow border-neutral-200"
					type="number"
					name="zoom"
					min={ 0 }
					max={ 5 }
					value={ viewportData.zoom }
					onChange={ onChange }
				/>
			</div>

			<div className="flex flex-row items-center justify-center">
				<label className="text-sm text-neutral-500">X</label>
				<input
					className="w-24 ml-2 border border-solid rounded shadow border-neutral-200"
					type="number"
					name="x"
					value={ viewportData.x }
					onChange={ onChange }
				/>
			</div>

			<div className="flex flex-row items-center justify-center">
				<label className="text-sm text-neutral-500">Y</label>
				<input
					className="w-24 ml-2 border border-solid rounded shadow border-neutral-200"
					type="number"
					name="y"
					value={ viewportData.y }
					onChange={ onChange }
				/>
			</div>
		</div>
	);
}


export default Viewer;