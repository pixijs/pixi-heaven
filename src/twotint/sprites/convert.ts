declare module PIXI {
	interface Sprite {
		convertToHeaven(): void;
	}

	interface Mesh {
		convertToHeaven(): void;
	}

	interface Graphics {
		convertToHeaven(): void;
	}

	interface Container {
		convertToHeaven(): void;

		convertSubtreeToHeaven(): void;
	}

	// TODO: ParticleContainer?
}

namespace pixi_heaven {
	(PIXI as any).Container.prototype.convertToHeaven = function () {
	};

	function tintGet() {
		return this.color.tintRgb;
	}

	function tintSet(value: number) {
		this.color.tintRgb = value;
	}

	function tintRGBGet() {
		this.color.updateTransform();
		return this.color.lightArgb & 0xffffff;
	}

	(PIXI as any).Sprite.prototype.convertToHeaven = function () {
		if (this.color) {
			return;
		}

		Object.defineProperty(this, "tint", {
			get: tintGet,
			set: tintSet,
			enumerable: true,
			configurable: true
		});
		Object.defineProperty(this, "_tintRGB", {
			get: tintRGBGet,
			enumerable: true,
			configurable: true
		});
		this.pluginName = 'spriteHeaven';
		this._onTextureUpdate = Sprite.prototype._onTextureUpdate;
		this.color = new ColorTransform();
	};

	(PIXI as any).Container.prototype.convertSubtreeToHeaven = function () {
		if (this.convertToHeaven) {
			this.convertToHeaven();
		}
		for (let i = 0; i < this.children.length; i++) {
			this.children[i].convertSubtreeToHeaven();
		}
	};
}
