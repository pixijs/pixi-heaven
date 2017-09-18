namespace pixi_heaven {
	export class Sprite extends PIXI.Sprite {
		color = new ColorTransform();

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
	}
}
