import { Worker } from "worker_threads";

export const NDimArray = {
	create: (dimensions, valueFunc = null) => {
		// Recursive function to create each dimension
		function createDim(dims, coord = []) {
			let dimension = dims[ 0 ];
			if(dims.length === 1) {
				// Base case: create the actual values
				return Array.from({ length: dimension }, (_, i) => {
					let coordinates = [ ...coord, i ];
					return valueFunc ? valueFunc(...coordinates) : undefined;
				});
			} else {
				// Recursive case: create a new dimension
				return Array.from({ length: dimension }, (_, i) =>
					createDim(dims.slice(1), [ ...coord, i ])
				);
			}
		}

		return createDim(dimensions);
	},
	createAsync: async (dimensions, valueFunc = null) => {
		// Recursive function to create each dimension
		async function createDimAsync(dims, coord = []) {
			let dimension = dims[ 0 ];
			if(dims.length === 1) {
				// Base case: create the actual values
				return Promise.all(Array.from({ length: dimension }, async (_, i) => {
					let coordinates = [ ...coord, i ];
					return valueFunc ? await valueFunc(...coordinates) : undefined;
				}));
			} else {
				// Recursive case: create a new dimension
				return Promise.all(Array.from({ length: dimension }, async (_, i) =>
					await createDimAsync(dims.slice(1), [ ...coord, i ])
				));
			}
		}

		return createDimAsync(dimensions);
	},
	//TODO: Create the worker file
	// createParallel: async (dimensions, valueFuncPath, workerData) => {
	// 	// Helper function to get total size of the array
	// 	function getTotalSize(dims) {
	// 		return dims.reduce((acc, curr) => acc * curr, 1);
	// 	}

	// 	// Create a pool of workers
	// 	const workerPool = [];
	// 	const numWorkers = os.cpus().length;
	// 	for(let i = 0; i < numWorkers; i++) {
	// 		workerPool.push(new Worker(valueFuncPath));
	// 	}

	// 	// Recursive function to create each dimension
	// 	async function createDimParallel(dims, coord = []) {
	// 		let dimension = dims[ 0 ];
	// 		if(dims.length === 1) {
	// 			// Base case: create the actual values
	// 			return Promise.all(Array.from({ length: dimension }, async (_, i) => {
	// 				let coordinates = [ ...coord, i ];
	// 				let worker = workerPool[ i % numWorkers ]; // Use worker from pool
	// 				return new Promise((resolve, reject) => {
	// 					worker.postMessage({
	// 						...workerData,
	// 						coordinates
	// 					});
	// 					worker.once("message", resolve); // Listen for a single response
	// 					worker.on("error", reject);
	// 				});
	// 			}));
	// 		} else {
	// 			// Recursive case: create a new dimension
	// 			return Promise.all(Array.from({ length: dimension }, async (_, i) =>
	// 				await createDimParallel(dims.slice(1), [ ...coord, i ])
	// 			));
	// 		}
	// 	}

	// 	// Create the array
	// 	let result = await createDimParallel(dimensions);

	// 	// Clean up workers
	// 	workerPool.forEach(worker => worker.terminate());

	// 	return result;
	// },
};

export default NDimArray;