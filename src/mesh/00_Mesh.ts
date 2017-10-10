namespace pixi_heaven.mesh {
	const tempPoint = new PIXI.Point();
	const tempPolygon = new PIXI.Polygon();

	/**
	 * Base mesh class
	 * @class
	 * @extends PIXI.Container
	 * @memberof PIXI.mesh
	 */
	export class Mesh extends PIXI.Container {
		/**
		 * The texture of the Mesh
		 *
		 * @member {PIXI.Texture}
		 * @private
		 */
		_texture: PIXI.Texture;

		/**
		 * The Uvs of the Mesh
		 *
		 * @member {Float32Array}
		 */
		uvs: Float32Array;

		/**
		 * An array of vertices
		 *
		 * @member {Float32Array}
		 */
		vertices: Float32Array;

		/*
		 * @member {Uint16Array} An array containing the indices of the vertices
		 */
		indices: Uint16Array;

		/**
		 * The way the Mesh should be drawn, can be any of the {@link PIXI.mesh.Mesh.DRAW_MODES} consts
		 *
		 * @member {number}
		 * @see PIXI.mesh.Mesh.DRAW_MODES
		 */
		drawMode: number;

		/**
		 * Version of mesh uvs are dirty or not
		 *
		 * @member {number}
		 */
		dirty = 0;

		/**
		 * Version of mesh indices
		 *
		 * @member {number}
		 */
		indexDirty = 0;

		/**
		 * The blend mode to be applied to the mesh. Set to `PIXI.BLEND_MODES.NORMAL` to remove
		 * any blend mode.
		 *
		 * @member {number}
		 * @default PIXI.BLEND_MODES.NORMAL
		 * @see PIXI.BLEND_MODES
		 */
		blendMode = PIXI.BLEND_MODES.NORMAL;

		/**
		 * Triangles in canvas mode are automatically antialiased, use this value to force triangles
		 * to overlap a bit with each other.
		 *
		 * @member {number}
		 */
		canvasPadding = 0;

		/**
		 * The tint applied to the mesh. This is a [r,g,b] value. A value of [1,1,1] will remove any
		 * tint effect.
		 *
		 * @member {number}
		 */
		tintRgb = new Float32Array([1, 1, 1]);

		/**
		 * A map of renderer IDs to webgl render data
		 *
		 * @private
		 * @member {object<number, object>}
		 */
		_glDatas : {[key: number]: any} = {};

		/**
		 * whether or not upload uvTransform to shader
		 * if its false, then uvs should be pre-multiplied
		 * if you change it for generated mesh, please call 'refresh(true)'
		 * @member {boolean}
		 * @default false
		 */
		uploadUvTransform = false;

		/**
		 * Plugin that is responsible for rendering this element.
		 * Allows to customize the rendering process without overriding '_renderWebGL' & '_renderCanvas' methods.
		 * @member {string}
		 * @default 'mesh'
		 */
		pluginName = 'meshHeaven';

		/**
		 * transform that is applied to UV to get the texture coords
		 * its updated independently from texture uvTransform
		 * updates of uvs are tied to that thing
		 *
		 * @member {PIXI.extras.TextureTransform}
		 * @private
		 */
		_uvTransform: PIXI.extras.TextureTransform;

		/**
		 * @param {PIXI.Texture} texture - The texture to use
		 * @param {Float32Array} [vertices] - if you want to specify the vertices
		 * @param {Float32Array} [uvs] - if you want to specify the uvs
		 * @param {Uint16Array} [indices] - if you want to specify the indices
		 * @param {number} [drawMode] - the drawMode, can be any of the Mesh.DRAW_MODES consts
		 */
		constructor(texture: PIXI.Texture = PIXI.Texture.EMPTY, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array,
		            drawMode: number = PIXI.mesh.Mesh.DRAW_MODES.TRIANGLE_MESH) {
			super();
			this._texture = texture;

			if (!texture.baseTexture.hasLoaded) {
				texture.once('update', this._onTextureUpdate, this);
			}

			this.uvs = uvs || new Float32Array([
				0, 0,
				1, 0,
				1, 1,
				0, 1]);

			this.vertices = vertices || new Float32Array([
				0, 0,
				100, 0,
				100, 100,
				0, 100]);

			//  TODO auto generate this based on draw mode!
			this.indices = indices || new Uint16Array([0, 1, 3, 2]);

			this.drawMode = drawMode;

			/**
			 * transform that is applied to UV to get the texture coords
			 * its updated independently from texture uvTransform
			 * updates of uvs are tied to that thing
			 *
			 * @member {PIXI.extras.TextureTransform}
			 * @private
			 */
			this._uvTransform = new PIXI.extras.TextureTransform(texture, 0);
		}

		/**
		 * Updates the object transform for rendering
		 *
		 * @private
		 */
		updateTransform() {
			this.refresh();

			//TODO: move it somewhere, default heaven updateTransform
			this._boundsID++;

			this.transform.updateTransform(this.parent.transform);

			this.worldAlpha = this.alpha * this.parent.worldAlpha;
			if (this.color) {
				this.color.alpha = this.worldAlpha;
				this.color.updateTransform();
			}

			for (let i = 0, j = this.children.length; i < j; ++i)
			{
				const child = this.children[i];

				if (child.visible)
				{
					child.updateTransform();
				}
			}
		}

		/**
		 * Renders the object using the WebGL renderer
		 *
		 * @private
		 * @param {PIXI.WebGLRenderer} renderer - a reference to the WebGL renderer
		 */
		_renderWebGL(renderer: PIXI.WebGLRenderer) {
			renderer.setObjectRenderer(renderer.plugins[this.pluginName]);
			renderer.plugins[this.pluginName].render(this);
		}

		/**
		 * Renders the object using the Canvas renderer
		 *
		 * @private
		 * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
		 */
		_renderCanvas(renderer: PIXI.CanvasRenderer) {
			renderer.plugins['mesh'].render(this);
		}

		/**
		 * When the texture is updated, this event will fire to update the scale and frame
		 *
		 * @private
		 */
		_onTextureUpdate() {
			this._uvTransform.texture = this._texture;
			this.color.pma = this._texture.baseTexture.premultipliedAlpha;
			this.refresh();
		}

		/**
		 * multiplies uvs only if uploadUvTransform is false
		 * call it after you change uvs manually
		 * make sure that texture is valid
		 */
		multiplyUvs() {
			if (!this.uploadUvTransform) {
				(this._uvTransform as any).multiplyUvs(this.uvs);
			}
		}

		/**
		 * Refreshes uvs for generated meshes (rope, plane)
		 * sometimes refreshes vertices too
		 *
		 * @param {boolean} [forceUpdate=false] if true, matrices will be updated any case
		 */
		refresh(forceUpdate = false) {
			if (this._uvTransform.update(forceUpdate)) {
				this._refreshUvs();
			}
		}

		/**
		 * re-calculates mesh coords
		 * @protected
		 */
		_refreshUvs() {
			/* empty */
		}

		/**
		 * Returns the bounds of the mesh as a rectangle. The bounds calculation takes the worldTransform into account.
		 *
		 */
		_calculateBounds() {
			// TODO - we can cache local bounds and use them if they are dirty (like graphics)
			this._bounds.addVertices(this.transform as any, this.vertices as any, 0, this.vertices.length);
		}

		/**
		 * Tests if a point is inside this mesh. Works only for TRIANGLE_MESH
		 *
		 * @param {PIXI.Point} point - the point to test
		 * @return {boolean} the result of the test
		 */
		containsPoint(point: PIXI.PointLike) {
			if (!this.getBounds().contains(point.x, point.y)) {
				return false;
			}

			this.worldTransform.applyInverse(point as any, tempPoint);

			const vertices = this.vertices;
			const points = tempPolygon.points;
			const indices = this.indices;
			const len = this.indices.length;
			const step = this.drawMode === Mesh.DRAW_MODES.TRIANGLES ? 3 : 1;

			for (let i = 0; i + 2 < len; i += step) {
				const ind0 = indices[i] * 2;
				const ind1 = indices[i + 1] * 2;
				const ind2 = indices[i + 2] * 2;

				points[0] = vertices[ind0];
				points[1] = vertices[ind0 + 1];
				points[2] = vertices[ind1];
				points[3] = vertices[ind1 + 1];
				points[4] = vertices[ind2];
				points[5] = vertices[ind2 + 1];

				if (tempPolygon.contains(tempPoint.x, tempPoint.y)) {
					return true;
				}
			}

			return false;
		}

		/**
		 * The texture that the mesh uses.
		 *
		 * @member {PIXI.Texture}
		 */
		get texture() {
			return this._texture;
		}

		set texture(value) // eslint-disable-line require-jsdoc
		{
			if (this._texture === value) {
				return;
			}

			this._texture = value;

			if (value) {
				// wait for the texture to load
				if (value.baseTexture.hasLoaded) {
					this._onTextureUpdate();
				}
				else {
					value.once('update', this._onTextureUpdate, this);
				}
			}
		}

		color = new ColorTransform();

		/**
		 * The tint applied to the mesh. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
		 *
		 * @member {number}
		 * @default 0xFFFFFF
		 */
		get tint() {
			return this.color ? this.color.tintBGR : 0xffffff;
		}

		set tint(value: number) {
			this.color && (this.color.tintBGR = value);
		}

		static DRAW_MODES = PIXI.mesh.Mesh.DRAW_MODES;
	}
}
