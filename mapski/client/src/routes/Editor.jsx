import { useNode } from "../lib/react/useNode";

import TileMapJSX from "../modules/map/components/TileMap";
import TileMapSizing from "../modules/map/components/TileMapSizing";
import TerrainMap from "../modules/terrain/components/TerrainMap";

import ViewPalette from "../modules/brushes/components/ViewPalette";

import { Reducers, State } from "../apps/editor/main";

export function Editor() {
	const { state: map, dispatch: mapDispatch } = useNode(State.map, Reducers.map);
	const { state: terrain, dispatch: terrainDispatch } = useNode(State.terrain, Reducers.terrain);
	const { state: brushes, dispatch: brushesDispatch } = useNode(State.brushes, Reducers.brushes);

	return (
		<div className="flex flex-col">
			<div className="flex flex-row">
				<ViewPalette data={ brushes } update={ { mapDispatch, brushesDispatch } } />
			</div>
			<div className="flex flex-row">
				<div className="flex flex-col">
					<TerrainMap data={ terrain } update={ terrainDispatch } />
				</div>

				<div className="flex flex-col">
					<div className="flex flex-row">
						<TileMapSizing data={ map } update={ mapDispatch } />
					</div>
					<div className="flex flex-row">
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