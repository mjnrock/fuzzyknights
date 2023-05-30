import { useModule } from "../../../lib/ReactModule";
import { EnumActions } from "../main";

export function TextureMap({ module, textures, ...props }) {
	const { state, dispatch } = useModule(module);

	return (
		<div className="flex flex-col items-center justify-center p-2 m-2 border border-solid rounded border-neutral-200 bg-neutral-50" { ...props }>
			{
				Object.keys(textures).map((key) => {
					return (
						<div
							key={ key }
							className={ `flex flex-row items-center justify-center rounded p-2` + (state.selected === +key ? ` bg-neutral-300` : ``) }
							onClick={ () => {
								dispatch({
									type: EnumActions.SELECT_TEXTURE,
									data: +key
								});
							} }
						>
							<div className="text-neutral-800">{ key }</div>
							<div
								className="w-16 h-16 m-1 border border-gray-800 border-solid rounded cursor-pointer"
								style={ {
									backgroundColor: textures[ key ],
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