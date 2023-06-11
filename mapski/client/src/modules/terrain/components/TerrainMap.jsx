import { useModule } from "../../../lib/ReactModule";
import { EnumActions } from "../main";

import { Canvas } from "../../../components/Canvas";

export function TerrainMap({ module, terrains, ...props }) {
	const { state, dispatch } = useModule(module);

	return (
		<div className="flex flex-col items-center justify-center p-2 m-2 border border-solid rounded border-neutral-200 bg-neutral-50" { ...props }>
			{
				Object.keys(terrains).map((key, i) => {
					const terrain = terrains[ key ];

					return (
						<div
							key={ key }
							className={ `flex flex-row items-center justify-center rounded p-2` + (state.selected === +key ? ` bg-neutral-300` : ``) }
							onClick={ () => {
								dispatch({
									type: EnumActions.SELECT_TERRAIN,
									data: +key
								});
							} }
						>
							<div className="text-neutral-800">{ key }</div>
							<div
								className="w-16 h-16 m-1 border border-gray-800 border-solid rounded cursor-pointer"
								style={ {
									backgroundColor: "#999",
								} }
							>
								{ i }
							</div>
							<Canvas source={ terrain.texture } />
						</div>
					);
				})
			}
		</div>
	);
};

export default TerrainMap;