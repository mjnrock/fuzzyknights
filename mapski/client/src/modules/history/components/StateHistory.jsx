import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { useEffect, useRef, useCallback, useState } from "react";

export function StateHistory({ data, update, direction = "horizontal" }) {
	const { history } = data;
	const { mapDispatch, historyDispatch } = update;

	const [ isCollapsed, setIsCollapsed ] = useState(false);

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
		};
	}, [ history, historyDispatch ]);

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
                            onClick={ handleClick(state, index) }
                        >
                            <div className="font-mono">{ index }:</div>
                            <div className="w-full text-center">{ state.type }</div>
                        </div>
                    )) }
                </div>
            ) }
        </div>
    );
}

export default StateHistory;