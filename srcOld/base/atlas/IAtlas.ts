namespace pixi_heaven {
	import BaseTexture = PIXI.BaseTexture;
	import Texture = PIXI.Texture;
	import WebGLRenderer = PIXI.WebGLRenderer;

	export class AtlasEntry {
		baseTexture: BaseTexture;
		atlas: IAtlas;
		currentNode: AtlasNode<AtlasEntry>;
		currentAtlas: SuperAtlas;
		width: number;
		height: number;

		nodeUpdateID: number = 0;

		regions: Array<TextureRegion> = [];

		constructor(atlas: IAtlas, baseTexture: BaseTexture) {
			this.baseTexture = baseTexture;
			this.width = baseTexture.width;
			this.height = baseTexture.height;
			this.atlas = atlas;
		}
	}

	export interface IRepackResult {
		// goodMap: { [key: string]: AtlasNode<AtlasEntry> };
		failed: Array<AtlasEntry>;

		apply(): void;
	}

	export interface IAtlas {
		add(texture: BaseTexture | Texture, swapCache ?: boolean): TextureRegion;

		addHash(textures: { [key: string]: Texture }, swapCache ?: boolean): { [key: string]: TextureRegion };

		repack(): IRepackResult;

		prepare(renderer: WebGLRenderer): Promise<void>;
	}
}
