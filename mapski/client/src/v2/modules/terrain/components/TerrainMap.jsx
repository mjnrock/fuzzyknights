import { BsInfinity } from "react-icons/bs";
import { TerrainPreview } from "./TerrainPreview";
import { BitMask } from "../../../components/BitMask";

// STUB: Import from data network
export const EnumMask = {
	IsNavigable: 1 << 0,
	IsBuildable: 1 << 1,
	IsHarvestable: 1 << 2,
};

export function TerrainMap({ data, update, ...props }) {
	return (
		<div className="flex flex-col items-center justify-center p-2 m-2 border border-solid rounded border-neutral-200 bg-neutral-50" { ...props }>
			{
				Object.keys(data.terrains).map((key, i) => {
					const terrain = data.terrains[ key ];

					return (
						<div
							key={ key }
							className={ `flex flex-row items-center justify-center rounded p-2 border border-solid cursor-pointer hover:bg-sky-50 hover:border-sky-200 ` + (data.selected === key ? ` bg-sky-100 border-sky-300` : `border-transparent`) }
							onClick={ () => {
								update({
									type: "selectTerrain",
									data: key
								});
							} }
						>
							<TerrainPreview
								terrain={ terrain }
								colorHandler={ (color) => {
									update({
										type: "setTerrainTexture",
										data: { key, texture: color }
									});
								} }
								imageHandler={ (image) => {
									update({
										type: "setTerrainTexture",
										data: { key, texture: image }
									});
								} }
							/>

							<div className="flex flex-col space-y-2">
								<div className="flex">
									<p className="font-bold">type:</p>
									<p className="ml-2 italic">{ terrain.type }</p>
								</div>
								<div className="flex">
									<p className="font-bold">cost:</p>
									<p className="m-auto ml-2 italic">{ terrain.cost === Infinity ? <BsInfinity className="text-sm" /> : terrain.cost }</p>
								</div>
								<div className="flex">
									<p className="font-bold">mask:</p>
									<p className="ml-2 italic">{ terrain.mask }</p>
								</div>
								<BitMask mask={ terrain.mask } dict={ EnumMask } />
							</div>
						</div>
					);
				})
			}
		</div>
	);
};

export default TerrainMap;