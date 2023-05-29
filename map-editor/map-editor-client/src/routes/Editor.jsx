import React from "react";

import { MapModule, MapModuleReact } from "../modules/map/main.js";
import { Map as MapJSX } from "../modules/map/components/Map.jsx";

import { TextureModule, TextureModuleReact } from "../modules/terrain/main.js";
import { TexturePicker } from "../modules/terrain/components/TexturePicker.jsx";

import { ViewPort } from "../components/ViewPort.js";

export const NetworkContext = React.createContext();
export function Editor() {
	return (
		<ViewPort
			network={ NetworkContext }
			registry={ {
				map: MapModule,
				terrain: TextureModule,
			} }
			// className=""
		>
			<MapModuleReact.Provider>
				<MapJSX />
			</MapModuleReact.Provider>
			<TextureModuleReact.Provider>
				<TexturePicker />
			</TextureModuleReact.Provider>
		</ViewPort>
	);
};

export default Editor;