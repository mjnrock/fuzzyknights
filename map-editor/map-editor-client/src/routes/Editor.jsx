import React from "react";

import { MapModuleReact } from "../modules/map/main";
import { Map as MapJSX } from "../modules/map/view/Map.jsx";

export function Editor() {
	return (
		<MapModuleReact.Provider>
			<MapJSX />
		</MapModuleReact.Provider>
	);
};

export default Editor;