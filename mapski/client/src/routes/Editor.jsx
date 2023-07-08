import { useEffect } from "react";
import { useNode, useNodeEvent } from "../lib/react/useNode";

import TileMapJSX from "../modules/map/components/TileMap";
import TileMapSizing from "../modules/map/components/TileMapSizing";
import TerrainMap from "../modules/terrain/components/TerrainMap";

import ViewPalette from "../modules/brushes/components/ViewPalette";

import { Reducers, State } from "../apps/editor/main";

import FileMenu from "../modules/menubar/components/FileMenu";
import { FileIO } from "../util/FileIO";
import { clone } from "../util/clone";
import StateHistory from "../modules/history/components/StateHistory";

//TODO: Because of the feedback loop, `map` has been given a "reversion" reducer, but it's identical to the "set" reducer.

export function Editor() {
	const { state: menubar, dispatch: menubarDispatch } = useNode(State.menubar, Reducers.menubar);
	const { state: map, dispatch: mapDispatch } = useNode(State.map, Reducers.map);
	const { state: history, dispatch: historyDispatch } = useNode(State.history, Reducers.history);
	const { state: terrain, dispatch: terrainDispatch } = useNode(State.terrain, Reducers.terrain);
	const { state: brushes, dispatch: brushesDispatch } = useNode(State.brushes, Reducers.brushes);

	useEffect(() => {
		// Load the state into history as the first point of reversion.
		historyDispatch({
			type: "push",
			data: {
				type: "map",
				state: clone(map),
			},
		});
	}, []);

	// const { emit } = useNodeEvent(State.map, "update", (...args) => console.log("Map update:", ...args));

	//TODO: This is effectively an app-level keybind.  Move to a more appropriate location.
	useEffect(() => {
		const onKeyDown = e => {
			if(e.code === "F5" || (e.ctrlKey && e.code === "F5") || e.code === "F12") {
				return;
			}

			if(e.code === "Space" || e.code === "KeyM") {
				e.preventDefault();
				brushesDispatch({
					type: "pan",
				});
			} else if(e.code === "KeyP") {
				e.preventDefault();
				brushesDispatch({
					type: "point",
				});
			} else if(e.code === "KeyL") {
				e.preventDefault();
				brushesDispatch({
					type: "plus",
				});
			} else if(e.code === "KeyR") {
				e.preventDefault();
				brushesDispatch({
					type: "rectangle",
				});
			} else if(e.code === "KeyZ" && e.ctrlKey) {
				e.preventDefault();
				historyDispatch({
					type: "undo",
				});
			} else if(e.code === "KeyY" && e.ctrlKey) {
				e.preventDefault();
				historyDispatch({
					type: "redo",
				});
			}
		};
		const onKeyUp = e => {
			if(e.code === "Space" && e.ctrlKey) {
				e.preventDefault();
				mapDispatch({
					type: "offset",
					data: [ 0, 0 ],
				});
			} else if(e.code === "Backspace" && e.ctrlKey && e.shiftKey) {
				e.preventDefault();
				historyDispatch({
					type: "cull",
				});
			} else if(e.code === "Enter" && e.ctrlKey && e.shiftKey) {
				e.preventDefault();
				historyDispatch({
					type: "rebase",
				});
			}
		};

		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);

		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
		};
	}, []);

	//TODO: FileMenu should use events when command patterns are desired.  Build out/refine Node event paradigm.
	// Once established, move these into events and create an appropriate "emitter" or similar for `useNode`.
	const saveMap = () => {
		console.log("Saving map...");
		const data = {
			map,
			terrain,
		};

		FileIO.save(data)
			.then((message) => console.log(message))
			.catch((error) => console.error(error));
	};
	const loadMap = () => {
		console.log("Loading map...");

		FileIO.load()
			.then((data) => {
				mapDispatch({ type: "set", data: data.map });
				terrainDispatch({ type: "set", data: data.terrain });
			})
			.catch((error) => console.error(error));
	};

	const exec = (command) => {
		if(command.type === "file/save") {
			saveMap();
		} else if(command.type === "file/load") {
			loadMap();
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-row items-center justify-center w-full gap-2">
				<FileMenu
					data={ menubar.menu }
					onSelect={ (command) => exec({ type: command }) }
				/>
			</div>

			<div className="flex flex-row items-center justify-center w-full gap-2">
				<ViewPalette data={ { map, brushes } } update={ { mapDispatch, brushesDispatch } } />
			</div>

			<div className="flex flex-row gap-2">
				<div className="flex flex-col gap-2">
					<TerrainMap data={ terrain } update={ terrainDispatch } />
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex flex-row gap-2">
						<div className="flex flex-col gap-2">
							<StateHistory data={ { map, history, terrain } } update={ { mapDispatch, historyDispatch } } />
							<TileMapSizing data={ map } update={ mapDispatch } />
						</div>
					</div>
					<div className="flex flex-row gap-2">
						<div className="cursor-crosshair">
							<TileMapJSX data={ { map, terrain, brushes } } update={ { mapDispatch, brushesDispatch } } />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Editor;