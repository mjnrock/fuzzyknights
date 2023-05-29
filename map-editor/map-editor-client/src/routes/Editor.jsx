import React from "react";

import { MapModule } from "../modules/map/main.js";
import { ViewTileMap } from "../modules/map/view/ViewTileMap.jsx";

import { TextureModule } from "../modules/terrain/main.js";
import { ViewTexturePicker } from "../modules/terrain/view/ViewTexturePicker.jsx";

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
			//TODO: Manage the meta content (e.g. grid, flex, etc.)
		>
			<ViewTileMap />
			<ViewTexturePicker />
		</ViewPort>
	);
};

export default Editor;