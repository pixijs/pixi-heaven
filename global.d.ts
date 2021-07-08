declare namespace GlobalMixins {
    interface Sprite {
        convertToHeaven(): import('pixi-heaven').SpriteHeaven;
    }

	export interface Container {
        convertToHeaven(): void;

        convertSubtreeToHeaven(): void;
	}

	export interface Spine {
        color: import('pixi-heaven').ColorTransform;
    }
}
