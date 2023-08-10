import { BsEye, BsEyeSlash } from "react-icons/bs";
import { v4 as uuid } from "uuid";
import { useState, useRef, useEffect } from "react";
import Chord from "@lespantsfancy/chord";

import { Tessellator } from "../apps/spriteski/modules/tessellator/Tessellator";

import { TileCanvas } from "../apps/spriteski/modules/tessellator/components/TileCanvas";
import Base64 from "../util/Base64";

export const tessellator = Tessellator.New({
	algorithm: async (canvas, { tw, th, sx = 0, sy = 0, sw = canvas.width, sh = canvas.height } = {}) => {
		const tiles = [];

		const rows = Math.ceil(sh / th);
		const cols = Math.ceil(sw / tw);

		const ctx = canvas.getContext("2d");
		for(let row = 0; row < rows; row++) {
			const tileRow = [];

			for(let col = 0; col < cols; col++) {
				const data = ctx.getImageData(sx + col * tw, sy + row * th, tw, th);
				const tile = Chord.Node.Identity.New({
					data: await Base64.Decode(data),
					width: tw,
					height: th,
				});

				tileRow.push(tile);
			}

			tiles.push(tileRow);
		}

		return tiles;
	},
});

//TODO: EXPORT currently only stores the image data, *not* any of the tessellation parameters/data

