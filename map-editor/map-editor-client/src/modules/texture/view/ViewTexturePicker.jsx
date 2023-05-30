import { TextureMap } from "../components/TextureMap.jsx";

import { TextureMap as EnumTextureMap } from "../../../data/stub/EnumTerrainType.js";

export function ViewTexturePicker({ module }) {
	return (
		<TextureMap
			module={ module }
			textures={ EnumTextureMap }
		/>
	)
};

export default ViewTexturePicker;