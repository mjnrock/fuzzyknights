import { Map } from "../components/Map.jsx";

import { TextureMap as EnumTextureMap } from "../../../data/stub/EnumTerrainType.js";

export function ViewTileMap({ registry }) {
	return (
		<Map
			module={ registry[ "map" ] }
			textures={ EnumTextureMap }
		/>
	);
};

export default ViewTileMap;