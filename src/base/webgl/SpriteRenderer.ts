declare module PIXI {
	export interface ObjectRenderer {
		renderer: WebGLRenderer;
	}

	export interface BaseTexture {
		_virtalBoundId: number;
	}
}

namespace pixi_heaven.webgl {
	import BaseTexture = PIXI.BaseTexture;
	import ObjectRenderer = PIXI.ObjectRenderer;
	import settings = PIXI.settings;
	import GLBuffer = PIXI.glCore.GLBuffer;
	import VertexArrayObject = PIXI.glCore.VertexArrayObject;

	import WebGLRenderer = PIXI.WebGLRenderer;
	import Sprite = PIXI.Sprite;

	import premultiplyBlendMode = PIXI.utils.premultiplyBlendMode;

	let TICK = 1 << 20;

	export class BatchGroup {
		textures: Array<BaseTexture> = [];
		textureCount = 0;
		ids: Array<Number> = [];
		size = 0;
		start = 0;
		blend = PIXI.BLEND_MODES.NORMAL;
		uniforms: any = null;
	}

	export abstract class MultiTextureSpriteRenderer extends ObjectRenderer {
		shaderVert = '';
		shaderFrag = '';
		MAX_TEXTURES_LOCAL = 32;

		abstract createVao(vertexBuffer: GLBuffer): PIXI.glCore.VertexArrayObject;

		abstract fillVertices(float32View: Float32Array, uint32View: Uint32Array,
		                      index: number, sprite: any, textureId: number): void;

		getUniforms(spr: PIXI.Sprite): any {
			return null;
		}

		syncUniforms(obj: any) {
			if (!obj) return;
			let sh = this.shader;
			for (let key in obj) {
				sh.uniforms[key] = obj[key];
			}
		}

		vertSize = 5;
		vertByteSize = this.vertSize * 4;
		size = settings.SPRITE_BATCH_SIZE;
		buffers: Array<BatchBuffer>;
		buffersIndex: Array<Uint16Array>;

		bigMeshVertexBuffer: BatchBuffer = null;

		indices: Uint16Array;

		shader: PIXI.Shader;

		currentIndex = 0;
		groups: Array<BatchGroup>;
		sprites: Array<any> = [];

		countVertex = 0;
		countIndex = 0;

		indexBuffer: GLBuffer;
		vertexBuffers: Array<GLBuffer> = [];
		indexBuffers: Array<GLBuffer> = [];

		vaos: Array<VertexArrayObject> = [];
		vao: VertexArrayObject;
		vaoMax = 2;
		vertexCount = 0;

		MAX_TEXTURES = 1;
		changedIndexBuffer = 0;

		/**
		 * @param {PIXI.WebGLRenderer} renderer - The renderer this sprite batch works for.
		 */
		constructor(renderer: WebGLRenderer) {
			super(renderer);

			this.indices = utils.createIndicesForQuads(this.size);

			this.groups = [];
			for (let k = 0; k < this.size; k++) {
				this.groups[k] = new BatchGroup();
			}

			this.vaoMax = 2;
			this.vertexCount = 0;

			this.renderer.on('prerender', this.onPrerender, this);
		}

		genShader(){
			const gl = this.renderer.gl;

			this.MAX_TEXTURES = Math.min(this.MAX_TEXTURES_LOCAL, this.renderer.plugins['sprite'].MAX_TEXTURES);

			this.shader = generateMultiTextureShader(this.shaderVert, this.shaderFrag, gl, this.MAX_TEXTURES);
		}

		/**
		 * Sets up the renderer context and necessary buffers.
		 *
		 * @private
		 */
		onContextChange() {
			const gl = this.renderer.gl;
			// generate generateMultiTextureProgram, may be a better move?
			this.genShader();

			// we use the second shader as the first one depending on your browser may omit aTextureId
			// as it is not used by the shader so is optimized out.
			this.renderer.bindVao(null);

			this.indexBuffer = GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);

			for (let i = 0; i < this.vaoMax; i++) {
				/* eslint-disable max-len */
				const vertexBuffer = this.vertexBuffers[i] = GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
				/* eslint-enable max-len */

				// build the vao object that will render..
				this.vaos[i] = this.createVao(vertexBuffer);
				this.indexBuffers[i] = GLBuffer.createIndexBuffer(gl, null, gl.STREAM_DRAW);
			}

			if (!this.buffers) {
				this.buffers = [];
				this.buffersIndex = [];
				for (let i = 1; i <= utils.nextPow2(this.size); i *= 2) {
					this.buffers.push(new BatchBuffer(i * 4 * this.vertByteSize));
				}
				for (let i = 1; i <= utils.nextPow2(this.size); i *= 2) {
					this.buffersIndex.push(new Uint16Array(i * 6));
				}
			}

			this.vao = this.vaos[0];
		}

		/**
		 * Called before the renderer starts rendering.
		 *
		 */
		onPrerender() {
			this.vertexCount = 0;
		}

