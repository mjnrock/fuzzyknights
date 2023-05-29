import { TextureModuleReact } from "../main.js";
import { TextureMap } from "../components/TextureMap.jsx";

import { TextureMap as EnumTextureMap } from "../../../data/stub/EnumTerrainType.js";

export function ViewTexturePicker({ network }) {
	return (
		<TextureModuleReact.Provider network={ network }>
			<TextureMap map={ EnumTextureMap } />
		</TextureModuleReact.Provider>
	)
};

export default ViewTexturePicker;