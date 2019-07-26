///<reference types="pixi-spine"/>
namespace pixi_heaven.spine {

	export class Spine extends PIXI.spine.Spine {
		hasSpriteMask: boolean = false;
		color = new ColorTransform();

		constructor(spineData: PIXI.spine.core.SkeletonData) {
			super(spineData);
		}

		newSprite(tex: PIXI.Texture): any {
			return new SpineSprite(tex, this);
		}

		newMesh(texture: PIXI.Texture, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array, drawMode?: number) {
			return new SpineMesh(texture, vertices, uvs, indices, drawMode, this) as any;
		}
	}

	export class SpineMesh extends mesh.Mesh {
		region: PIXI.spine.core.TextureRegion = null;
		spine: Spine;

		constructor(texture: PIXI.Texture, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array, drawMode?: number,
		            spine: Spine = null) {
			super(texture, vertices, uvs, indices, drawMode);
			this.spine = spine;
			this.pluginName = settings.SPINE_MESH_PLUGIN;
		}

		_renderWebGL(renderer: PIXI.WebGLRenderer) {
			if (this.maskSprite) {
				this.spine.hasSpriteMask = true;
			}
			if (this.spine.hasSpriteMask) {
				this.pluginName = 'spriteMasked';
			}
			super._renderWebGL(renderer);
		}
	}

	export class SpineSprite extends Sprite {
		region: PIXI.spine.core.TextureRegion = null;
		spine: Spine;

		constructor(tex: PIXI.Texture, spine: Spine) {
			super(tex);
			this.spine = spine;
		}

		_renderWebGL(renderer: PIXI.WebGLRenderer) {
			if (this.maskSprite) {
				this.spine.hasSpriteMask = true;
			}
			if (this.spine.hasSpriteMask) {
				this.pluginName = 'spriteMasked';
			}
			super._renderWebGL(renderer);
		}
	}
}
