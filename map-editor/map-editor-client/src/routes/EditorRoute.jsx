import React from "react";

import { Generate as GenerateMap } from "../modules/map/main.js";
import { ViewTileMap } from "../modules/map/view/ViewTileMap.jsx";

import { Generate as GenerateTexture } from "../modules/texture/main.js";
import { ViewTexturePicker } from "../modules/texture/view/ViewTexturePicker.jsx";

import { Generate as GenerateBrushes } from "../modules/brushes/main.js";

import { Network } from "../lib/Network.js";
import ViewPalette from "../modules/brushes/view/ViewPalette.jsx";

export const { registry: Registry1 } = Network.CreateSimple({
	brushes: GenerateBrushes(),
	map: GenerateMap(),
	texture: GenerateTexture(),
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
					<ViewTexturePicker module={ Registry1[ "texture" ] } />
				</div>
			</div>
		</div>
	);
};

export default EditorRoute;