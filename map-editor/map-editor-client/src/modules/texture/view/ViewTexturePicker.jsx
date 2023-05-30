import { TextureMap } from "../components/TextureMap.jsx";

import { TextureMap as EnumTextureMap } from "../../../data/stub/EnumTerrainType.js";

export function ViewTexturePicker({ module, network }) {
	return (
		<TextureMap
			module={ module }
			network={ network }
			textures={ EnumTextureMap }
		/>
	)
};

export default ViewTexturePicker;