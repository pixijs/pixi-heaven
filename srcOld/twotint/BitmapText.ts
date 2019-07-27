namespace pixi_heaven {
	export class BitmapText extends PIXI.extras.BitmapText {
		constructor(text: string, style?: PIXI.extras.BitmapTextStyle) {
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

		updateTransform() {
			this._boundsID++;

			this.transform.updateTransform(this.parent.transform);

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

		addChild(child: any, ...additionalChildren: PIXI.DisplayObject[]): any {
			if (!child.color && child.vertexData) {
				if (!this.color) {
					this.color = new ColorTransform();
				}
				child.color = this.color;
				child.pluginName = 'spriteHeaven';
			}
			return super.addChild(child, ...additionalChildren);
		}
	}
}