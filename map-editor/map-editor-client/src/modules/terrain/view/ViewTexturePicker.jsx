import { TextureModuleReact } from "../main.js";
import { TextureMap } from "../components/TextureMap.jsx";

import { TextureMap as EnumTextureMap } from "../../../data/stub/EnumTerrainType.js";

export function ViewTexturePicker({ network }) {
	return (
		<TextureModuleReact.Subscription network={ network }>
			<TextureMap map={ EnumTextureMap } />
		</TextureModuleReact.Subscription>
	)
};

export default ViewTexturePicker;