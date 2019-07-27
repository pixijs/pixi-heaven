///<reference types="webgl-ext"/>

module pixi_heaven {
    export interface Extensions {
        depthTexture: WebGLDepthTexture;
        floatTexture: OESTextureFloat;
    }

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

		extensions: Extensions = null;

		constructor(renderer: PIXI.WebGLRenderer) {
			this.renderer = renderer;

			renderer.on('context', this.onContextChange);
		}

		onContextChange = (gl: WebGLRenderingContext) => {
			this.gl = gl;

			if (settings.TEXTURE_MANAGER) {
				this.renderer.textureManager.updateTexture = this.updateTexture;
				this.renderer.textureManager.destroyTexture = this.destroyTexture;
			}

			this.extensions = {
                depthTexture: gl.getExtension('WEBKIT_WEBGL_depth_texture'),
                floatTexture: gl.getExtension('OES_texture_float'),
			};
		};


		//TODO: make boundTextures faster?

		updateTexture = (texture_: PIXI.BaseTexture | PIXI.Texture, location?: number) => {
			const renderer = this.renderer;
			const tm = renderer.textureManager;
			const gl = this.gl;

			const texture: any = (texture_ as any).baseTexture || texture_;
			const isRenderTexture = !!texture._glRenderTargets;

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

					if (!renderer._activeRenderTarget.root)
					{
						renderer._activeRenderTarget.frameBuffer.bind();
					}
				}
				else {
					glTexture = new PIXI.glCore.GLTexture(this.gl, null, null, null, null);
					glTexture.bind(location);
				}
				texture._glTextures[this.renderer.CONTEXT_UID] = glTexture;

				texture.on('update', tm.updateTexture, tm);
				texture.on('dispose', tm.destroyTexture, tm);
			} else {
				glTexture.bind();

				if (isRenderTexture) {
					texture._glRenderTargets[this.renderer.CONTEXT_UID].resize(texture.width, texture.height);

					if (!renderer._activeRenderTarget.root)
					{
						renderer._activeRenderTarget.frameBuffer.bind();
					}
				}
			}

			glTexture.premultiplyAlpha = texture.premultipliedAlpha;

			if (!isRenderTexture) {
                if (!texture.resource) {
                    glTexture.upload(texture.source);
                } else if (!texture.resource.onTextureUpload(renderer, texture, glTexture)) {
                    glTexture.uploadData(null, texture.realWidth, texture.realHeight);
                }
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

		destroyTexture = (texture_: PIXI.BaseTexture | PIXI.Texture, skipRemove?: boolean) =>
		{
			let texture: any = (texture_ as any).baseTexture || texture_;

			if (!texture.hasLoaded)
			{
				return;
			}

			const renderer = this.renderer;
			const tm = renderer.textureManager as any;

			const uid = renderer.CONTEXT_UID;
			const glTextures = texture._glTextures;
			const glRenderTargets = texture._glRenderTargets;

			if (glTextures[uid])
			{
				renderer.unbindTexture(texture);

				glTextures[uid].destroy();
				texture.off('update', tm.updateTexture, tm);
				texture.off('dispose', tm.destroyTexture, tm);

				delete glTextures[uid];

				if (!skipRemove)
				{
					const i = tm._managedTextures.indexOf(texture);

					if (i !== -1)
					{
						PIXI.utils.removeItems(tm._managedTextures, i, 1);
					}
				}
			}

			if (glRenderTargets && glRenderTargets[uid])
			{
				if (renderer._activeRenderTarget === glRenderTargets[uid]) {
					renderer.bindRenderTarget((renderer as any).rootRenderTarget);
				}

				glRenderTargets[uid].destroy();
				delete glRenderTargets[uid];
			}
		}
	}

	PIXI.WebGLRenderer.registerPlugin('atlas', AtlasManager);
}
