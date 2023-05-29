import { MapModuleReact } from "../main.js";
import { Map as MapJSX } from "../components/Map.jsx";

export function ViewTileMap() {
	return (
		<MapModuleReact.Provider>
			<MapJSX />
		</MapModuleReact.Provider>
	)
};

export default ViewTileMap;