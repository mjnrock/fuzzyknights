import { MapModuleReact } from "../main.js";
import { Map } from "../components/Map.jsx";

export function ViewTileMap({ network }) {
	return (
		<MapModuleReact.Provider>
			<Map network={ network } />
		</MapModuleReact.Provider>
	)
};

export default ViewTileMap;