import { Map } from "../components/Map.jsx";

import { TextureMap as EnumTextureMap } from "../../../data/stub/EnumTerrainType.js";

export function ViewTileMap({ module, network }) {
	return (
		<Map
			module={ module }
			network={ network }
			textures={ EnumTextureMap }
		/>
	);
};

export default ViewTileMap;