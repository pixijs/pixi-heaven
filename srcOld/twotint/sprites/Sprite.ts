namespace pixi_heaven {
	import sign = PIXI.utils.sign;

	const tempMat = new PIXI.Matrix();

	export class Sprite extends PIXI.Sprite implements ITextureAnimationTarget {
		color = new ColorTransform();
		maskSprite: PIXI.Sprite = null;
		maskVertexData: Float32Array = null;
		uvs: Float32Array = null;
		indices: Uint16Array = null;
		animState: AnimationState = null;

		constructor(texture: PIXI.Texture) {
			super(texture);
			this.pluginName = 'spriteHeaven';
			if (this.texture.valid) this._onTextureUpdate();
		}

		get _tintRGB() {
			this.color.updateTransform();
			return this.color.lightRgba & 0xffffff;
		}

		set _tintRGB(value: number) {
			//nothing
		}

		get tint() {
			return this.color ? this.color.tintBGR : 0xffffff;
		}

		set tint(value: number) {
			this.color && (this.color.tintBGR = value);
		}

		updateTransform() {
			this._boundsID++;

			this.transform.updateTransform(this.parent.transform);

			// TODO: check render flags, how to process stuff here
			this.worldAlpha = this.alpha * this.parent.worldAlpha;
			if (this.color) {
				this.color.alpha = this.worldAlpha;
				this.color.updateTransform();
			}

			for (let i = 0, j = this.children.length; i < j; ++i) {
				const child = this.children[i];

				if (child.visible) {
					child.updateTransform();
				}
			}
		}

		_onTextureUpdate() {
			this._textureID = -1;
			this._textureTrimmedID = -1;
			this.cachedTint = 0xFFFFFF;
			if (this.color) {
				this.color.pma = this._texture.baseTexture.premultipliedAlpha;
			}

			// so if _width is 0 then width was not set..
			if (this._width) {
				this.scale.x = sign(this.scale.x) * this._width / this._texture.orig.width;
			}

			if (this._height) {
				this.scale.y = sign(this.scale.y) * this._height / this._texture.orig.height;
			}
		}

		_calculateBounds()
		{
			const polygon = (this._texture as any).polygon;
			const trim = this._texture.trim;
			const orig = this._texture.orig;

			// First lets check to see if the current texture has a trim..
			if (!polygon && (!trim || (trim.width === orig.width && trim.height === orig.height)))
			{
				// no trim! lets use the usual calculations..
				this.calculateVertices();
				this._bounds.addQuad(this.vertexData as any);
			}
			else
			{
				// lets calculate a special trimmed bounds...
				this.calculateTrimmedVertices();
				this._bounds.addQuad(this.vertexTrimmedData as any);
			}
		}

		calculateVertices() {
			const transform = this.transform as any;
			const texture = this._texture as any;

			if (this._transformID === transform._worldID && this._textureID === texture._updateID) {
				return;
			}

			this._transformID = transform._worldID;
			this._textureID = texture._updateID;

			// set the vertex data

			const wt = this.transform.worldTransform;
			const a = wt.a;
			const b = wt.b;
			const c = wt.c;
			const d = wt.d;
			const tx = wt.tx;
			const ty = wt.ty;
			const anchor = this._anchor as any;
			const orig = texture.orig;

			if (texture.polygon) {
				this.uvs = texture.polygon.uvs;
				this.indices = texture.polygon.indices;

				const vertices = texture.polygon.vertices;
				const n = vertices.length;

				if (this.vertexData.length !== n) {
					this.vertexData = new Float32Array(n);
				}

				const vertexData = this.vertexData;

				const dx = -(anchor._x * orig.width);
				const dy = -(anchor._y * orig.height);

				for (let i = 0; i < n; i += 2) {
					const x = vertices[i] + dx;
					const y = vertices[i + 1] + dy;

					vertexData[i] = x * a + y * c + tx;
					vertexData[i + 1] = x * b + y * d + ty;
				}
			} else {
				const vertexData = this.vertexData;
				const trim = texture.trim;

				let w0 = 0;
				let w1 = 0;
				let h0 = 0;
				let h1 = 0;

				if (trim) {
					// if the sprite is trimmed and is not a tilingsprite then we need to add the extra
					// space before transforming the sprite coords.
					w1 = trim.x - (anchor._x * orig.width);
					w0 = w1 + trim.width;

					h1 = trim.y - (anchor._y * orig.height);
					h0 = h1 + trim.height;
				}
				else {
					w1 = -anchor._x * orig.width;
					w0 = w1 + orig.width;

					h1 = -anchor._y * orig.height;
					h0 = h1 + orig.height;
				}

				// xy
				vertexData[0] = (a * w1) + (c * h1) + tx;
				vertexData[1] = (d * h1) + (b * w1) + ty;

				// xy
				vertexData[2] = (a * w0) + (c * h1) + tx;
				vertexData[3] = (d * h1) + (b * w0) + ty;

				// xy
				vertexData[4] = (a * w0) + (c * h0) + tx;
				vertexData[5] = (d * h0) + (b * w0) + ty;

				// xy
				vertexData[6] = (a * w1) + (c * h0) + tx;
				vertexData[7] = (d * h0) + (b * w1) + ty;
			}
		}

		destroy(options?: any) {
			if (this.animState) {
				this.animState.stop();
				this.animState = null;
			}
			super.destroy(options);
		}
	}
}
