import React from "react";

import { Generate as GenerateMap } from "../modules/map/main.js";
import { ViewTileMap } from "../modules/map/view/ViewTileMap.jsx";

import { Generate as GenerateTexture } from "../modules/texture/main.js";
import { ViewTexturePicker } from "../modules/texture/view/ViewTexturePicker.jsx";

import { ViewPort } from "../components/ViewPort.js";

/**
 * For a given Route, there will only ever be one NetworkContext, which will be the IMM Network
 * since the Registry can be expanded to accommodate multiple instantiations of a given Module.
 * As such, the Context of the parent *file* should dictate the NetworkContext, and the Registry
 * should be passed as a prop to the ViewPort data object.
 */
export const NetworkContext = React.createContext();
export const Registry = {
	map: GenerateMap(),
	texture: GenerateTexture(),
};

export function EditorRoute() {
	/**!SECTION
	//  * 1) Create a NetworkContext for IMM
	//  * 2) Create a Module Registry map using their given name and Generator functions
	//  * 		- You should actually initialize the modules here, as it is the application's de facto instantiation mechanism for a module, at large
	 * 3) Create an enrichment mechanism for initialization arguments
	 * 4) Create a ViewPort object, which will be the stateful base for the rendering
	 * 		- { network, registry, meta }
	 * 		- network: The IMM Network
	 * 		- registry: The Module Registry map
	 * 		- meta: The meta content (e.g. grid, flex, etc.)
	 * 5) Render the ViewPort object
	 * 		- Pass the ViewPort data object as render props from the ViewPort render function
	 * 6) Render the ViewTileMap object
	 */
	return (
		<ViewPort
			network={ NetworkContext }
			registry={ Registry }
		//TODO: Manage the meta content (e.g. grid, flex, etc.)
		>
			{ ({ registry, network }) => (
				<>
					<ViewTileMap module={ registry[ "map" ] } network={ network } />
					<ViewTexturePicker module={ registry[ "texture" ] } network={ network } />
				</>
			) }
		</ViewPort>
	);
};

export default EditorRoute;