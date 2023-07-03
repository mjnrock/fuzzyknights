import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

import { TerrainPreview } from "./TerrainPreview";

export function TerrainModal({ terrain = {}, isOpen, setIsOpen, onSubmit }) {
	let [ texture, setTexture ] = useState(terrain.texture || "");
	let [ type, setType ] = useState(terrain.type || "");
	let [ cost, setCost ] = useState(terrain.cost || 0);
	let [ mask, setMask ] = useState(terrain.mask || 0);

	const terrainObj = {
		...terrain,
		texture,
		type,
		cost,
		mask,
	};

	const handleClose = (submitted) => {
		if(submitted) {
			onSubmit(terrainObj);
		}

		setIsOpen(false);
	};

	return (
		<Transition appear show={ isOpen } as={ Fragment }>
			<Dialog
				as="div"
				className="fixed inset-0 z-10 overflow-y-auto"
				onClose={ handleClose }
			>
				<div className="min-h-screen px-4 text-center">
					<Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

					<span
						className="inline-block h-screen align-middle"
						aria-hidden="true"
					>
						&#8203;
					</span>

					<div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
						<Dialog.Title
							as="h3"
							className="py-2 mb-4 text-lg font-thin leading-6 text-center border border-solid rounded shadow text-gr zay-900 border-neutral-200"
						>
							Add Terrain
						</Dialog.Title>

						<div>
							<div className="flex flex-col items-center justify-center w-full gap-2">
								<div className="grid items-center w-full grid-cols-4 gap-2">
									<div className="col-span-1 text-sm font-thin text-center text-gray-500">Texture</div>
									<div className="flex flex-row items-center justify-center col-span-3">
										<TerrainPreview
											terrain={ terrainObj }
											colorHandler={ (color) => setTexture(color) }
											imageHandler={ (image) => setTexture(image) }
											className="col-span-3"
										/>
									</div>
								</div>
								<div className="grid items-center w-full grid-cols-4 gap-2">
									<div className="col-span-1 text-sm font-thin text-center text-gray-500">Type</div>
									<input
										type="text"
										value={ type }
										onChange={ (e) => setType(e.target.value.replace(/[\s-]/gi, "_").toUpperCase()) }
										className="col-span-3 p-2 text-left border border-gray-300 border-solid rounded shadow"
									/>
								</div>
								<div className="grid items-center w-full grid-cols-4 gap-2">
									<div className="col-span-1 text-sm font-thin text-center text-gray-500">Cost</div>
									<input
										type="number"
										value={ cost }
										onChange={ (e) => setCost(e.target.value) }
										className="col-span-3 p-2 text-center border border-gray-300 border-solid rounded shadow"
									/>
								</div>
								<div className="grid items-center w-full grid-cols-4 gap-2">
									<div className="col-span-1 text-sm font-thin text-center text-gray-500">Mask</div>
									<input
										type="number"
										value={ mask }
										onChange={ (e) => setMask(e.target.value) }
										className="col-span-3 p-2 text-center border border-gray-300 border-solid rounded shadow"
									/>
								</div>
							</div>

							<div className="flex w-full gap-2 mt-4">
								<div
									className="flex items-center justify-center w-full p-2 border border-solid rounded shadow cursor-pointer text-neutral-500 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-200"
									onClick={ e => handleClose(true) }
								>
									<div className="ml-2">Submit</div>
								</div>

								<div
									className="flex items-center justify-center w-full p-2 border border-solid rounded shadow cursor-pointer text-neutral-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
									onClick={ e => handleClose(false) }
								>
									<div className="ml-2">Cancel</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}

export default TerrainModal;