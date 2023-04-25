declare namespace GlobalMixins {
    interface Sprite {
        convertToHeaven(): import('pixi-heaven').SpriteH;
    }

	export interface Container {
        convertSubtreeToHeaven(): void;
	}

	export interface Spine {
        color: import('pixi-heaven').ColorTransform;
    }
}
