export const State = ({ steps = [], isRelative = true } = {}) => ({
	steps,
	isRelative,
	period: steps.reduce((acc, step) => acc + step, 0),
});

export const Reducers = ({ } = {}) => ({
	addStep: (cadence, step) => {
		const next = { ...cadence };

		next.steps.push(step);
		next.period += step;

		return next;
	},
	setSteps: (cadence, steps) => {
		const next = { ...cadence };

		next.steps = steps;
		next.period = steps.reduce((acc, step) => acc + step, 0);

		return next;
	},
});

export default {
	State,
	Reducers,
};