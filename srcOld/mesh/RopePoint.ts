namespace pixi_heaven.mesh {
	/**
	 * The Rope Point object is a point with some info about normals
	 *
	 * @class
	 * @memberof PIXI.mesh
	 */
	export class RopePoint extends PIXI.Point {
		offset: number;
		scale: number;
		_color: ColorTransform;

		/**
		 * @param {number} [x=0] - position of the point on the x axis
		 * @param {number} [y=0] - position of the point on the y axis
		 * @param {number} [offset=0] - offsets the point by normal
		 * @param {number} [scale=1.0] - scales the point by normal
		 */
		constructor(x = 0, y = 0, offset = 0, scale = 1.0) {
			super(x, y);
			/**
			 * @member {number} position of the
			 * @default 0
			 */
			this.offset = offset;
			/**
			 * @member {number}
			 * @default 1.0
			 */
			this.scale = scale;

			/**
			 * Color transform
			 * @type {pixi_heaven.ColorTransform}
			 * @private
			 */
			this._color = null;
		}

		get color(): ColorTransform {
			if (this._color === null) {
				this._color = new ColorTransform();
			}

			return this._color;
		}

		set color(val: ColorTransform) {
			if (typeof val === "number") {
				this.color.tintBGR = val;
			} else {
				this.color = val;
			}
		}

		/**
		 * Creates a clone of this point
		 *
		 * @return {PIXI.RopePoint} a copy of the point
		 */
		clone() {
			return new RopePoint(this.x, this.y, this.offset, this.scale);
		}

		/**
		 * Copies everything from the given point
		 *
		 * @param {PIXI.Point | PIXI.RopePoint} p - The point to copy.
		 */
		copy(p: PIXI.Point | RopePoint) {
			this.set(p.x, p.y, (p as any).offset, (p as any).scale);
		}

		/**
		 * Sets the point to a new x and y position.
		 * If y is omitted, both x and y will be set to x.
		 *
		 * @param {number} [x=0] - position of the point on the x axis
		 * @param {number} [y=0] - position of the point on the y axis
		 * @param {number} [offset=0] - offsets the point by normal
		 * @param {number} [scale=1.0] - scales the point by normal
		 */
		set(x: number, y: number, offset?: number, scale?: number) {
			this.x = x || 0;
			this.y = y || ((y !== 0) ? this.x : 0);
			this.offset = offset || 0;
			this.scale = (scale !== undefined) ? scale : 1.0;
		}
	}
}
