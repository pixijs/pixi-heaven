namespace pixi_heaven {
	import sign = PIXI.utils.sign;

	const tempMat = new PIXI.Matrix();

	export class Sprite extends PIXI.Sprite {
		color = new ColorTransform();
		maskSprite: PIXI.Sprite = null;
		maskVertexData: Float32Array = null;

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

		calculateMaskVertices() {
			//WE HAVE A MASK
			const maskSprite = this.maskSprite;
			const tex = maskSprite.texture;
			const orig = tex.orig;
			const anchor = maskSprite.anchor;

			if (!tex.valid) {
				return;
			}
			if (!tex.transform) {
				// margin = 0.0, let it bleed a bit, shader code becomes easier
				// assuming that atlas textures were made with 1-pixel padding
				tex.transform = new (PIXI as any).TextureMatrix(tex, 0.0);
			}
			tex.transform.update();

			//same operations as in SpriteMaskFilter
			maskSprite.transform.worldTransform.copy(tempMat);
			tempMat.invert();
			tempMat.scale(1.0 / orig.width, 1.0 / orig.height);
			tempMat.translate(anchor.x, anchor.y);
			tempMat.prepend(tex.transform.mapCoord);

			if (!this.maskVertexData) {
				this.maskVertexData = new Float32Array(8);
			}

			const vertexData = this.vertexData;
			const maskVertexData = this.maskVertexData;

			for (let i = 0; i < 8; i += 2) {
				maskVertexData[i] = vertexData[i] * tempMat.a + vertexData[i + 1] * tempMat.c + tempMat.tx;
				maskVertexData[i + 1] = vertexData[i] * tempMat.b + vertexData[i + 1] * tempMat.d + tempMat.ty;
			}
		}
	}
}
