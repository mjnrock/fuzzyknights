import Chord from "@lespantsfancy/chord";
import { useEffect } from "react";
import { Reducers, Nodes } from "../apps/mapski/viewer/main";

import { PixiView } from "../apps/mapski/viewer/modules/pixi/components/PixiView";

import FileMenu from "../apps/mapski/viewer/modules/menubar/components/FileMenu";
import { FileIO } from "../util/FileIO";
import Base64 from "../util/Base64";

export function Viewer() {
	const { state: menubarData, dispatch: menubarDispatch } = Chord.Node.React.useNode(Nodes.menubar, Reducers.menubar);
	const { state: mapData, dispatch: mapDispatch } = Chord.Node.React.useNode(Nodes.map, Reducers.map);
	const { state: terrainData, dispatch: terrainDispatch } = Chord.Node.React.useNode(Nodes.terrain, Reducers.terrain);
	const { state: viewportData, dispatch: viewportDispatch } = Chord.Node.React.useNode(Nodes.viewport, Reducers.viewport);
	const { state: pixiData, dispatch: pixiDispatch } = Chord.Node.React.useNode(Nodes.pixi, Reducers.pixi);

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
			viewportDispatch({ type: "tick", data: { dt: delta } });
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
				viewportDispatch({ type: "move", data: { x: 0, y: -1 } });
			} else if(e.code === "KeyS" || e.code === "ArrowDown") {
				viewportDispatch({ type: "move", data: { x: 0, y: 1 } });
			} else if(e.code === "KeyA" || e.code === "ArrowLeft") {
				viewportDispatch({ type: "move", data: { x: -1, y: 0 } });
			} else if(e.code === "KeyD" || e.code === "ArrowRight") {
				viewportDispatch({ type: "move", data: { x: 1, y: 0 } });
			} else if(e.code === "Space" && e.ctrlKey) {
				viewportDispatch({ type: "center" });
			}
		};

		const onWheel = (e) => {
			if(e.deltaY > 0) {
				e.preventDefault();
				viewportDispatch({ type: "zoom", data: { zoom: -1 } });
			} else if(e.deltaY < 0) {
				e.preventDefault();
				viewportDispatch({ type: "zoom", data: { zoom: 1 } });
			}
		};

		window.addEventListener("keydown", onKeyDown);
		Nodes.pixi.state.app.view.addEventListener("wheel", onWheel);

		return () => {
			window.removeEventListener("keydown", onKeyDown);
			Nodes.pixi.state.app.view.removeEventListener("wheel", onWheel);
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

			<div className="flex flex-col items-center justify-center w-1/2 p-2 mb-2 border border-solid rounded border-neutral-200 bg-neutral-50">
				<p className="flex text-sm text-neutral-500">Use the arrow keys or <kbd className="px-1 mx-1 border border-solid rounded border-neutral-200">WASD</kbd> to move, scroll to zoom, and <kbd className="px-1 mx-1 border border-solid rounded border-neutral-200">Ctrl+Space</kbd> to center.</p>
				<p className="flex text-sm text-neutral-500">Sight, X, and Y are in tiles.</p>
			</div>


			<ViewportConfig
				data={ { viewportData, mapData } }
				update={ { viewportDispatch } }
			/>
		</div>
	);
};

