import { useEffect } from "react";
import Chord from "@lespantsfancy/chord";

import { Reducers, Nodes } from "../apps/spriteski/main.js";

import { FileSource } from "../apps/spriteski/modules/tessellator/components/FileSource.jsx";

export function Spriteski() {
	const { state: tessellatorData, dispatch: tessellatorDispatch } = Chord.Node.React.useNode(Nodes.tessellator);

	console.log(tessellatorData)

	return (
		<div>
			<FileSource
				data={ { tessellatorData } }
				update={ { tessellatorDispatch } }
			/>

			<button
				className="flex flex-col items-center justify-center p-4 border border-solid rounded shadow cursor-pointer border-neutral-200 hover:bg-neutral-50 active:bg-neutral-100 text-neutral-400"
				onClick={ () => tessellatorDispatch({ type: "tessellate" }) }
			>
				Tessellate
			</button>
			{
				tessellatorData.tiles.map((file, i) => (
					<div key={ i }>
						{ i }
					</div>
				))
			}
		</div>
	);
};

export default Spriteski;