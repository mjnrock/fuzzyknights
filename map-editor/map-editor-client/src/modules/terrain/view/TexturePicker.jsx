import { useState } from "react";

import { TextureModuleReact } from "../main";

export const TextureMap = {
	0: `rgba(0, 255, 0, 1.0)`,
	1: `rgba(255, 0, 0, 1.0)`,
	2: `rgba(0, 0, 255, 1.0)`,
};

export function TexturePicker({ }) {
	const { module, state, dispatch, emit } = TextureModuleReact.useModule();

	return (
		<div className="flex flex-col items-center justify-center m-2 p-2 border border-solid rounded border-neutral-200 bg-neutral-50">
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
								className="w-16 h-16 m-1 cursor-pointer rounded border border-solid border-gray-800"
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

export default TexturePicker;