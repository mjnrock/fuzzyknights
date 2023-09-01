import Physics from "./Physics";
import Render from "./Render";
import State from "./State";
import Model from "./Model";

export default {
	Physics,
	Render,
	State,
	Model,

	Generators: {
		DemoEntity: ({ ...args } = {}) => ({
			[ Physics.Name ]: Physics.State(args?.[ Physics.Name ]),
			[ Render.Name ]: Render.State(args?.[ Render.Name ]),
			[ State.Name ]: State.State(args?.[ State.Name ]),
			[ Model.Name ]: Model.State(args?.[ Model.Name ]),
		}),
	},
};