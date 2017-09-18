namespace pixi_heaven {
	import sign = PIXI.utils.sign;

	export class Sprite extends PIXI.Sprite {
		color = new ColorTransform();

		constructor(texture: PIXI.Texture) {
			super(texture);
			this.pluginName = 'spriteHeaven';
		}

		get _tintRGB() {
			this.color.updateTransform();
			return this.color.lightArgb & 0xffffff;
		}

		get tint() {
			return this.color.tintRgb;
		}

		set tint(value: number) {
			this.color.tintRgb = value;
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
