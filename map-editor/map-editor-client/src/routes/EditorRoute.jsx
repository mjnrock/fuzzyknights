import React from "react";

import { Generate as GenerateMap } from "../modules/map/main.js";
import { ViewTileMap } from "../modules/map/view/ViewTileMap.jsx";

import { Generate as GenerateTexture } from "../modules/texture/main.js";
import { ViewTexturePicker } from "../modules/texture/view/ViewTexturePicker.jsx";

import { Network } from "../lib/Network.js";

/**
 * For a given Route, there will only ever be one NetworkContext, which will be the IMM Network
 * since the Registry can be expanded to accommodate multiple instantiations of a given Module.
 * As such, the Context of the parent *file* should dictate the NetworkContext, and the Registry
 * should be passed as a prop to the ViewPort data object.
 */
export const { registry: Registry1 } = Network.CreateSimple({
	map: GenerateMap(),
	texture: GenerateTexture(),
});
export const { registry: Registry2 } = Network.CreateSimple({
	map: GenerateMap(),
	texture: GenerateTexture(),
});

export function EditorRoute() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen select-none bg-neutral-100">
			<div className="flex flex-row items-center justify-center bg-neutral-200">
				<ViewTileMap module={ Registry1[ "map" ] } />
				<ViewTexturePicker module={ Registry1[ "texture" ] } />
			</div>
			<div className="flex flex-row items-center justify-center bg-neutral-200">
				<ViewTileMap module={ Registry2[ "map" ] } />
				<ViewTexturePicker module={ Registry2[ "texture" ] } />
			</div>
		</div>
	);
};

export default EditorRoute;