export function ViewportConfig({ data, update }) {
	const { viewportData, mapData } = data;
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
		<div className="grid w-1/2 grid-cols-2 gap-4 mb-2">
			<div className="grid grid-rows-5 gap-2">
				<div className="flex items-center">
					<label className="w-1/5 text-sm text-center text-neutral-500">Sight X</label>
					<input
						className="w-4/5 h-8 px-2 ml-2 border border-solid rounded shadow border-neutral-200"
						type="number"
						name="w"
						step={ 2 }
						value={ viewportData.w }
						onChange={ onChange }
					/>
				</div>

				<div className="flex items-center">
					<label className="w-1/5 text-sm text-center text-neutral-500">Sight Y</label>
					<input
						className="w-4/5 h-8 px-2 ml-2 border border-solid rounded shadow border-neutral-200"
						type="number"
						name="h"
						step={ 2 }
						value={ viewportData.h }
						onChange={ onChange }
					/>
				</div>

				<div className="flex items-center">
					<label className="w-1/5 text-sm text-center text-neutral-500">Zoom</label>
					<input
						className="w-4/5 h-8 px-2 ml-2 border border-solid rounded shadow border-neutral-200"
						type="number"
						name="zoom"
						min={ 0.01 }
						max={ 5 }
						value={ viewportData.zoom }
						onChange={ onChange }
					/>
				</div>

				<div className="flex items-center">
					<label className="w-1/5 text-sm text-center text-neutral-500">X</label>
					<input
						className="w-4/5 h-8 px-2 ml-2 border border-solid rounded shadow border-neutral-200"
						type="number"
						name="x"
						value={ viewportData.x }
						onChange={ onChange }
					/>
				</div>

				<div className="flex items-center">
					<label className="w-1/5 text-sm text-center text-neutral-500">Y</label>
					<input
						className="w-4/5 h-8 px-2 ml-2 border border-solid rounded shadow border-neutral-200"
						type="number"
						name="y"
						value={ viewportData.y }
						onChange={ onChange }
					/>
				</div>
			</div>

			<div className="grid grid-rows-5 gap-2">
				<div className="flex gap-1">
					<button
						className="w-1/3 border border-solid rounded shadow border-neutral-200 bg-neutral-50 hover:bg-neutral-200 active:bg-neutral-300"
						onClick={ () => viewportDispatch({
							type: "merge",
							data: {
								w: ~~(mapData.cols / 4),
								x: ~~((mapData.cols / 4) / 2),
							}
						}) }
					>
						25%
					</button>
					<button
						className="w-1/3 border border-solid rounded shadow border-neutral-200 bg-neutral-50 hover:bg-neutral-200 active:bg-neutral-300"
						onClick={ () => viewportDispatch({
							type: "merge",
							data: {
								w: ~~(mapData.cols / 2),
								x: ~~((mapData.cols / 2) / 2),
							}
						}) }
					>
						50%
					</button>
					<button
						className="w-1/3 border border-solid rounded shadow border-neutral-200 bg-neutral-50 hover:bg-neutral-200 active:bg-neutral-300"
						onClick={ () => viewportDispatch({
							type: "merge",
							data: {
								w: mapData.cols,
								x: ~~(mapData.cols / 2),
							}
						}) }
					>
						100%
					</button>
				</div>
				<div className="flex gap-1">
					<button
						className="w-1/3 border border-solid rounded shadow border-neutral-200 bg-neutral-50 hover:bg-neutral-200 active:bg-neutral-300"
						onClick={ () => viewportDispatch({
							type: "merge",
							data: {
								h: ~~(mapData.rows / 4),
								y: ~~((mapData.rows / 4) / 2),
							}
						}) }
					>
						25%
					</button>
					<button
						className="w-1/3 border border-solid rounded shadow border-neutral-200 bg-neutral-50 hover:bg-neutral-200 active:bg-neutral-300"
						onClick={ () => viewportDispatch({
							type: "merge",
							data: {
								h: ~~(mapData.rows / 2),
								y: ~~((mapData.rows / 2) / 2),
							}
						}) }
					>
						50%
					</button>
					<button
						className="w-1/3 border border-solid rounded shadow border-neutral-200 bg-neutral-50 hover:bg-neutral-200 active:bg-neutral-300"
						onClick={ () => viewportDispatch({
							type: "merge",
							data: {
								h: mapData.rows,
								y: ~~(mapData.rows / 2),
							}
						}) }
					>
						100%
					</button>
				</div>

				<div className="flex items-center gap-1">
					<label className="w-1/5 text-sm text-center text-neutral-500">+/-</label>
					<input
						className="w-3/5 h-8 px-2 ml-2 border border-solid rounded shadow border-neutral-200"
						type="number"
						name="zoomStep"
						min={ 0.01 }
						max={ 1 }
						step={ 0.01 }
						value={ viewportData.zoomStep }
						onChange={ onChange }
					/>
					<button
						className="w-1/5 border border-solid rounded shadow border-neutral-200 bg-neutral-50 hover:bg-neutral-200 active:bg-neutral-300"
						onClick={ () => viewportDispatch({
							type: "merge",
							data: {
								zoom: 1,
								zoomStep: 0.03,
							}
						}) }
					>
						Reset
					</button>
				</div>

				<div className="flex items-center gap-1">
					<label className="w-1/5 text-sm text-center text-neutral-500">+/-</label>
					<input
						className="w-3/5 h-8 px-2 ml-2 border border-solid rounded shadow border-neutral-200"
						type="number"
						name="xStep"
						min={ 1 }
						max={ 10 }
						step={ 1 }
						value={ viewportData.xStep }
						onChange={ onChange }
					/>
					<button
						className="w-1/5 border border-solid rounded shadow border-neutral-200 bg-neutral-50 hover:bg-neutral-200 active:bg-neutral-300"
						onClick={ () => viewportDispatch({
							type: "merge",
							data: {
								xStep: 1,
							}
						}) }
					>
						Reset
					</button>
				</div>

				<div className="flex items-center gap-1">
					<label className="w-1/5 text-sm text-center text-neutral-500">+/-</label>
					<input
						className="w-3/5 h-8 px-2 ml-2 border border-solid rounded shadow border-neutral-200"
						type="number"
						name="yStep"
						min={ 1 }
						max={ 10 }
						step={ 1 }
						value={ viewportData.yStep }
						onChange={ onChange }
					/>
					<button
						className="w-1/5 border border-solid rounded shadow border-neutral-200 bg-neutral-50 hover:bg-neutral-200 active:bg-neutral-300"
						onClick={ () => viewportDispatch({
							type: "merge",
							data: {
								yStep: 1,
							}
						}) }
					>
						Reset
					</button>
				</div>
			</div>
		</div>
	);
}

export default Viewer;