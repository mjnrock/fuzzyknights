import { useContext, useState, useEffect, createContext } from "react";

export function bindReact(module) {
	const Context = createContext();

	function useModule() {
		return useContext(Context);
	};

	function Provider({ children }) {
		const [ state, setState ] = useState(module.state);

		useEffect(() => {
			const fn = () => { setState(module.state); };

			module.addEffect(fn);

			return () => {
				module.removeEffect(fn);
			};
		}, []);

		const value = {
			state,
			dispatch: (...args) => module.dispatch(...args),
		};

		return (
			<Context.Provider value={ value }>
				{ children }
			</Context.Provider>
		);
	};

	function RenderProps({ children }) {
		const [ state, setState ] = useState(module.state);

		useEffect(() => {
			const fn = () => { setState(module.state); };

			module.addEffect(fn);

			return () => {
				module.removeEffect(fn);
			};
		}, []);

		return children({ state, dispatch: (...args) => module.dispatch(...args) });
	};

	return {
		Context,
		Provider,
		RenderProps,
		useModule,
	};
};

export default bindReact;