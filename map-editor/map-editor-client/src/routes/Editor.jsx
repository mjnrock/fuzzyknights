import React from "react";

import { MapModuleReact } from "../modules/map/main.js";
import { Map as MapJSX } from "../modules/map/view/Map.jsx";

import { TextureModuleReact } from "../modules/terrain/main.js";
import { TexturePicker } from "../modules/terrain/view/TexturePicker.jsx";

export function Editor() {
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
};

export default Editor;