namespace pixi_heaven {
	import sign = PIXI.utils.sign;

	const tempMat = new PIXI.Matrix();

	const defIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);

	export class Sprite extends PIXI.Sprite implements ITextureAnimationTarget {
		color = new ColorTransform();
		maskSprite: PIXI.Sprite = null;
		maskVertexData: Float32Array = null;
		uvs: Float32Array = null;
		indices: Uint16Array = defIndices;
		animState: AnimationState = null;

		constructor(texture: PIXI.Texture) {
			super(texture);
			this.pluginName = 'batchHeaven';
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

		_onTextureUpdate() {
			const thisAny = this as any;
			thisAny._textureID = -1;
			thisAny._textureTrimmedID = -1;

			const texture = thisAny._texture;
			if (texture.polygon) {
				this.uvs = texture.polygon.uvs;
				this.indices = texture.polygon.indices;
			} else {
				this.uvs = texture._uvs.uvsFloat32;
				this.indices = defIndices;
			}

			this._cachedTint = 0xFFFFFF;
			if (this.color) {
				this.color.pma = thisAny._texture.baseTexture.premultipliedAlpha;
			}

			// so if _width is 0 then width was not set..
			if (thisAny._width) {
				this.scale.x = sign(this.scale.x) * thisAny._width / thisAny._texture.orig.width;
			}

			if (thisAny._height) {
				this.scale.y = sign(this.scale.y) * thisAny._height / thisAny._texture.orig.height;
			}
		}

		_render(renderer: PIXI.Renderer) {
			this.color.alpha = this.worldAlpha;
			this.color.updateTransform();
			super._render(renderer);
		}

		_calculateBounds() {
			const thisAny = this as any;
			const polygon = (thisAny as any).polygon;
			const trim = thisAny.trim;
			const orig = thisAny.orig;

			// First lets check to see if the current texture has a trim..
			if (!polygon && (!trim || (trim.width === orig.width && trim.height === orig.height))) {
				// no trim! lets use the usual calculations..
				this.calculateVertices();
				this._bounds.addQuad(thisAny.vertexData as any);
			} else {
				// lets calculate a special trimmed bounds...
				this.calculateTrimmedVertices();
				this._bounds.addQuad(thisAny.vertexTrimmedData as any);
			}
		}

		calculateVertices() {
			const thisAny = this as any;
			const transform = this.transform as any;
			const texture = thisAny._texture as any;

			if (thisAny._transformID === transform._worldID && thisAny._textureID === texture._updateID) {
				return;
			}

			thisAny._transformID = transform._worldID;
			thisAny._textureID = texture._updateID;

			// set the vertex data

			const wt = this.transform.worldTransform;
			const a = wt.a;
			const b = wt.b;
			const c = wt.c;
			const d = wt.d;
			const tx = wt.tx;
			const ty = wt.ty;
			const anchor = thisAny._anchor as any;
			const orig = texture.orig;

			if (texture.polygon) {
				const vertices = texture.polygon.vertices;
				const n = vertices.length;

				if (thisAny.vertexData.length !== n) {
					thisAny.vertexData = new Float32Array(n);
				}

				const vertexData = thisAny.vertexData;

				const dx = -(anchor._x * orig.width);
				const dy = -(anchor._y * orig.height);

				for (let i = 0; i < n; i += 2) {
					const x = vertices[i] + dx;
					const y = vertices[i + 1] + dy;

					vertexData[i] = x * a + y * c + tx;
					vertexData[i + 1] = x * b + y * d + ty;
				}
			} else {
				const vertexData = thisAny.vertexData;
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
				} else {
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

		calculateMaskVertices() {
			//WE HAVE A MASK
			const maskSprite = this.maskSprite;
			const tex = maskSprite.texture;
			const orig = tex.orig;
			const anchor = maskSprite.anchor;

			if (!tex.valid) {
				return;
			}
			if (!tex.uvMatrix) {
				// margin = 0.0, let it bleed a bit, shader code becomes easier
				// assuming that atlas textures were made with 1-pixel padding
				tex.uvMatrix = new (PIXI as any).TextureMatrix(tex, 0.0);
			}
			tex.uvMatrix.update();

			//same operations as in SpriteMaskFilter
			maskSprite.transform.worldTransform.copyTo(tempMat);
			tempMat.invert();
			tempMat.scale(1.0 / orig.width, 1.0 / orig.height);
			tempMat.translate(anchor.x, anchor.y);
			tempMat.prepend(tex.uvMatrix.mapCoord);

			const vertexData = (this as any).vertexData;
			const n = vertexData.length;

			if (!this.maskVertexData || this.maskVertexData.length !== n) {
				this.maskVertexData = new Float32Array(n);
			}

			const maskVertexData = this.maskVertexData;

			for (let i = 0; i < n; i += 2) {
				maskVertexData[i] = vertexData[i] * tempMat.a + vertexData[i + 1] * tempMat.c + tempMat.tx;
				maskVertexData[i + 1] = vertexData[i] * tempMat.b + vertexData[i + 1] * tempMat.d + tempMat.ty;
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
