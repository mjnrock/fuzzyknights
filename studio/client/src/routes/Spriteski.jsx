import { useEffect } from "react";
import Chord from "@lespantsfancy/chord";

import { Nodes } from "../apps/spriteski/main.js";

import { FileSource } from "../apps/spriteski/modules/tessellator/components/FileSource.jsx";
import { TileCanvas } from "../apps/spriteski/modules/tessellator/components/TileCanvas.jsx";
import { NominatorBar } from "../apps/spriteski/modules/nominator/components/NominatorBar.jsx";

export function Spriteski() {
	const { state: tessellatorData, dispatch: tessellatorDispatch, dispatchAsync: tessellatorDispatchAsync } = Chord.Node.React.useNode(Nodes.tessellator);
	const { state: nominatorData, dispatch: nominatorDispatch, dispatchAsync: nominatorDispatchAsync } = Chord.Node.React.useNode(Nodes.nominator);

	useEffect(() => {
		if(tessellatorData.source) {
			tessellatorDispatchAsync({ type: "tessellate" });
		}
	}, [ tessellatorData.source ]);

	return (
		<div className="m-2">
			<FileSource
				data={ { tessellatorData } }
				update={ { tessellatorDispatch, tessellatorDispatchAsync } }
			/>

			<NominatorBar
				data={ { tessellatorData, nominatorData } }
				update={ { nominatorDispatch, nominatorDispatchAsync } }
			/>

			<div
				style={ { gridTemplateColumns: `repeat(${ tessellatorData?.size }, 1fr)`, justifyItems: "center" } }
				className={ `grid ${ tessellatorData.tiles.length ? "p-2 m-2 border border-solid rounded border-neutral-200 bg-neutral-800" : "" }` }
				title="There is CSS padding, border, and margin baked into the Tile visual for aesthetics.  The actual Tile is the space *within* the gray border."
			>
				{ tessellatorData.tiles.map((row, y) => (
					row.map((tile, x) => (
						<div key={ `${ y }-${ x }` } className="flex flex-col items-center justify-center p-1 m-1 border border-solid rounded shadow cursor-pointer select-none border-neutral-200 bg-neutral-50 hover:bg-sky-200 active:bg-sky-300 hover:border-sky-200 active:border-sky-300">
							<TileCanvas
								className="border border-solid cursor-pointer border-neutral-300 bg-neutral-50"
								tile={ tile }
								width={ tile.width }
								height={ tile.height }
								onClick={ e => navigator.clipboard.writeText(tile.$name) }
							/>
							<pre>
								{
									tile.$name && (
										<div className="text-xs text-center text-neutral-700">
											{ tile.$name }
										</div>
									)
								}
							</pre>
						</div>
					))
				)) }
			</div>
		</div>
	);
};

export default Spriteski;