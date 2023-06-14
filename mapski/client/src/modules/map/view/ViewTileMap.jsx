import { MapDetail } from "../components/MapDetail.jsx";
import { TerrainCanvas } from "../components/TerrainCanvas.jsx";

export function ViewTileMap({ node, ...props }) {
	return (
		<div className="flex flex-row items-center justify-center p-2 m-2" { ...props }>
			<div className="flex flex-col gap-2 gap-y-6">
				<MapDetail node={ node } />
				<TerrainCanvas
					className="cursor-crosshair"
					node={ node }
				/>
			</div>
		</div>
	);
};

export default ViewTileMap;