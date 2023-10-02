import { IdentityClass } from "../../../@node/Identity";
import { EnumModelType } from "../../nextMain";

export class Observer extends IdentityClass {
	constructor ({ zone, position, shape, subject, ...args } = {}) {
		super({ ...args });

		this.zone = zone;
		this.position = {
			x: 0,
			y: 0,
			...position,
		};
		this.shape = shape;
		this.subject = subject;
	}

	/**
	 * All 
	 */
	getScope(game) {
		if(this.subject) {
			this.position = this.subject(game) ?? this.position;
		}

		if(this.shape.type === EnumModelType.RECTANGLE) {
			const obj = {
				zone: this.zone,
				tx: this.position.x - (this.shape.width / 2),
				ty: this.position.y - (this.shape.height / 2),
				tw: this.shape.width,
				th: this.shape.height,
			};

			obj.px = obj.tx * game.config.tiles.width;
			obj.py = obj.ty * game.config.tiles.height;
			obj.pw = obj.tw * game.config.tiles.width;
			obj.ph = obj.th * game.config.tiles.height;

			/* Tile position checker, scoped to perception */
			obj.probe = ({ x, y }) => {
				if(x >= obj.tx && x <= (obj.tx + obj.tw) && y >= obj.ty && y <= (obj.ty + obj.th)) {
					return true;
				}
				return false;
			};

			/* Convenience array, if needed */
			obj.xywh = [ obj.tx, obj.ty, obj.tw, obj.th ];

			return obj;
		}
	}
};

export default Observer;