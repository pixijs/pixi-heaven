namespace pixi_heaven {
	export class Sprite extends PIXI.Sprite {
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
