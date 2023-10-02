import { IdentityClass } from "../../@node/Identity";

export class ViewPort extends IdentityClass {
	static LayoutType = {
		FLEX: `flex`,
		GRID: `grid`,
		LIST: `list`,
	};

	constructor ({ panes = [], $game, ...args } = {}) {
		super({
			$game,
			...args
		});

		this.layout = ViewPort.LayoutType.FLEX;
		this.panes = panes;
	}

	prepend(...panes) {
		this.panes.unshift(...panes);
	}
	append(...panes) {
		this.panes.push(...panes);
	}
	remove(...panes) {
		this.panes = this.panes.filter((pane) => !panes.includes(pane));
	}
	placeAt(index, ...panes) {
		this.panes.splice(index, 0, ...panes);
	}

	/**
	 * To make Observer find a bit easier, this function will return the @count number
	 * of Observers that the ViewPort has within its Views.  If @count is 1, then the
	 * Observer will be returned directly.  If @count is greater than 1, then an array
	 * of Observers will be returned.  For additional use cases, if @scopeArgs is provided,
	 * then the Observer's getScope function will be called with those arguments
	 * (i.e. get the scope of the Observers, rather than the Observers themselves).
	 * @param {int} count | default = 1
	 * @param  {...any} scopeArgs 
	 * @returns 
	 */
	getObservers(count = 1, ...scopeArgs) {
		const observers = this.panes.slice(0, count).map((pane) => pane.observer);

		if(observers.length === 1) {
			if(scopeArgs.length) {
				return observers[ 0 ].getScope(...scopeArgs);
			}

			return observers[ 0 ];
		} else {
			if(scopeArgs.length) {
				return observers.map((observer) => observer.getScope(...scopeArgs));
			}

			return observers;
		}
	}
};

export default ViewPort;