import { useEffect } from "react";
import Chord from "@lespantsfancy/chord";

import { Reducers, Nodes } from "../apps/spriteski/main.js";

import { FileSource } from "../apps/spriteski/modules/tessellator/components/FileSource.jsx";
import { TileCanvas } from "../apps/spriteski/modules/tessellator/components/TileCanvas.jsx";

export function Spriteski() {
	const { state: tessellatorData, dispatch: tessellatorDispatch, dispatchAsync: tessellatorDispatchAsync } = Chord.Node.React.useNode(Nodes.tessellator);

	useEffect(() => {
		tessellatorDispatchAsync({ type: "tessellate" });
	}, [ tessellatorData.source ]);

	return (
		<div>
			<FileSource
				data={ { tessellatorData } }
				update={ { tessellatorDispatch } }
			/>

			<div style={ { gridTemplateColumns: `repeat(${ tessellatorData.parameters.sw / tessellatorData.parameters.tw }, 1fr)`, justifyItems: "center" } } className={ `grid ${ tessellatorData.tiles.length ? "p-2 m-2 border border-solid rounded border-neutral-200 bg-neutral-50" : "" }` }>
				{ tessellatorData.tiles.map((row, y) => (
					row.map((tile, x) => (
						<div key={ `${ y }-${ x }` } className="">
							<TileCanvas
								className="border-4 border-transparent border-solid hover:border-red-500 hover:cursor-pointer"
								tile={ tile }
								width={ tile.width }
								height={ tile.height }
							/>
						</div>
					))
				)) }
			</div>
		</div>
	);
};

export default Spriteski;