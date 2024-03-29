import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { BsSliders, BsPlay } from "react-icons/bs";
import { NominationForm } from "./NominationForm.jsx";

export function NominatorBar({ data, update }) {
	const { tessellatorData, nominatorData } = data;
	const { nominatorDispatch, nominatorDispatchAsync } = update;

	const [ isOpen, setIsOpen ] = useState(false);
	const openModal = () => setIsOpen(true);
	const closeModal = () => setIsOpen(false);

	return (
		<>
			<div className="flex flex-row items-center justify-between w-full gap-2 p-2 my-2 border border-solid rounded shadow-md border-neutral-100">
				<button
					className="flex flex-col items-center justify-center p-4 border border-solid rounded shadow cursor-pointer text-neutral-400 hover:text-amber-400 border-neutral-200 hover:bg-amber-50 active:bg-amber-100 hover:border-amber-200"
					onClick={ openModal }
					title="Adjust pattern parameters"
				>
					<BsSliders className="text-lg" />
				</button>
				<input
					className="w-full p-2 h-[50px] text-center border border-solid rounded border-neutral-200 hover:bg-neutral-50 text-xl shadow"
					type="text"
					placeholder="Naming Pattern"
					value={ nominatorData.phrase }
					onChange={ e => nominatorDispatch({ type: "setPhrase", data: e.target.value }) }
					onKeyDown={ e=> {
						if(e.ctrlKey && e.code === "Space") {
							openModal();
						} else if(e.ctrlKey && e.key === "Enter") {
							nominatorDispatch({ type: "nominate", data: tessellatorData.tiles });
						}
					}}
					title="For now, only hyphen (-) separators are properly supported.  Press CTRL+SPACE to open the nomination form, and CTRL+ENTER to apply the naming pattern to the respective tiles."
				/>
				<button
					className="flex flex-col items-center justify-center p-4 border border-solid rounded shadow cursor-pointer text-neutral-400 hover:text-emerald-400 border-neutral-200 hover:bg-emerald-50 active:bg-emerald-100 hover:border-emerald-200"
					onClick={ e => nominatorDispatch({ type: "nominate", data: tessellatorData.tiles }) }
					title="Apply name to respective tiles"
				>
					<BsPlay className="text-lg" />
				</button>
			</div>

			<Dialog as="div" open={ isOpen } onClose={ closeModal } className="fixed inset-0 z-10 overflow-y-auto">
				<div className="min-h-screen px-4 text-center">
					<Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
					<span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
					<div className="inline-block w-full max-w-md p-4 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded shadow-xl">
						<Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
							Nomination Form
						</Dialog.Title>

						<div className="mt-2">
							<NominationForm
								data={ { tessellatorData, nominatorData } }
								update={ { nominatorDispatch, nominatorDispatchAsync } }
							/>
						</div>

						<div className="mt-4">
							<button
								type="button"
								className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
								onClick={ closeModal }
							>
								Close
							</button>
						</div>
					</div>
				</div>
			</Dialog>
		</>
	);
};

export default NominatorBar;