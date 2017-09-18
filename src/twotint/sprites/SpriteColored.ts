namespace pixi_color_transform {
	export class SpriteColored extends PIXI.Sprite {
		colorTransform = new ColorTransform();

		get _tintRGB() {
			this.colorTransform.updateTransform();
			return this.colorTransform.lightArgb & 0xffffff;
		}

		get tint() {
			return this.colorTransform.tintRgb;
		}

		set tint(value: number) {
			this.colorTransform.tintRgb = value;
		}
	}
}
