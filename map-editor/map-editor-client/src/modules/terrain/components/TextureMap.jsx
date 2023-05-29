import { TextureModuleReact } from "../main.js";

export function TextureMap({ map, ...props }) {
	const { state, dispatch } = TextureModuleReact.useModule();

	return (
		<div className="flex flex-col items-center justify-center p-2 m-2 border border-solid rounded border-neutral-200 bg-neutral-50" { ...props }>
			{
				Object.keys(map).map((key) => {
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
									backgroundColor: map[ key ],
								} }
							/>
						</div>
					);
				})
			}
		</div>
	);
};

export default TextureMap;