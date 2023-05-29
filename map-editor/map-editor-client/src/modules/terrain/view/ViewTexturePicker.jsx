import { TextureModuleReact } from "../main.js";
import { TextureMap } from "../components/TextureMap.jsx";

import { TextureMap as EnumTextureMap } from "../../../data/stub/EnumTerrainType.js";

export function ViewTexturePicker() {
	return (
		<TextureModuleReact.Provider>
			<TextureMap map={ EnumTextureMap } />
		</TextureModuleReact.Provider>
	)
};

export default ViewTexturePicker;