import { useEffect } from "react";
import { useNode } from "../lib/react/useNode";

import TileMapJSX from "../modules/map/components/TileMap";
import TileMapSizing from "../modules/map/components/TileMapSizing";
import TerrainMap from "../modules/terrain/components/TerrainMap";

import ViewPalette from "../modules/brushes/components/ViewPalette";

import { Reducers, State } from "../apps/editor/main";

import FileMenu from "../modules/menubar/components/FileMenu";
import { FileIO } from "../util/FileIO";

export function Editor() {
	const { state: menubar, dispatch: menubarDispatch } = useNode(State.menubar, Reducers.menubar);
	const { state: map, dispatch: mapDispatch } = useNode(State.map, Reducers.map);
	const { state: terrain, dispatch: terrainDispatch } = useNode(State.terrain, Reducers.terrain);
	const { state: brushes, dispatch: brushesDispatch } = useNode(State.brushes, Reducers.brushes);

	//TODO: This is effectively an app-level keybind.  Move to a more appropriate location.
	useEffect(() => {
		const onKeyDown = e => {
			if(e.code === "F5" || (e.ctrlKey && e.code === "F5") || e.code === "F12") {
				return;
			} else {
				e.preventDefault();
			}

			if(e.code === "Space") {
				brushesDispatch({
					type: "pan",
				});
			} else if(e.code === "KeyP") {
				brushesDispatch({
					type: "point",
				});
			} else if(e.code === "KeyL") {
				brushesDispatch({
					type: "plus",
				});
			} else if(e.code === "KeyR") {
				brushesDispatch({
					type: "rectangle",
				});
			}
		};
		const onKeyUp = e => {
			e.preventDefault();
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
				<ViewPalette data={ brushes } update={ { mapDispatch, brushesDispatch } } />
			</div>
			<div className="flex flex-row gap-2">
				<div className="flex flex-col gap-2">
					<TerrainMap data={ terrain } update={ terrainDispatch } />
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex flex-row gap-2">
						<TileMapSizing data={ map } update={ mapDispatch } />
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