import { Network } from "../lib/Network.js";

/**
 * Use dependency injection to provide a network context to all children,
 * alongside a registry of modules to be used by the network.  This is
 * meant to be a "render wrapper" for related modules and their respective
 * components.
 * @param {ReactContext} network
 * @param {{ name: module, ... }} registry
 * @returns 
 */
export function ViewPort({ network, registry = {}, children, ...props }) {
	const networkInstance = new Network({ modules: registry });

	return (
		<network.Provider value={ networkInstance }>
			<div className="flex items-center justify-center min-h-screen select-none bg-neutral-100" { ...props }>
				{ children({ network: networkInstance, registry }) }
			</div>
		</network.Provider>
	);
};