		/**
		 * Renders the sprite object.
		 *
		 * @param {PIXI.Sprite} sprite - the sprite to render when using this spritebatch
		 */
		render(element: any) {
			// if the uvs have not updated then no point rendering just yet!
			if (!element._texture._uvs) {
				return;
			}
			if (!element._texture.baseTexture) {
				//WTF, Rpgmaker MV?
				return;
			}

			let countVertex = 4;
			let countIndex = 6;

			if (element.vertices) {
				//mesh !
				countVertex = element.vertices.length / 2;
				countIndex = element.indices.length;

				element.calculateVertices();
			}
			// TODO set blend modes..
			// check texture..
			if (this.currentIndex >= this.size ||
				countVertex + this.countVertex > this.size * 4 ||
				countIndex + this.countIndex > this.size * 6) {
				this.flush();
			}

			if (countVertex > this.size * 4 ||
				countIndex > this.size * 6) {
				this.renderSingleMesh(element);
				return;
			}

			this.countVertex += countVertex;
			this.countIndex += countIndex;

			// push a texture.
			// increment the batchsize
			this.sprites[this.currentIndex++] = element;
		}

		renderSingleMesh(mesh: mesh.Mesh) {
			const renderer = this.renderer;
			const gl = renderer.gl;

			this.renderer.state.setBlendMode(
				premultiplyBlendMode[mesh._texture.baseTexture.premultipliedAlpha ? 1 : 0][mesh.blendMode]
			);

			const textureId = this.renderer.bindTexture(mesh._texture.baseTexture);

			const curVertexCount = this.vertexCount;
			const isNewBuffer = this.checkVaoMax();

			if (!this.bigMeshVertexBuffer ||
				this.bigMeshVertexBuffer.vertices.byteLength < this.vertByteSize * mesh.vertices.length) {
				this.bigMeshVertexBuffer = new BatchBuffer(this.vertByteSize * mesh.vertices.length);
			}

			mesh.calculateVertices();
			this.fillVertices(this.bigMeshVertexBuffer.float32View, this.bigMeshVertexBuffer.uint32View,
				0, mesh, textureId);

			this.vertexBuffers[curVertexCount].upload(this.bigMeshVertexBuffer.vertices, 0, !isNewBuffer);
			this.indexBuffers[curVertexCount].upload(mesh.indices, 0, false);

			gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
		}

		checkVaoMax() {
			if (settings.CAN_UPLOAD_SAME_BUFFER) {
				return false;
			}

			const renderer = this.renderer;
			const gl = renderer.gl;

			// this is still needed for IOS performance..
			// it really does not like uploading to the same buffer in a single frame!
			if (this.vaoMax <= this.vertexCount) {
				this.vaoMax++;

				/* eslint-disable max-len */
				const vertexBuffer = this.vertexBuffers[this.vertexCount] = GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
				this.vaos[this.vertexCount] = this.createVao(vertexBuffer);
				this.indexBuffers[this.vertexCount] = GLBuffer.createIndexBuffer(gl, null, gl.STREAM_DRAW);
				/* eslint-enable max-len */

				this.vertexCount++;
			} else {
				renderer.bindVao(this.vaos[this.vertexCount]);
			}

			return true;
		}

