import crypto from "crypto-js";
import { useState, useEffect } from "react";

import { FileSource } from "../../../../../apps/spriteski/modules/tessellator/components/FileSource.jsx";
import { TileCanvas } from "../../../../../apps/spriteski/modules/tessellator/components/TileCanvas.jsx";
import { NominatorBar } from "../../../../../apps/spriteski/modules/nominator/components/NominatorBar.jsx";

import SqlHelper from "../../../../../lib/SqlHelper.js";
import Base64 from "../../../../../util/Base64.js";
import clone from "../../../../../util/clone.js";

setTimeout(() => {
}, 500);

export function Tessellator({ data, update }) {
	const { tessellatorData, nominatorData } = data;
	const { tessellatorDispatch, tessellatorDispatchAsync, nominatorDispatch, nominatorDispatchAsync } = update;

	useEffect(() => {
		if(tessellatorData.source) {
			tessellatorDispatchAsync({ type: "tessellate" });
		}
	}, [ tessellatorData.source ]);

	const [ hasSent, setHasSent ] = useState(false);
	useEffect(() => {
		async function save() {
			if(Object.keys(nominatorData.nominations).length && !hasSent) {
				const values = [];
				for(const value of clone(Object.values(nominatorData.nominations))) {
					let next = {
						UUID: value.$id,
						Name: value.$name,
						Tags: value.$tags,
						Base64: await Base64.Encode(value.data),
						Width: value.width,
						Height: value.height,
						NamespaceID: 1,
					};

					next.Hash = crypto.SHA256(next.Base64).toString();

					values.push(next);
				}

				SqlHelper.exec(`DotF.spUpsert`, {
					Schema: `DotF`,
					Table: `Texture`,
					JSON: values,
				})
					.then(result => console.log(result))
					//NOTE: If there is a DB error, it will surface meaningfully here -- use this to display a toast or something
					.catch(err => console.error(err))
					.finally(() => setHasSent(true));
			}
		};
		save();
	}, [ nominatorData ]);


	return (
		<div className="m-2">
			<FileSource
				data={ { tessellatorData, nominatorData } }
				update={ { nominatorDispatch, tessellatorDispatch, tessellatorDispatchAsync } }
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

export default Tessellator;