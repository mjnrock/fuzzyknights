import { useEffect } from "react";
import Chord from "@lespantsfancy/chord";

import { Reducers, Nodes } from "../apps/spriteski/main.js";

import { FileSource } from "../apps/spriteski/modules/tessellator/components/FileSource.jsx";
import { TileCanvas } from "../apps/spriteski/modules/tessellator/components/TileCanvas.jsx";
import { NominatorBar } from "../apps/spriteski/modules/nominator/components/NominatorBar.jsx";

// const patternize = (phrase, tiles) => {
// 	// phrase = [ a, b, c..., n ]
// 	console.log(phrase);
// 	console.log(tiles);
// };
// const form = useForm(fields, {
// 	onUpdate: next => console.log("NEXT", next),
// 	onValidate: (name, isValid) => console.log("VALIDATE", name, isValid),
// 	onSubmit: (state) => {
// 		const phrase = Object.values(state).map(value => eval(value));
// 		const result = patternize(phrase, tiles);

// 		console.log(result);
// 	},
// });

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
				data={ { nominatorData } }
				update={ { nominatorDispatch, nominatorDispatchAsync } }
			/>

			<div
				style={ { gridTemplateColumns: `repeat(${ tessellatorData.parameters.sw / tessellatorData.parameters.tw }, 1fr)`, justifyItems: "center" } }
				className={ `grid ${ tessellatorData.tiles.length ? "p-2 m-2 border border-solid rounded border-neutral-200 bg-neutral-800" : "" }` }
				title="There is CSS padding, border, and margin baked into the Tile visual for aesthetics.  The actual Tile is only the tessellation result without said CSS."
			>
				{ tessellatorData.tiles.map((row, y) => (
					row.map((tile, x) => (
						<div key={ `${ y }-${ x }` } className="p-1 m-1 border border-solid rounded shadow cursor-pointer border-neutral-200 bg-neutral-50 hover:bg-neutral-200 active:bg-neutral-300">
							<TileCanvas
								className="cursor-pointer"
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