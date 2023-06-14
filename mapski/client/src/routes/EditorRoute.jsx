import React from "react";

import { Generate as GenerateMap } from "../nodes/map/main.js";
import { ViewTileMap } from "../nodes/map/view/ViewTileMap.jsx";

import { Generate as GenerateTerrain } from "../nodes/terrain/main.js";
import { ViewTerrainPicker } from "../nodes/terrain/view/ViewTerrainPicker.jsx";

import { Generate as GenerateBrushes } from "../nodes/brushes/main.js";

import { Network } from "../lib/Network.js";
import ViewPalette from "../nodes/brushes/view/ViewPalette.jsx";

export const { registry: Registry1 } = Network.CreateSimple({
	brushes: GenerateBrushes(),
	map: GenerateMap(),
	terrain: GenerateTerrain(),
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