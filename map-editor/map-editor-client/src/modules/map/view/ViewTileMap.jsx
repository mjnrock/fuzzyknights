import { Map } from "../components/Map.jsx";

import { TextureMap as EnumTextureMap } from "../../../data/stub/EnumTerrainType.js";

export function ViewTileMap({ module }) {
	return (
		<Map
			module={ module }
			textures={ EnumTextureMap }
		/>
	);
};

export default ViewTileMap;