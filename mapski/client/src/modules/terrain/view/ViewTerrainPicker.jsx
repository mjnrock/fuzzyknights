import { TerrainMap } from "../components/TerrainMap.jsx";

import { TerrainMap as EnumTerrainMap } from "../../../data/stub/TerrainMap.js";

export function ViewTerrainPicker({ module }) {
	return (
		<TerrainMap
			module={ module }
			terrains={ EnumTerrainMap }
		/>
	)
};

export default ViewTerrainPicker;