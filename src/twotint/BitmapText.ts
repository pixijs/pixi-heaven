namespace pixi_heaven {
	export class BitmapText extends PIXI.BitmapText {
		constructor(text: string, style?: any) {
			super(text, style);
			if (!this.color) {
				this.color = new ColorTransform();
			}
		}

		color: ColorTransform;

		get tint() {
			return this.color ? this.color.tintBGR : 0xffffff;
		}

		set tint(value: number) {
			this.color && (this.color.tintBGR = value);
		}

		addChild(...additionalChildren: PIXI.DisplayObject[]): any {
			const child: Sprite = additionalChildren[0] as any;
			if (!child.color && (child as any).vertexData) {
				if (!this.color) {
					this.color = new ColorTransform();
				}
				child.color = this.color;
				child.pluginName = 'batchHeaven';
			}
			return super.addChild(child, ...additionalChildren);
		}

		_render(renderer: PIXI.Renderer) {
			this.color.alpha = this.worldAlpha;
			this.color.updateTransform();
		}
	}
}
