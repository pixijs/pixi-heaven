namespace pixi_heaven {
	import sign = PIXI.utils.sign;

	export class Sprite extends PIXI.Sprite {
		color = new ColorTransform();
		maskMult: PIXI.Sprite = null;

		constructor(texture: PIXI.Texture) {
			super(texture);
			this.maskMult = null;
			this.pluginName = 'spriteHeaven';
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

			for (let i = 0, j = this.children.length; i < j; ++i)
			{
				const child = this.children[i];

				if (child.visible)
				{
					child.updateTransform();
				}
			}
		}

		_onTextureUpdate() {
			this._textureID = -1;
			this._textureTrimmedID = -1;
			this.cachedTint = 0xFFFFFF;
			this.color.pma = this._texture.baseTexture.premultipliedAlpha;

			// so if _width is 0 then width was not set..
			if (this._width) {
				this.scale.x = sign(this.scale.x) * this._width / this._texture.orig.width;
			}

			if (this._height) {
				this.scale.y = sign(this.scale.y) * this._height / this._texture.orig.height;
			}
		}
	}
}