		/**
		 * Renders the content and empties the current batch.
		 *
		 */
		flush() {
			if (this.currentIndex === 0) {
				return;
			}

			const gl = this.renderer.gl;
			const MAX_TEXTURES = this.MAX_TEXTURES;

			let np2 = utils.nextPow2(Math.ceil((this.countVertex + 3) / 4));
			let log2 = utils.log2(np2);
			const buffer = this.buffers[log2];

			np2 = utils.nextPow2(Math.ceil((this.countIndex + 5) / 6));
			log2 = utils.log2(np2);
			const bufferIndex = this.buffersIndex[log2];

			const sprites = this.sprites;
			const groups = this.groups;

			const float32View = buffer.float32View;
			const uint32View = buffer.uint32View;

			// const touch = 0;// this.renderer.textureGC.count;

			let nextTexture: any;
			let currentTexture: BaseTexture;
			let currentUniforms: any = null;
			let groupCount = 1;
			let textureCount = 0;
			let currentGroup = groups[0];
			let blendMode = premultiplyBlendMode[
				(sprites[0] as any)._texture.baseTexture.premultipliedAlpha ? 1 : 0][sprites[0].blendMode];
			let hasMesh = false;

			currentGroup.textureCount = 0;
			currentGroup.start = 0;
			currentGroup.blend = blendMode;

			TICK++;

			let i;
			let posVertex = 0;
			let posIndex = 0;

			for (i = 0; i < this.currentIndex; ++i) {
				// upload the sprite elemetns...
				// they have all ready been calculated so we just need to push them into the buffer.

				// upload the sprite elemetns...
				// they have all ready been calculated so we just need to push them into the buffer.
				const sprite = sprites[i] as any;

				nextTexture = sprite._texture.baseTexture;

				const spriteBlendMode = premultiplyBlendMode[Number(nextTexture.premultipliedAlpha)][sprite.blendMode];

				if (blendMode !== spriteBlendMode) {
					// finish a group..
					blendMode = spriteBlendMode;

					// force the batch to break!
					currentTexture = null;
					textureCount = MAX_TEXTURES;
					TICK++;
				}

				const uniforms = this.getUniforms(sprite);
				if (currentUniforms !== uniforms) {
					currentUniforms = uniforms;

					currentTexture = null;
					textureCount = MAX_TEXTURES;
					TICK++;
				}

				if (currentTexture !== nextTexture) {
					currentTexture = nextTexture;

					if (nextTexture._enabled !== TICK) {
						if (textureCount === MAX_TEXTURES) {
							TICK++;

							textureCount = 0;
							currentGroup.size = posIndex - currentGroup.start;
							currentGroup = groups[groupCount++];
							currentGroup.textureCount = 0;
							currentGroup.blend = blendMode;
							currentGroup.start = posIndex;
							currentGroup.uniforms = currentUniforms;
						}

						nextTexture._enabled = TICK;
						nextTexture._virtalBoundId = textureCount;

						currentGroup.textures[currentGroup.textureCount++] = nextTexture;
						textureCount++;
					}
				}

				this.fillVertices(float32View, uint32View, posVertex * this.vertSize, sprite, nextTexture._virtalBoundId);

				if (sprite.indices) {
					const len = sprite.indices.length;
					for (let k=0; k<len; k++) {
						bufferIndex[posIndex++] = posVertex + sprite.indices[k];
					}
					hasMesh = true;
				} else {
					bufferIndex[posIndex++] = posVertex;
					bufferIndex[posIndex++] = posVertex + 1;
					bufferIndex[posIndex++] = posVertex + 2;
					bufferIndex[posIndex++] = posVertex;
					bufferIndex[posIndex++] = posVertex + 2;
					bufferIndex[posIndex++] = posVertex + 3;
				}
				posVertex += sprite.vertexData.length / 2;
			}

			currentGroup.size = posIndex - currentGroup.start;

			const curVertexCount = this.vertexCount;
			const isNewBuffer = this.checkVaoMax();

			this.vertexBuffers[curVertexCount].upload(buffer.vertices, 0, !isNewBuffer);
			if (hasMesh) {
				this.indexBuffers[curVertexCount].upload(bufferIndex, 0);
			} else {
				this.indexBuffer.bind();
			}

			// render the groups..
			for (i = 0; i < groupCount; i++) {
				const group = groups[i];
				const groupTextureCount = group.textureCount;

				if (group.uniforms !== currentUniforms) {
					this.syncUniforms(group.uniforms);
				}

				for (let j = 0; j < groupTextureCount; j++) {
					this.renderer.bindTexture(group.textures[j], j, true);
					group.textures[j]._virtalBoundId = -1;

					const v = this.shader.uniforms.samplerSize;
					if (v) {
						v[0] = group.textures[j].realWidth;
						v[1] = group.textures[j].realHeight;
						this.shader.uniforms.samplerSize = v;
					}
				}

				// set the blend mode..
				this.renderer.state.setBlendMode(group.blend);

				gl.drawElements(gl.TRIANGLES, group.size, gl.UNSIGNED_SHORT, group.start * 2);
			}

			// reset sprites for the next flush
			this.currentIndex = 0;
			this.countVertex = 0;
			this.countIndex = 0;
		}

		/**
		 * Starts a new sprite batch.
		 */
		start() {
			this.renderer.bindShader(this.shader);

			if (settings.CAN_UPLOAD_SAME_BUFFER) {
				// bind buffer #0, we don't need others
				this.renderer.bindVao(this.vaos[this.vertexCount]);

				this.vertexBuffers[this.vertexCount].bind();
			}
		}

		/**
		 * Stops and flushes the current batch.
		 *
		 */
		stop() {
			this.flush();
		}

		/**
		 * Destroys the SpriteRenderer.
		 *
		 */
		destroy() {
			for (let i = 0; i < this.vaoMax; i++) {
				if (this.vertexBuffers[i]) {
					this.vertexBuffers[i].destroy();
				}
				if (this.indexBuffers[i]) {
					this.indexBuffers[i].destroy();
				}
				if (this.vaos[i]) {
					this.vaos[i].destroy();
				}
			}

			if (this.indexBuffer) {
				this.indexBuffer.destroy();
			}

			this.renderer.off('prerender', this.onPrerender, this);

			super.destroy();

			if (this.shader) {
				this.shader.destroy();
				this.shader = null;
			}

			this.vertexBuffers = null;
			this.vaos = null;
			this.indexBuffer = null;
			this.indices = null;

			this.sprites = null;

			for (let i = 0; i < this.buffers.length; ++i) {
				this.buffers[i].destroy();
			}
			this.buffersIndex = null;
		}
	}
}
