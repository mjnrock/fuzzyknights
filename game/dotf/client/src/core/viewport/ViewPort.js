import Identity from "../../@node/Identity";

export const Helpers = ({ $game } = {}) => ({
	getZoneDetail: (viewport) => {
		// first, get the current zone
		const { current, views } = viewport;
		const zone = current.observer.zone;
		const pane = views[ 0 ].panes[ 0 ];

		// using $game, get the tile boundaries of the zone.  pane x,y,width,height are in pixels, so we need to convert to tiles and offsets
		const scale = $game.config.scale;
		const tileWidth = $game.config.tiles.width;
		const tileHeight = $game.config.tiles.height;

		// get the tx,ty coordinates of the pane
		const tx0 = Math.floor(pane.x / (tileWidth * scale));
		const ty0 = Math.floor(pane.y / (tileHeight * scale));
		const tx1 = Math.floor((pane.x + pane.width) / (tileWidth * scale));
		const ty1 = Math.floor((pane.y + pane.height) / (tileHeight * scale));

		console.log(pane)
		console.log(scale, tileWidth, tileHeight)

		return {
			zone,

			// pixels
			px0: pane.x,
			py0: pane.y,
			px1: pane.x + pane.width,
			py1: pane.y + pane.height,

			// tiles
			tx0: tx0,
			ty0: ty0,
			tx1: tx1,
			ty1: ty1,
		};
	},
});

export const Reducers = ({ $game } = {}) => ({
	merge: (state, viewport) => ({ ...state, ...viewport }),
	setCurrent: (state, current) => ({ ...state, current }),
	setViews: (state, views) => ({ ...state, views }),
	setAsView: (state, view) => ({ ...state, views: [ view ], current: view }),
});
export const ViewPort = ({ views = [], ...args } = {}) => Identity.Identity.Next({
	current: Object.keys(views).length ? Object.keys(views)[ 0 ] : null,
	views,
	...args,
});

export default {
	Helpers,
	Reducers,
	State: ViewPort,
};