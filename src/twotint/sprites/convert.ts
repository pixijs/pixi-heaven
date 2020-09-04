declare module PIXI {
	interface Sprite {
		convertToHeaven(): pixi_heaven.Sprite;
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
		return this.color.tintBGR;
	}

	function tintSet(value: number) {
		this.color.tintBGR = value;
	}

	function tintRGBGet() {
		this.color.updateTransform();
		return this.color.lightRgba & 0xffffff;
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
		this._onTextureUpdate = Sprite.prototype._onTextureUpdate;
		this._render = Sprite.prototype._render;
		this._calculateBounds = Sprite.prototype._calculateBounds;
		this.calculateVertices = Sprite.prototype.calculateVertices;
		this._onTextureUpdate = Sprite.prototype._onTextureUpdate;
		this.calculateMaskVertices = Sprite.prototype.calculateMaskVertices;
		this.destroy = Sprite.prototype.destroy;
		this.color = new ColorTransform();
		this.pluginName = 'batchHeaven';

		if (this._texture.valid) {
			this._onTextureUpdate();
		} else {
			this._texture.off('update', this._onTextureUpdate);
			this._texture.on('update', this._onTextureUpdate, this);
		}
		return this;
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
