import React from "react";

import { Generate as GenerateMap } from "../modules/map/main.js";
import { ViewTileMap } from "../modules/map/view/ViewTileMap.jsx";

import { Generate as GenerateTerrain } from "../modules/terrain/main.js";
import { ViewTerrainPicker } from "../modules/terrain/view/ViewTerrainPicker.jsx";

import { Generate as GenerateBrushes } from "../modules/brushes/main.js";

import { Network } from "../lib/Network.js";
import ViewPalette from "../modules/brushes/view/ViewPalette.jsx";

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
					<ViewPalette module={ Registry1[ "brushes" ] } />
					<ViewTileMap module={ Registry1[ "map" ] } />
				</div>
				<div className="flex flex-col items-center justify-center">
					<ViewTerrainPicker module={ Registry1[ "terrain" ] } />
				</div>
			</div>
		</div>
	);
};

export default EditorRoute;