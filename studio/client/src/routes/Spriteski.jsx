import { v4 as uuid } from "uuid";
import { useState, useRef } from "react";
import Chord from "@lespantsfancy/chord";

import { Tessellator } from "../apps/spriteski/modules/tessellator/Tessellator";

import { TileCanvas } from "../apps/spriteski/modules/tessellator/components/TileCanvas";
import Base64 from "../util/Base64";

export const tessellator = Tessellator.New({
	algorithm: async (canvas, { tw, th, rows, cols } = {}) => {
		const tiles = [];

		if(rows || cols) {
			[ tw, th ] = [ canvas.width / cols, canvas.height / rows ];
		} else {
			rows = canvas.height / th;
			cols = canvas.width / tw;
		}

		const ctx = canvas.getContext("2d");
		for(let y = 0; y < rows; y++) {
			const row = [];

			for(let x = 0; x < cols; x++) {
				const data = ctx.getImageData(x * tw, y * th, tw, th);
				const tile = Chord.Node.Identity.New({
					data: await Base64.Decode(data),
					width: tw,
					height: th,
				});

				row.push(tile);
			}

			tiles.push(row);
		}

		return tiles;
	},
});

export function Spriteski() {
	const canvasRef = useRef(null);
	const [ tiles, setTiles ] = useState([]);

	const handleFile = (e) => {
		const file = e.target.files[ 0 ];
		const reader = new FileReader();

		reader.onload = (e) => {
			const img = new Image();
			img.onload = async () => {
				const canvas = canvasRef.current;
				const ctx = canvas.getContext("2d");

				ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
			};
			img.src = e.target.result;
		};
		reader.readAsDataURL(file);
	};

	const performTessellation = async () => {
		setTiles(await Tessellator.tessellate(tessellator, canvasRef.current, { tw: 32, th: 32 }));
	};

	const exportTiles = async () => {
		// create and invoke a download link called uuid().json that contains the serialized tiles
		const a = document.createElement("a");

		let data = [];
		for(let row of tiles) {
			const r = [];
			for(let tile of row) {
				r.push({
					...tile,
					data: await Base64.Encode(tile.data),
				});
			}

			data.push(r);
		}

		a.href = URL.createObjectURL(new Blob([ JSON.stringify(data) ], { type: "application/json" }));
		a.download = `${ uuid() }.json`;
		a.click();

		URL.revokeObjectURL(a.href);
	};

	const handleImport = async e => {
		const file = e.target.files[ 0 ];
		const reader = new FileReader();

		reader.onload = async e => {
			const json = JSON.parse(e.target.result);

			const tiles = [];
			for(let row of json) {
				const r = [];
				for(let tile of row) {
					r.push({
						...tile,
						data: await Base64.Decode(tile.data),
					});
				}

				tiles.push(r);
			}

			// C:\Users\mjnro\Documents\GitHub\fuzzyknights\common\data\sprites\tiles

			setTiles(tiles);
		};
		reader.readAsText(file);
	};

	return (
		<div className="flex flex-col">
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-2xl font-bold">Spriteski</h1>
				<h2 className="text-lg italic">Sprite Editor</h2>
			</div>

			<hr />

			<div className="flex flex-col">
				<h2 className="text-lg italic">Import</h2>

				<input type="file" onChange={ handleFile } />

				<div className="">
					<h2>Canvas</h2>
					<canvas
						ref={ canvasRef }
						width={ 800 }
						height={ 600 }
					/>
				</div>
			</div>

			<hr />

			<div className="flex flex-col">
				<h2 className="text-lg italic">Tessellate</h2>

				<button
					className="px-4 py-2 text-white bg-blue-500 rounded"
					onClick={ performTessellation }
				>Tessellate</button>
			</div>

			<hr />

			<div className="flex flex-col">
				<h2 className="text-lg italic">Tiles</h2>

				<div className="flex flex-wrap gap-2">
					{ tiles.map((row, y) => (
						<div key={ y } className="flex flex-row gap-2">
							{ row.map((tile, x) => (
								<div key={ x } className="flex flex-col">
									<TileCanvas tile={ tile } width={ 32 } height={ 32 } />

								</div>
							)) }
						</div>
					)) }
				</div>
			</div>

			<hr />

			<div className="flex flex-col">
				<h2 className="text-lg italic">Export</h2>

				<button
					className="px-4 py-2 text-white bg-green-500 rounded"
					onClick={ exportTiles }
				>Export</button>
			</div>

			<hr />

			<div className="flex flex-col">
				<h2 className="text-lg italic">Import</h2>

				<input type="file" onChange={ handleImport } />
			</div>
		</div>
	);
};

export default Spriteski;