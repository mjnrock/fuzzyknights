import React from "react";

import { Next as NextMap } from "../modules/map/main.js";
import { ViewTileMap } from "../modules/map/view/ViewTileMap.jsx";

import { Next as NextTerrain } from "../modules/terrain/main.js";
import { ViewTerrainPicker } from "../modules/terrain/view/ViewTerrainPicker.jsx";

import { Next as NextBrushes } from "../modules/brushes/main.js";

import { Network } from "../lib/Network.js";
import ViewPalette from "../modules/brushes/view/ViewPalette.jsx";

export const { registry: Registry1 } = Network.CreateSimple({
	brushes: NextBrushes(),
	map: NextMap(),
	terrain: NextTerrain(),
});

export function EditorRoute() {
	return (
		<div className="flex flex-col select-none">
			<div className="flex flex-row">
				<div className="flex flex-col items-center justify-center">
					<ViewTerrainPicker node={ Registry1[ "terrain" ] } />
				</div>
				<div className="flex flex-col items-center justify-center">
					<ViewPalette node={ Registry1[ "brushes" ] } />
					<ViewTileMap node={ Registry1[ "map" ] } />
				</div>
			</div>
		</div>
	);
};

export default EditorRoute;