import { TextureModuleReact } from "../main";

import { TextureMap } from "../../../data/stub/EnumTerrainType.js";;

export function TerrainMap({ ...props }) {
	const { module, state, dispatch, emit } = TextureModuleReact.useModule();

	return (
		<div className="flex flex-col items-center justify-center p-2 m-2 border border-solid rounded border-neutral-200 bg-neutral-50" { ...props }>
			{
				Object.keys(TextureMap).map((key) => {
					return (
						<div
							key={ key }
							className={ `flex flex-row items-center justify-center rounded p-2` + (state.selected === +key ? ` bg-neutral-300` : ``) }
							onClick={ () => {
								dispatch({
									type: "SELECT_TEXTURE",
									data: +key
								});
							} }
						>
							<div className="text-neutral-800">{ key }</div>
							<div
								className="w-16 h-16 m-1 border border-gray-800 border-solid rounded cursor-pointer"
								style={ {
									backgroundColor: TextureMap[ key ],
								} }
							/>
						</div>
					);
				})
			}
		</div>
	);
};

export default TerrainMap;