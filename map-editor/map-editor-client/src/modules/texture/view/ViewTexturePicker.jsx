import { TextureMap } from "../components/TextureMap.jsx";

import { TextureMap as EnumTextureMap } from "../../../data/stub/EnumTerrainType.js";

export function ViewTexturePicker({ registry }) {
	return (
		<TextureMap
			module={ registry[ "texture" ] }
			textures={ EnumTextureMap }
		/>
	)
};

export default ViewTexturePicker;