import React from "react";

import { MapModule, MapModuleReact } from "../modules/map/main.js";
import { Map as MapJSX } from "../modules/map/view/Map.jsx";

import { TextureModule, TextureModuleReact } from "../modules/terrain/main.js";
import { TexturePicker } from "../modules/terrain/view/TexturePicker.jsx";

import { Network } from "../lib/Network.js";

export const ModuleNetwork = new Network({
	modules: {
		map: MapModule,
		terrain: TextureModule,
	},
});
export const NetworkContext = React.createContext();

export function ViewPort() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-neutral-100">
			<MapModuleReact.Provider>
				<MapJSX />
			</MapModuleReact.Provider>
			<TextureModuleReact.Provider>
				<TexturePicker />
			</TextureModuleReact.Provider>
		</div>
	);
}
export function Editor() {
	return (
		<NetworkContext.Provider value={ ModuleNetwork }>
			<ViewPort />
		</NetworkContext.Provider>
	);
};

export default Editor;