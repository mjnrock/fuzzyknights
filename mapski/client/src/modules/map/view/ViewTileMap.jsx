import { Map } from "../components/Map.jsx";

import { TerrainMap as EnumTerrainMap } from "../../../data/stub/EnumTerrainType.js";

export function ViewTileMap({ module }) {
	return (
		<Map
			module={ module }
			terrains={ EnumTerrainMap }
		/>
	);
};

export default ViewTileMap;