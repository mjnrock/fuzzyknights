import { MapModuleReact } from "../main.js";
import { Map } from "../components/Map.jsx";

import { TextureMap as EnumTextureMap } from "../../../data/stub/EnumTerrainType.js";

export function ViewTileMap({ network }) {
	return (
		<MapModuleReact.Provider network={ network }>
			<Map
				textures={ EnumTextureMap }
			/>
		</MapModuleReact.Provider>
	)
};

export default ViewTileMap;