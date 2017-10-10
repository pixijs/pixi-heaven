module pixi_heaven {
	export class AtlasManager {
		/**
		 * A reference to the current renderer
		 *
		 * @member {PIXI.WebGLRenderer}
		 */
		renderer: PIXI.WebGLRenderer;

		/**
		 * The current WebGL rendering context
		 *
		 * @member {WebGLRenderingContext}
		 */
		gl: WebGLRenderingContext;

		constructor(renderer: PIXI.WebGLRenderer) {
			this.renderer = renderer;

			renderer.on('context', this.onContextChange);
		}

		onContextChange = (gl: WebGLRenderingContext) => {
			this.gl = gl;
			this.renderer.textureManager.updateTexture = this.updateTexture;
		};

		//TODO: make boundTextures faster?

		updateTexture = (texture_: PIXI.BaseTexture | PIXI.Texture, location?: number) => {
			const tm = this.renderer.textureManager;
			const gl = this.gl;
			const anyThis = this as any;

			const texture: any = (texture_ as any).baseTexture || texture_;
			const isRenderTexture = !!(texture as any)._glRenderTargets;

			if (!texture.hasLoaded) {
				return null;
			}

			const boundTextures: Array<PIXI.BaseTexture> = this.renderer.boundTextures as any;

			// if the location is undefined then this may have been called by n event.
			// this being the cas e the texture may already be bound to a slot. As a texture can only be bound once
			// we need to find its current location if it exists.
			if (location === undefined) {
				location = 0;

				// TODO maybe we can use texture bound ids later on...
				// check if texture is already bound..
				for (let i = 0; i < boundTextures.length; ++i) {
					if (boundTextures[i] === texture) {
						location = i;
						break;
					}
				}
			}

			boundTextures[location] = texture;

			gl.activeTexture(gl.TEXTURE0 + location);

			let glTexture = texture._glTextures[this.renderer.CONTEXT_UID];

			if (!glTexture) {
				if (isRenderTexture) {
					const renderTarget = new PIXI.RenderTarget(
						this.gl,
						texture.width,
						texture.height,
						texture.scaleMode,
						texture.resolution
					);

					renderTarget.resize(texture.width, texture.height);
					texture._glRenderTargets[this.renderer.CONTEXT_UID] = renderTarget;
					glTexture = renderTarget.texture;
				}
				else {
					glTexture = new PIXI.glCore.GLTexture(this.gl, null, null, null, null);
					glTexture.bind(location);
				}
				texture._glTextures[this.renderer.CONTEXT_UID] = glTexture;

				texture.on('update', tm.updateTexture, tm);
				texture.on('dispose', tm.destroyTexture, tm);
			} else if (isRenderTexture) {
				texture._glRenderTargets[this.renderer.CONTEXT_UID].resize(texture.width, texture.height);
			}

			glTexture.premultiplyAlpha = texture.premultipliedAlpha;

			if (!texture.resource) {
				glTexture.upload(texture.source);
			} else if (!texture.resource.onTextureUpload(this.renderer, texture, glTexture)) {
				glTexture.uploadData(null, texture.realWidth, texture.realHeight);
			}

			// lets only update what changes..
			if (texture.forceUploadStyle) {
				this.setStyle(texture, glTexture);
			}
			glTexture._updateID = texture._updateID;
			return glTexture;
		};

		setStyle(texture: PIXI.BaseTexture,
		         glTexture: PIXI.glCore.GLTexture) {
			const gl = this.gl;

			if ((texture as any).isPowerOfTwo) {
				if (texture.mipmap) {
					glTexture.enableMipmap();
				}

				if (texture.wrapMode === PIXI.WRAP_MODES.CLAMP) {
					glTexture.enableWrapClamp();
				}
				else if (texture.wrapMode === PIXI.WRAP_MODES.REPEAT) {
					glTexture.enableWrapRepeat();
				}
				else {
					glTexture.enableWrapMirrorRepeat();
				}
			}
			else {
				glTexture.enableWrapClamp();
			}

			if (texture.scaleMode === PIXI.SCALE_MODES.NEAREST) {
				glTexture.enableNearestScaling();
			}
			else {
				glTexture.enableLinearScaling();
			}
		}

		destroy() {
			this.renderer.off('context', this.onContextChange);
		}
	}

	PIXI.WebGLRenderer.registerPlugin('atlas', AtlasManager);
}
