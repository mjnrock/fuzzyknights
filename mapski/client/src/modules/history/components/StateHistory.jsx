import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { useEffect, useRef, useCallback, useState, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';

export function StateHistory({ data, update, direction = "horizontal" }) {
	const { history } = data;
	const { mapDispatch, historyDispatch } = update;

	const [ isCollapsed, setIsCollapsed ] = useState(false);
	const [ isModalOpen, setIsModalOpen ] = useState(false);
	const [ selectedState, setSelectedState ] = useState(null);

	const scrollRef = useRef(null);

	const handleClick = useCallback((state, index) => {
		return (event) => {
			if(event.ctrlKey) {
				let currentHistoryIndex = history.index || 0;
				let currentHistory = history.history || [];

				if(currentHistoryIndex !== currentHistory.length - 1) {
					currentHistory = currentHistory.slice(0, currentHistoryIndex + 1);
					historyDispatch({
						type: "set",
						data: {
							history: currentHistory,
							index: currentHistoryIndex,
						},
					});
				}
			}

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

			// Double click logic
			if(event.type === 'dblclick') {
				setSelectedState(state.state);
				setIsModalOpen(true);
			}
		};
	}, [ history, historyDispatch, mapDispatch ]);

	useEffect(() => {
		if(scrollRef.current) {
			if(direction === "vertical") {
				scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
			} else {
				scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
			}
		}
	}, [ history, direction ]);

	return (
		<div className={ `inline-flex flex-col items-start justify-center max-h-screen p-2 border border-solid rounded select-none border-neutral-200 bg-neutral-50 ${ isCollapsed ? "max-h-14" : "" }` }>
			<div className="flex items-center justify-between w-full">
				<button
					className="flex items-center justify-between w-full gap-2"
					onClick={ () => setIsCollapsed(!isCollapsed) }
				>
					<h2 className="text-lg text-gray-700">State History</h2>
					{ isCollapsed ? <BsChevronRight /> : <BsChevronDown /> }
				</button>
			</div>
			{ !isCollapsed && (
				<div className={ `flex ${ direction === "vertical" ? "flex-col overflow-y-auto max-h-64 w-full" : "flex-row overflow-x-auto max-w-lg" } gap-1` } ref={ scrollRef }>
					{ history && history.history.map((state, index) => (
						<div
							key={ index }
							className={ `px-2 py-1 my-1 flex flex-row gap-1 rounded shadow cursor-pointer ${ history.index === index ? "bg-gray-200 hover:bg-gray-300" : "bg-white hover:bg-gray-100" }` }
							onDoubleClick={ handleClick(state, index) }
						>
							<div className="font-mono">{ index }:</div>
							<div className="w-full text-center">{ state.type }</div>
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
							<Dialog.Overlay className="fixed inset-0" />
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
							<div className="inline-block w-full h-full p-6 overflow-hidden overflow-y-auto text-left align-middle transition-all transform bg-white shadow-xl max-w-none rounded-2xl">
								<Dialog.Title
									as="h3"
									className="text-lg font-medium leading-6 text-gray-900"
								>
									State Data
								</Dialog.Title>
								<div className="mt-2">
									<pre className="overflow-x-auto text-xs">
										{ JSON.stringify(selectedState, null, 2) }
									</pre>
								</div>
								<div className="mt-4">
									<button
										type="button"
										className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
										onClick={ () => setIsModalOpen(false) }
									>
										Close
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