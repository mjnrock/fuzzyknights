import { MapDetail } from "../components/MapDetail.jsx";
import { TerrainCanvas } from "../components/TerrainCanvas.jsx";

export function ViewTileMap({ module, ...props }) {
	return (
		<div className="flex flex-row items-center justify-center p-2 m-2" { ...props }>
			<div className="flex flex-col gap-2 gap-y-6">
				<MapDetail module={ module } />
				<TerrainCanvas
					className="cursor-crosshair"
					module={ module }
				/>
			</div>
		</div>
	);
};

export default ViewTileMap;