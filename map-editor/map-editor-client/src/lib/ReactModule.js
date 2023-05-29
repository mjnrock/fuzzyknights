import { useContext, useState, useEffect, createContext } from "react";

export function bindReact(module) {
	const Context = createContext();

	function Subscription({ network, children }) {
		const [ state, setState ] = useState(module.state);

		useEffect(() => {
			const fn = (next) => {
				setState(next);
			};

			module.addEffect(fn);

			return () => {
				module.removeEffect(fn);
			};
		}, []);

		const value = {
			network,
			module,
			state,
			dispatch: (...args) => module.dispatch(...args),
			emit: (...args) => module.emit(...args),
		};

		return (
			<Context.Provider value={ value }>
				{ children }
			</Context.Provider>
		);
	};

	function RenderProps({ network, children }) {
		const [ state, setState ] = useState(module.state);

		useEffect(() => {
			const fn = (next) => {
				setState(next);
			};

			module.addEffect(fn);

			return () => {
				module.removeEffect(fn);
			};
		}, []);

		const value = {
			network,
			module,
			state,
			dispatch: (...args) => module.dispatch(...args),
			emit: (...args) => module.emit(...args),
		};

		return children({ ...value });
	};

	function useModule() {
		return useContext(Context);
	};

	function useEventWatcher(event, fn) {
		useEffect(() => {
			module.addEventListener(event, fn);

			return () => {
				module.removeEventListener(event, fn);
			};
		}, []);
	};

	return {
		Context,
		Subscription,
		RenderProps,
		useModule,
		useEventWatcher,
	};
};

export default bindReact;