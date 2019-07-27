namespace pixi_heaven.mesh {
	import GroupD8 = PIXI.GroupD8;

	/**
	 * The Plane allows you to draw a texture across several points and them manipulate these points
	 *
	 *```js
	 * for (let i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
	 * let Plane = new PIXI.Plane(PIXI.Texture.fromImage("snake.png"), points);
	 *  ```
	 *
	 * @class
	 * @extends PIXI.mesh.Mesh
	 * @memberof PIXI.mesh
	 *
	 */
	export class Plane extends Mesh {
		_verticesX: number;
		_verticesY: number;
		_direction: number;
		_lastWidth: number;
		_lastHeight: number;
		_width: number;
		_height: number;

		/**
		 *  Version counter for verticesX/verticesY change
		 *
		 * @member {number}
		 * @private
		 */
		_dimensionsID = 0;

		_lastDimensionsID = -1;

		/**
		 *  Version counter for vertices updates
		 *
		 * @member {number}
		 * @private
		 */
		_verticesID = 0;

		_lastVerticesID = -1;

		/**
		 *  Version counter for uvs updates
		 *
		 * @member {number}
		 * @private
		 */
		_uvsID = 0;

		_lastUvsID = -1;

		_anchor: PIXI.ObservablePoint;

		/**
		 * reset the points on dimensions change
		 * @member {boolean}
		 * @default true
		 */
		autoResetVertices = true;

		calculatedVertices: Float32Array = null;

		/**
		 * @param {PIXI.Texture} texture - The texture to use on the Plane.
		 * @param {number} [verticesX=2] - The number of vertices in the x-axis
		 * @param {number} [verticesY=2] - The number of vertices in the y-axis
		 * @param {number} [direction=0] - Direction of the mesh. See {@link PIXI.GroupD8} for explanation
		 */
		constructor(texture: PIXI.Texture, verticesX: number = 2, verticesY: number = 2, direction = 0) {
			super(texture);

			this._verticesX = verticesX || 2;
			this._verticesY = verticesY || 2;

			this._direction = (direction || 0) & (~1);

			this._lastWidth = this._texture.orig.width;
			this._lastHeight = this._texture.orig.height;

			this._width = 0;
			this._height = 0;

			/**
			 * anchor for a plane
			 *
			 * @member {PIXI.ObservablePoint}
			 * @private
			 */
			this._anchor = new PIXI.ObservablePoint(this._onAnchorUpdate, this);

			this.drawMode = Mesh.DRAW_MODES.TRIANGLES;

			this.refresh();
		}

		/**
		 * The width of the sprite, setting this will actually modify the scale to achieve the value set
		 *
		 * @member {number}
		 */
		get verticesX() {
			return this._verticesX;
		}

		set verticesX(value) // eslint-disable-line require-jsdoc
		{
			if (this._verticesX === value) {
				return;
			}
			this._verticesX = value;
			this._dimensionsID++;
		}

		/**
		 * The height of the TilingSprite, setting this will actually modify the scale to achieve the value set
		 *
		 * @member {number}
		 */
		get verticesY() {
			return this._verticesY;
		}

		set verticesY(value) // eslint-disable-line require-jsdoc
		{
			if (this._verticesY === value) {
				return;
			}
			this._verticesY = value;
			this._dimensionsID++;
		}

		/**
		 * Direction of the mesh, see {@link PIXI.GroupD8} for explanation
		 *
		 * @param {number} [direction=0] - Direction of the mesh.
		 */
		get direction() {
			return this._direction;
		}

		set direction(value) // eslint-disable-line require-jsdoc
		{
			if (value % 2 !== 0) {
				throw new Error('plane does not support diamond shape yet');
			}

			if (this._direction === value) {
				return;
			}
			this._direction = value;
			this._verticesID++;
		}

		/**
		 * The width of the Plane, settings this wont modify the scale, but vertices will be cleared
		 *
		 * @member {number}
		 */
		get width() {
			return this._width || this.texture.orig.width;
		}

		set width(value) // eslint-disable-line require-jsdoc
		{
			if (this._width === value) {
				return;
			}
			this._width = value;
			this._verticesID++;
		}

		/**
		 * The height of the Plane, settings this wont modify the scale, but vertices will be cleared
		 *
		 * @member {number}
		 */
		get height() {
			return this._height || this.texture.orig.height;
		}

		set height(value) // eslint-disable-line require-jsdoc
		{
			if (this._height === value) {
				return;
			}
			this._height = value;
			this._verticesID++;
		}

		/**
		 * The anchor sets the origin point of the texture.
		 * The default is 0,0 this means the texture's origin is the top left
		 * Setting the anchor to 0.5,0.5 means the texture's origin is centered
		 * Setting the anchor to 1,1 would mean the texture's origin point will be the bottom right corner
		 *
		 * @member {PIXI.ObservablePoint}
		 */
		get anchor() {
			return this._anchor;
		}

		set anchor(value) // eslint-disable-line require-jsdoc
		{
			this._anchor.copy(value);
		}

		/**
		 * updates vertices after anchor changes
		 *
		 * @private
		 */
		_onAnchorUpdate() {
			this._verticesID++;
		}

		/**
		 * Call when you updated some parameters manually
		 */
		invalidateVertices() {
			this._verticesID++;
		}

		/**
		 * Call when you updated some parameters manually
		 */
		invalidateUvs() {
			this._uvsID++;
		}

		/**
		 * Call when you updated some parameters manually
		 */
		invalidate() {
			this._verticesID++;
			this._uvsID++;
		}

		/**
		 * Refreshes the plane mesh
		 *
		 * @param {boolean} [forceUpdate=false] if true, everything will be updated in any case
		 */
		refresh(forceUpdate = false) {
			this.refreshDimensions(forceUpdate);

			if (this._texture.noFrame) {
				return;
			}

			if (this._lastWidth !== this.width
				|| this._lastHeight !== this.height) {
				this._lastWidth = this.width;
				this._lastHeight = this.height;
				if (this.autoResetVertices) {
					this._verticesID++;
				}
			}

			if (this._uvTransform.update(forceUpdate)) {
				this._uvsID++;
			}

			if (this._uvsID !== this._lastUvsID) {
				this._refreshUvs();
			}

			this.refreshVertices();
		}

		/**
		 * Refreshes structure of the plane mesh
		 * when its done, refreshes vertices and uvs too
		 *
		 * @param {boolean} [forceUpdate=false] if true, dimensions will be updated any case
		 */
		refreshDimensions(forceUpdate = false) {
			// won't be overwritten, that's why there's no private method

			if (!forceUpdate && this._lastDimensionsID === this._dimensionsID) {
				return;
			}

			this._lastDimensionsID = this._dimensionsID;
			this._verticesID++;
			this._uvsID++;

			const total = this._verticesX * this._verticesY;

			const segmentsX = this._verticesX - 1;
			const segmentsY = this._verticesY - 1;

			const indices = [];
			const totalSub = segmentsX * segmentsY;

			for (let i = 0; i < totalSub; i++) {
				const xpos = i % segmentsX;
				const ypos = (i / segmentsX) | 0;

				const value = (ypos * this._verticesX) + xpos;
				const value2 = (ypos * this._verticesX) + xpos + 1;
				const value3 = ((ypos + 1) * this._verticesX) + xpos;
				const value4 = ((ypos + 1) * this._verticesX) + xpos + 1;

				indices.push(value, value2, value3);
				indices.push(value2, value4, value3);
			}
			this.indices = new Uint16Array(indices);
			this.uvs = new Float32Array(total * 2);
			this.vertices = new Float32Array(total * 2);
			this.calculatedVertices = new Float32Array(total * 2);

			this.indexDirty++;
			if (this.colors) {
				this.colors = new Uint32Array(total * 2);
				for (let i = 0; i < total; i++) {
					this.colors[i * 2] = 0;
					this.colors[i * 2 + 1] = 0xffffffff;
				}
			}
		}

		/**
		 * Refreshes plane vertices coords
		 * by default, makes them uniformly distributed
		 *
		 * @param {boolean} [forceUpdate=false] if true, vertices will be updated any case
		 */
		refreshVertices(forceUpdate = false) {
			const texture = this._texture;

			if (texture.noFrame) {
				return;
			}

			if (forceUpdate || this._lastVerticesID !== this._verticesID) {
				this._lastVerticesID = this._verticesID;
				this._refreshVertices();
			}
		}

		/**
		 * Refreshes plane UV coordinates
		 *
		 */
		_refreshUvs() {
			this._uvsID = this._lastUvsID;

			const total = this._verticesX * this._verticesY;
			const uvs = this.uvs;

			const direction = this._direction;

			const ux = GroupD8.uX(direction);
			const uy = GroupD8.uY(direction);
			const vx = GroupD8.vX(direction);
			const vy = GroupD8.vY(direction);

			const factorU = 1.0 / (this._verticesX - 1);
			const factorV = 1.0 / (this._verticesY - 1);

			for (let i = 0; i < total; i++) {
				let x = (i % this._verticesX);
				let y = ((i / this._verticesX) | 0);

				x = (x * factorU) - 0.5;
				y = (y * factorV) - 0.5;

				uvs[i * 2] = (ux * x) + (vx * y) + 0.5;
				uvs[(i * 2) + 1] = (uy * x) + (vy * y) + 0.5;
			}

			this.dirty++;

			this.multiplyUvs();
		}

		/**
		 * calculates supposed position of vertices
		 */
		calcVertices() {
			const total = this._verticesX * this._verticesY;
			const vertices = this.calculatedVertices;

			const width = this.width;
			const height = this.height;
			const direction = this._direction;

			let ux = GroupD8.uX(direction);
			let uy = GroupD8.uY(direction);
			let vx = GroupD8.vX(direction);
			let vy = GroupD8.vY(direction);

			const anchor = this._anchor as any;
			const offsetX = (0.5 * (1 - (ux + vx))) - anchor._x;
			const offsetY = (0.5 * (1 - (uy + vy))) - anchor._y;
			const factorU = 1.0 / (this._verticesX - 1);
			const factorV = 1.0 / (this._verticesY - 1);

			ux *= factorU;
			uy *= factorU;
			vx *= factorV;
			vy *= factorV;

			for (let i = 0; i < total; i++) {
				const x = (i % this._verticesX);
				const y = ((i / this._verticesX) | 0);

				vertices[i * 2] = ((ux * x) + (vx * y) + offsetX) * width;
				vertices[(i * 2) + 1] = ((uy * x) + (vy * y) + offsetY) * height;
			}
		}

		/**
		 * calculates colors (if enabled)
		 */
		calcColors() {
			/* nothing */
		}

		/**
		 * Refreshes vertices of Plane mesh
		 * by default, makes them uniformly distributed
		 *
		 * @private
		 */
		_refreshVertices() {
			this.calcVertices();

			const vertices = this.vertices;
			const calculatedVertices = this.calculatedVertices;
			const len = vertices.length;

			for (let i = 0; i < len; i++) {
				vertices[i] = calculatedVertices[i];
			}

			if (this.colors) {
				this.calcColors();
			}
		}

		/**
		 * resets everything to defaults
		 */
		reset() {
			if (!this.texture.noFrame) {
				this._refreshUvs();
				this.refreshVertices(true);
			}
		}
	}
}