export function Spriteski() {
	const canvasRef = useRef(null);
	const [ tiles, setTiles ] = useState([]);
	const [ size, setSize ] = useState([ 5, 5 ]); // size[0] = rows, size[1] = cols
	const [ tileSize, setTileSize ] = useState([ 32, 32 ]); // tileSize[0] = width, tileSize[1] = height
	const [ sourceRegion, setSourceRegion ] = useState([ 0, 0, 0, 0 ]); // sourceRegion[0] = x, sourceRegion[1] = y, sourceRegion[2] = w, sourceRegion[3] = h
	const [ preview, setPreview ] = useState(false);
	const [ sourceImage, setSourceImage ] = useState(null);

	useEffect(() => {
		if(preview) {
			const ctx = canvasRef.current.getContext("2d");
			ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

			// Draw the original image (if available)
			if(sourceImage) {
				ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, 0, canvasRef.current.width, canvasRef.current.height);
			}

			const scaleX = canvasRef.current.width / (sourceImage?.width ?? 1);
			const scaleY = canvasRef.current.height / (sourceImage?.height ?? 1);

			// Draw the red rectangles
			ctx.strokeStyle = "red";
			ctx.lineWidth = 1;
			for(let row = 0; row < size[ 0 ]; row++) {
				for(let col = 0; col < size[ 1 ]; col++) {
					ctx.strokeRect(
						(sourceRegion[ 0 ] + col * tileSize[ 0 ]) * scaleX,
						(sourceRegion[ 1 ] + row * tileSize[ 1 ]) * scaleY,
						tileSize[ 0 ] * scaleX,
						tileSize[ 1 ] * scaleY
					);
				}
			}
		} else {
			// Revert the canvas to its original state if preview is turned off
			const ctx = canvasRef.current.getContext("2d");
			ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

			if(sourceImage) {
				ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, 0, canvasRef.current.width, canvasRef.current.height);
			}
		}
	}, [ size, tileSize, sourceRegion, preview ]);

	const handleSizeChange = (e, index) => {
		const newSize = [ ...size ];
		newSize[ index ] = Math.ceil(+e.target.value);
		setSize(newSize);

		let width = sourceRegion[ 2 ],
			height = sourceRegion[ 3 ];
		setTileSize([ Math.ceil(width / newSize[ 1 ]), Math.ceil(height / newSize[ 0 ]) ]);
	};

	const handleTileSizeChange = (e, index) => {
		const newTileSize = [ ...tileSize ];
		newTileSize[ index ] = Math.ceil(+e.target.value);
		setTileSize(newTileSize);

		let width = sourceRegion[ 2 ],
			height = sourceRegion[ 3 ];
		setSize([ Math.ceil(height / newTileSize[ 1 ]), Math.ceil(width / newTileSize[ 0 ]) ]);
	};

	const handleSourceRegionChange = (e, index) => {
		const newSourceRegion = [ ...sourceRegion ];
		newSourceRegion[ index ] = Math.ceil(+e.target.value);
		setSourceRegion(newSourceRegion);

		let width = newSourceRegion[ 2 ],
			height = newSourceRegion[ 3 ];
		setSize([ Math.ceil(height / tileSize[ 1 ]), Math.ceil(width / tileSize[ 0 ]) ]);
	};

	const handleFile = (e) => {
		const file = e.target.files[ 0 ];
		const reader = new FileReader();

		reader.onload = (e) => {
			const img = new Image();
			img.onload = async () => {
				const canvas = canvasRef.current;
				const ctx = canvas.getContext("2d");

				ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);

				// Set default source region size
				setSourceRegion([ 0, 0, img.width, img.height ]);

				// Set default size
				setSize([ Math.ceil(img.height / tileSize[ 1 ]), Math.ceil(img.width / tileSize[ 0 ]) ]);

				setSourceImage(img);

				setPreview(true);
			};
			img.src = e.target.result;
		};
		
		reader?.readAsDataURL(file);
	};

	const performTessellation = async () => {
		setTiles(await Tessellator.tessellate(tessellator, sourceImage, {
			tw: tileSize[ 0 ],
			th: tileSize[ 1 ],
			sx: sourceRegion[ 0 ],
			sy: sourceRegion[ 1 ],
			sw: sourceRegion[ 2 ],
			sh: sourceRegion[ 3 ],
			// rows: size[ 0 ],
			// cols: size[ 1 ],
		}));
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

			<div className="flex flex-col items-center justify-center">
				<h2 className="text-lg italic">File Source</h2>

				<label className="px-4 py-2 text-white bg-blue-500 rounded cursor-pointer">
					Choose File
					<input
						type="file"
						className="hidden"
						onChange={ handleFile }
					/>
				</label>

				<div className="flex flex-col items-center justify-center">
					<button onClick={ () => setPreview(!preview) }>
						{ preview ? <BsEyeSlash /> : <BsEye /> } Preview
					</button>
					<canvas ref={ canvasRef } width={ 800 } height={ 600 } />
				</div>
			</div>

			<hr />

			<div className="flex flex-col items-center justify-center">
				<h2 className="text-lg italic">Tessellate</h2>

				<div className="flex flex-row items-center justify-center w-full">
					<label className="basis-1/4">
						<span className="text-gray-700">Source X:</span>
						<input type="number" value={ sourceRegion[ 0 ] } onChange={ (e) => handleSourceRegionChange(e, 0) } className="w-full p-2 mt-1 border-gray-300 rounded-md" />
					</label>

					<label className="basis-1/4">
						<span className="text-gray-700">Source Y:</span>
						<input type="number" value={ sourceRegion[ 1 ] } onChange={ (e) => handleSourceRegionChange(e, 1) } className="w-full p-2 mt-1 border-gray-300 rounded-md" />
					</label>

					<label className="basis-1/4">
						<span className="text-gray-700">Source Width:</span>
						<input type="number" value={ sourceRegion[ 2 ] } onChange={ (e) => handleSourceRegionChange(e, 2) } className="w-full p-2 mt-1 border-gray-300 rounded-md" />
					</label>

					<label className="basis-1/4">
						<span className="text-gray-700">Source Height:</span>
						<input type="number" value={ sourceRegion[ 3 ] } onChange={ (e) => handleSourceRegionChange(e, 3) } className="w-full p-2 mt-1 border-gray-300 rounded-md" />
					</label>
				</div>

				<div className="flex flex-row items-center justify-center w-full">
					<label className="basis-1/2">
						<span className="text-gray-700">Columns:</span>
						<input type="number" value={ size[ 1 ] } onChange={ (e) => handleSizeChange(e, 1) } className="w-full p-2 mt-1 border-gray-300 rounded-md" />
					</label>

					<label className="basis-1/2">
						<span className="text-gray-700">Rows:</span>
						<input type="number" value={ size[ 0 ] } onChange={ (e) => handleSizeChange(e, 0) } className="w-full p-2 mt-1 border-gray-300 rounded-md" />
					</label>

					<label className="basis-1/2">
						<span className="text-gray-700">Tile Width:</span>
						<input type="number" value={ tileSize[ 0 ] } onChange={ (e) => handleTileSizeChange(e, 0) } className="w-full p-2 mt-1 border-gray-300 rounded-md" />
					</label>

					<label className="basis-1/2">
						<span className="text-gray-700">Tile Height:</span>
						<input type="number" value={ tileSize[ 1 ] } onChange={ (e) => handleTileSizeChange(e, 1) } className="w-full p-2 mt-1 border-gray-300 rounded-md" />
					</label>
				</div>

				<button
					className="px-4 py-2 text-white bg-blue-500 rounded"
					onClick={ performTessellation }
				>Tessellate</button>
			</div>

			<hr />

			<div className="flex flex-col">
				<h2 className="text-lg italic">Tiles</h2>

				<div style={ { gridTemplateColumns: `repeat(${ size[ 1 ] }, 1fr)` } } className="grid">
					{ tiles.map((row, y) => (
						row.map((tile, x) => (
							<div key={ `${ y }-${ x }` } className="">
								<TileCanvas
									className="border-4 border-transparent border-solid hover:border-red-500 hover:cursor-pointer"
									tile={ tile }
									width={ tileSize[ 0 ] }
									height={ tileSize[ 1 ] }
								/>
							</div>
						))
					)) }
				</div>
			</div>

			<hr />

			<div className="flex flex-col items-center justify-center">
				<h2 className="text-lg italic">Export</h2>

				<button
					className="px-4 py-2 text-white bg-green-500 rounded"
					onClick={ exportTiles }
				>Export</button>
			</div>

			<hr />

			<div className="flex flex-col items-center justify-center">
				<h2 className="text-lg italic">Import</h2>

				<label className="px-4 py-2 text-white bg-blue-500 rounded cursor-pointer">
					Import
					<input
						type="file"
						className="hidden"
						onChange={ handleImport }
					/>
				</label>
			</div>
		</div>
	);
};

export default Spriteski;