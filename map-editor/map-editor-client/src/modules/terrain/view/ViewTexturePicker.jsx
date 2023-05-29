import { TextureModuleReact } from "../main.js";
import { TerrainMap } from "../components/TerrainMap.jsx";

export function ViewTexturePicker() {
	return (
		<TextureModuleReact.Provider>
			<TerrainMap />
		</TextureModuleReact.Provider>
	)
};

export default ViewTexturePicker;