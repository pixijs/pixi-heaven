namespace pixi_heaven {
	import Texture = PIXI.Texture;
	import Rectangle = PIXI.Rectangle;

	//TODO: support resolution
	//TODO: support no-frame
	//TODO: support updates

	export class TextureRegion extends PIXI.Texture {
		uid = PIXI.utils.uid();

		proxied: Texture;
		entry: AtlasEntry;

		constructor(entry: AtlasEntry, texture: PIXI.Texture = new Texture(entry.baseTexture)) {
			super(entry.currentAtlas ? entry.currentAtlas.baseTexture : texture.baseTexture,
				entry.currentNode ? new Rectangle(texture.frame.x + entry.currentNode.rect.x,
					texture.frame.y + entry.currentNode.rect.y,
					texture.frame.width,
					texture.frame.height) : texture.frame.clone(),
				texture.orig,
				texture.trim,
				texture.rotate
			);
			this.proxied = texture;
			this.entry = entry;
		}

		updateFrame() {
			const texture = this.proxied;
			const entry = this.entry;
			const frame = this._frame;
			if (entry.currentNode) {
				this.baseTexture = entry.currentAtlas.baseTexture;
				frame.x = texture.frame.x + entry.currentNode.rect.x;
				frame.y = texture.frame.y + entry.currentNode.rect.y;
			} else {
				this.baseTexture = texture.baseTexture;
				frame.x = texture.frame.x;
				frame.y = texture.frame.y;
			}

			frame.width = texture.frame.width;
			frame.height = texture.frame.height;
			this._updateUvs();
		}
	}
}
