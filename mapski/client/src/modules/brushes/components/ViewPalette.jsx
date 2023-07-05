import React, { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { BsPen, BsPlus, BsSquare, BsCheck, BsArrowsMove, BsBrush, BsCpu, BsArrowClockwise, BsPlay, BsLock, BsUnlock } from "react-icons/bs";

export function Button({ text, active, children, ...props } = {}) {
	return (
		<div className={ `p-2 text-blue-300 border border-blue-200 border-solid rounded shadow cursor-pointer ${ active ? "bg-blue-300 text-neutral-100" : "bg-neutral-50" } hover:bg-blue-500 hover:text-neutral-300` } { ...props }>
			{ text || children }
		</div>
	)
};

export function AlgorithmDropdown({ data, onSelect }) {
	const [ selected, setSelected ] = useState(Object.keys(data.map.algorithms)[ Object.keys(data.map.algorithms).length - 1 ]);

	const handleSelect = (algorithm) => {
		setSelected(algorithm);
		onSelect(algorithm);
	};

	return (
		<>
			<Listbox value={ selected } onChange={ handleSelect }>
				<Listbox.Button className="flex-1 p-2 text-center text-gray-400 border border-gray-300 border-solid rounded shadow cursor-pointer bg-neutral-50 hover:bg-gray-400 hover:text-neutral-100 active:bg-gray-500">
					{ selected }
				</Listbox.Button>
				<Transition
					as={ Fragment }
					leave="transition ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<Listbox.Options className="absolute py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg w-60 max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
						{ Object.keys(data.map.algorithms).map((algorithm, algorithmIdx) => (
							<Listbox.Option
								key={ algorithmIdx }
								className={ ({ active }) => `${ active ? "text-amber-900 bg-amber-100" : "text-gray-900" } cursor-default select-none relative py-2 pl-10 pr-4` }
								value={ algorithm }
							>
								{ ({ selected, active }) => (
									<>
										<span className={ `${ selected ? "font-medium" : "font-normal" } block truncate` }>
											{ algorithm }
										</span>
										{ selected ? (
											<span className={ `${ active ? "text-amber-600" : "text-amber-600" } absolute inset-y-0 left-0 flex items-center pl-3` }>
												<BsCheck className="text-2xl" />
											</span>
										) : null }
									</>
								) }
							</Listbox.Option>
						)) }
					</Listbox.Options>
				</Transition>
			</Listbox>
		</>
	);
};

export function ViewPalette({ data, update }) {
	const { map: mapData, brushes: brushesData } = data;
	const { mapDispatch, brushesDispatch } = update;

	const [ selectedAlgorithm, setSelectedAlgorithm ] = useState(Object.keys(mapData.algorithms)[ Object.keys(mapData.algorithms).length - 1 ]);
	const [ algorithmSeed, setAlgorithmSeed ] = useState(Date.now());
	const [ isDefaultSeeding, setIsDefaultSeeding ] = useState(true);

	return (
		<div className="flex flex-row items-center justify-center gap-2">
			<div className="flex flex-row items-center justify-center gap-2 p-2 border border-solid rounded bg-blue-50 border-neutral-200">
				<BsBrush className="text-2xl text-blue-200" />
				<Button
					active={ brushesData.brush === "pan" }
					onClick={ e => brushesDispatch({
						type: "pan",
					}) }
				>
					<BsArrowsMove className="text-2xl" />
				</Button>
				<Button
					active={ brushesData.brush === "point" }
					onClick={ e => brushesDispatch({
						type: "point",
					}) }
				>
					<BsPen className="text-2xl" />
				</Button>
				<Button
					active={ brushesData.brush === "plus" }
					onClick={ e => brushesDispatch({
						type: "plus",
					}) }
				>
					<BsPlus className="text-2xl" />
				</Button>
				<Button
					active={ brushesData.brush === "rectangle" }
					onClick={ e => brushesDispatch({
						type: "rectangle",
					}) }
				>
					<BsSquare className="text-2xl" />
				</Button>
			</div>

			<div className="flex flex-row items-center justify-center gap-2 p-2 border border-solid rounded select-none bg-neutral-50 border-neutral-200">
				<BsCpu className="text-2xl text-gray-300" />
				<AlgorithmDropdown
					data={ data }
					onSelect={ setSelectedAlgorithm }
				/>
				<button
					className="flex-1 p-2 text-center text-gray-400 border border-gray-300 border-solid rounded shadow cursor-pointer bg-neutral-50 hover:bg-gray-400 hover:text-neutral-100 active:bg-gray-500"
					onClick={ e => {
						let seed;
						if(isDefaultSeeding) {
							seed = Date.now();
							setAlgorithmSeed(seed);
						} else {
							if(algorithmSeed == null) {
								setAlgorithmSeed(seed);
							} else {
								seed = algorithmSeed;
							}
						}

						mapDispatch({
							type: "algorithm",
							data: {
								algorithm: selectedAlgorithm,
								seed,
							},
						});
					} }
					title="Run the selected algorithm"
				>
					{ isDefaultSeeding ? <BsArrowClockwise className="text-2xl" /> : <BsPlay className="text-2xl" /> }
				</button>
				<input
					type="number"
					className={ `flex-1 p-2 text-center border border-gray-300 border-solid rounded shadow ${ isDefaultSeeding ? "cursor-copy bg-gray-100 text-neutral-500 hover:text-neutral-600 active:text-neutral-700 hover:bg-gray-200 active:bg-gray-300" : "text-neutral-500 bg-white active:bg-gray-100 hover:bg-gray-100" }` }
					value={ algorithmSeed }
					onChange={ e => setAlgorithmSeed(+e.target.value) }
					onClick={ async e => {
						if(isDefaultSeeding) {
							e.preventDefault();

							try {
								await navigator.clipboard.writeText(algorithmSeed);
							} catch(err) {
								console.error(err);
							}
						}
					} }
					readOnly={ isDefaultSeeding }
					title={ isDefaultSeeding ? "Click to copy" : "" }
				/>
				<button
					className={ `flex-1 p-2 text-center border border-solid rounded shadow cursor-pointer ${ isDefaultSeeding ? "bg-emerald-50 text-emerald-500 hover:bg-emerald-100" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100" }` }
					onClick={ e => setIsDefaultSeeding(prev => !prev) }
					title="Toggle default or custom seeding"
				>
					{ isDefaultSeeding ? <BsLock className="text-2xl text-emerald-400" /> : <BsUnlock className="text-2xl text-neutral-400" /> }
				</button>
			</div>
		</div>
	);
};

export default ViewPalette;