import { Map } from "../components/Map.jsx";

import { TerrainMap as EnumTerrainMap } from "../../../data/stub/TerrainMap.js";

export function ViewTileMap({ module }) {
	return (
		<Map
			module={ module }
			terrains={ EnumTerrainMap }
		/>
	);
};

export default ViewTileMap;