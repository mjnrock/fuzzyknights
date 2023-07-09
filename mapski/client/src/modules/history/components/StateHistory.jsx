import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { useEffect, useRef, useCallback, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import JsonViewer from "../../../components/JsonViewer";
import { TileMapPreview } from "../../map/components/TileMap";
import { clone } from "../../../util/clone";

export function StateHistory({ data, update, direction = "horizontal" }) {
	const { map: mapData, history: historyData, terrain: terrainData } = data;
	const { mapDispatch, historyDispatch } = update;

	const [ isCollapsed, setIsCollapsed ] = useState(false);
	const [ isModalOpen, setIsModalOpen ] = useState(false);
	const [ selectedState, setSelectedState ] = useState(null);
	const [ selectedIndex, setSelectedIndex ] = useState(null);
	const [ deltaState, setDeltaState ] = useState(null);

	const scrollRef = useRef(null);

	const handleClick = useCallback((state, index, option) => {
		return (event) => {
			setSelectedState(state.state);
			setSelectedIndex(index);
			if(event.type === "contextmenu") {
				event.preventDefault();
				// setSelectedState(state.state);
				// setSelectedIndex(index);
				setIsModalOpen(true);
			} else if(event.type === "click") {
				historyDispatch({
					type: "setIndex",
					data: index,
				});

				//TODO: Make this more generically handled, rather than so hardcoded
				if(state.type === "map") {
					mapDispatch({
						type: "reversion",
						data: state.state,
					});
				}
			} else {
				if(option === "cull") {
					historyDispatch({
						type: "set",
						data: {
							history: historyData.history.slice(0, index + 1),
							index,
						},
					});
				} else if(option === "rebase") {
					historyDispatch({
						type: "set",
						data: {
							history: [ state ],
							index: 0,
						},
					});
				} else {
					historyDispatch({
						type: "setIndex",
						data: index,
					});
				}

				//TODO: Make this more generically handled, rather than so hardcoded
				if(state.type === "map") {
					mapDispatch({
						type: "reversion",
						data: state.state,
					});
				}
			}
		};
	}, [ historyData, historyDispatch, mapDispatch ]);

	useEffect(() => {
		if(scrollRef.current && historyData.index === historyData.history.length - 1) {
			if(direction === "vertical") {
				scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
			} else {
				scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
			}
		}
	}, [ historyData, direction ]);

	useEffect(() => {
		if(!selectedState) return;

		const nextDeltaState = clone(selectedState);

		for(let y = 0; y < mapData.columns; y++) {
			for(let x = 0; x < mapData.rows; x++) {
				const currentData = mapData?.tiles?.[ y ]?.[ x ]?.data;
				const selectedData = selectedState?.tiles?.[ y ]?.[ x ]?.data;

				let nextData = currentData !== selectedData ? selectedData : null;
				if(selectedData == null && currentData != null) nextData = `VOID`;	// Handle eraser case, VOID is an arbitrary choice here
				nextDeltaState.tiles[ y ][ x ] = {
					x,
					y,
					data: nextData,
				};
			}
		}

		setDeltaState(nextDeltaState);
	}, [ selectedState ]);

	return (
		<div className={ `inline-flex flex-col items-start justify-center max-h-screen p-2 border border-solid rounded select-none border-neutral-200 bg-neutral-50 ${ isCollapsed ? "max-h-14" : "" }` }>
			<div className="flex items-center justify-between w-full">
				<button
					className="flex items-center justify-between w-full gap-2"
					onClick={ () => setIsCollapsed(!isCollapsed) }
				>
					<h2 className="text-lg text-gray-700">State History ({ historyData.history.length })</h2>
					{ isCollapsed ? <BsChevronRight /> : <BsChevronDown /> }
				</button>
			</div>
			{ !isCollapsed && (
				<div className={ `scrollbar-w-2 scrollbar-track-gray-200 scrollbar-thumb-gray-500 flex ${ direction === "vertical" ? "flex-col overflow-y-scroll  max-h-64 w-full" : "flex-row overflow-x-scroll  max-w-lg" } gap-1` } ref={ scrollRef }>
					{ historyData && historyData.history.map((state, index) => (
						<div
							key={ index }
							className={ `px-2 py-1 my-1 flex flex-row gap-1 rounded shadow cursor-pointer ${ historyData.index === index ? "bg-gray-200 hover:bg-gray-300" : "bg-white hover:bg-gray-100" }` }
							onClick={ handleClick(state, index) }
							onContextMenu={ handleClick(state, index) }
						>
							<div className="font-mono">{ index }:</div>
							<TileMapPreview key={ index } data={ { map: state.state, terrain: terrainData } } width={ 64 } height={ 64 } />
						</div>
					)) }
				</div>
			) }
			<Transition appear show={ isModalOpen } as={ Fragment }>
				<Dialog
					as="div"
					className="fixed inset-0 z-10 overflow-y-auto"
					onClose={ () => setIsModalOpen(false) }
				>
					<div className="min-h-screen px-4 text-center">
						<Transition.Child
							as={ Fragment }
							enter="ease-out duration-300"
							enterFrom="opacity-0"
							enterTo="opacity-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60" />
						</Transition.Child>

						<span
							className="inline-block h-screen align-middle"
							aria-hidden="true"
						>
							&#8203;
						</span>

						<Transition.Child
							as={ Fragment }
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<div className="inline-block w-full h-full max-w-6xl p-6 overflow-hidden overflow-y-auto text-left align-middle transition-all transform bg-white rounded shadow-xl">
								<Dialog.Title
									as="h3"
									className="mb-4 text-lg font-medium leading-6 text-center text-gray-90"
								>
									State Data #{ selectedIndex }
								</Dialog.Title>
								<div className="flex flex-col gap-2">
									<div className="flex flex-row items-center justify-center gap-4">
										<div className="flex flex-col items-center justify-center p-1 italic font-thin border border-solid rounded shadow-sm">
											<TileMapPreview data={ { map: mapData, terrain: terrainData } } />
											Current
										</div>
										<div className="flex flex-col items-center justify-center p-1 font-semibold border border-solid rounded shadow-md">
											<TileMapPreview data={ { map: selectedState, terrain: terrainData } } />
											Selected
										</div>
										<div className="flex flex-col items-center justify-center p-1 italic font-thin border border-solid rounded shadow-sm">
											{ deltaState && <TileMapPreview data={ { map: deltaState, terrain: terrainData } } /> }
											Delta
										</div>
									</div>
									<JsonViewer data={ selectedState } />
								</div>

								<div className="flex w-full gap-2 mt-4">
									<button
										type="button"
										className="flex justify-center flex-grow px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md basis-1/12 bg-sky-500 hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400"
										onClick={ () => {
											handleClick({ type: "map", state: selectedState }, selectedIndex)({ type: "modal" });
											setIsModalOpen(false);
										} }
									>
										Revert
									</button>
									<button
										type="button"
										className="flex justify-center flex-grow px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md basis-1/12 bg-violet-500 hover:bg-violet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-400"
										onClick={ () => {
											handleClick({ type: "map", state: selectedState }, selectedIndex, "cull")({ type: "modal" });
											setIsModalOpen(false);
										} }
									>
										Revert and Cull
									</button>
									<button
										type="button"
										className="flex justify-center flex-grow px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md basis-1/12 bg-rose-500 hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-400"
										onClick={ () => {
											handleClick({ type: "map", state: selectedState }, selectedIndex, "rebase")({ type: "modal" });
											setIsModalOpen(false);
										} }
									>
										Rebase
									</button>
									<button
										type="button"
										className="flex justify-center flex-grow px-4 py-2 text-sm font-medium text-white bg-gray-400 border border-transparent rounded-md basis-1/3 hover:bg-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300"
										onClick={ () => setIsModalOpen(false) }
									>
										Cancel
									</button>
								</div>

							</div>
						</Transition.Child>
					</div>
				</Dialog>
			</Transition>
		</div>
	);
}

export default StateHistory;