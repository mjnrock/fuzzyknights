export const Helpers = {
	getStepDuration: (timer, step) => {
		const { cadence, duration } = timer;
		const { steps } = cadence;
		const { isRelative } = cadence;

		if(isRelative) {
			return steps[ step ] * duration;
		} else {
			return steps[ step ];
		}
	},
};

export const State = ({ cadence, duration = 1000 } = {}) => ({
	cadence,
	step: 0,
	elapsed: 0,
	isRunning: false,
	duration,
});

/**
 * The idea here is that the Timer "accummulates" time until it reaches the
 * duration of the current step. Then it increments the step and resets the
 * elapsed time; think of this as a "time capacitance machine".
 */
export const Reducers = ({ } = {}) => ({
	setCadence: (timer, cadence) => {
		const next = { ...timer };

		next.cadence = cadence;

		return next;
	},
	tick: (timer, dt) => {
		const next = { ...timer };

		next.elapsed += dt;

		const size = next.cadence.steps.length;
		let stepDuration = Helpers.getStepDuration(next, next.step);

		console.log(stepDuration)
		
		while(next.elapsed >= stepDuration) {
			next.elapsed -= stepDuration;
			next.step = (next.step + 1) % size;
			stepDuration = Helpers.getStepDuration(next, next.step);
		}

		return next;
	},
});

export default {
	State,
	Reducers,
	Helpers,
};