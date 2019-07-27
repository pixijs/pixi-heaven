namespace pixi_heaven.webgl {
	import BaseTexture = PIXI.BaseTexture;
	import GLBuffer = PIXI.glCore.GLBuffer;
	import settings = PIXI.settings;
	import premultiplyBlendMode = PIXI.utils.premultiplyBlendMode;

	const tempArray = new Float32Array([0, 0, 0, 0]);

	class SpriteMaskedRenderer extends MultiTextureSpriteRenderer {
		shaderVert =
			`precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aLight, aDark;
attribute float aTextureId;
attribute vec2 aMaskCoord;
attribute vec4 aMaskClamp;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec4 vLight, vDark;
varying float vTextureId;
varying vec2 vMaskCoord;
varying vec4 vMaskClamp;

void main(void){
    gl_Position.xyw = projectionMatrix * vec3(aVertexPosition, 1.0);
    gl_Position.z = 0.0;
    
    vTextureCoord = aTextureCoord;
    vLight = aLight;
    vDark = aDark;
    vTextureId = aTextureId;
    vMaskCoord = aMaskCoord;
    vMaskClamp = aMaskClamp;
}
`;
		shaderFrag = `
varying vec2 vTextureCoord;
varying vec4 vLight, vDark;
varying float vTextureId;
varying vec2 vMaskCoord;
varying vec4 vMaskClamp;
uniform sampler2D uSamplers[2];
uniform sampler2D uMask;

void main(void) {
vec4 texColor = texture2D(uSamplers[0], vTextureCoord);

float clip = step(3.5,
    step(vMaskClamp.x, vMaskCoord.x) +
    step(vMaskClamp.y, vMaskCoord.y) +
    step(vMaskCoord.x, vMaskClamp.z) +
    step(vMaskCoord.y, vMaskClamp.w));

vec4 maskColor = texture2D(uSamplers[1], vMaskCoord);

vec2 texCoord = vTextureCoord;
vec4 fragColor;
fragColor.a = texColor.a * vLight.a;
fragColor.rgb = ((texColor.a - 1.0) * vDark.a + 1.0 - texColor.rgb) * vDark.rgb + texColor.rgb * vLight.rgb;
gl_FragColor = fragColor * (vTextureId * (maskColor.r * clip) + 1.0 - vTextureId);
}`;

		createVao(vertexBuffer: PIXI.glCore.GLBuffer) {
			const attrs = this.shader.attributes;
			this.vertSize = 12;
			this.vertByteSize = this.vertSize * 4;


			const gl = this.renderer.gl;
			const vao = this.renderer.createVao()
				.addIndex(this.indexBuffer)
				.addAttribute(vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0)
				.addAttribute(vertexBuffer, attrs.aTextureCoord, gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4)
				.addAttribute(vertexBuffer, attrs.aLight, gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4)
				.addAttribute(vertexBuffer, attrs.aDark, gl.UNSIGNED_BYTE, true, this.vertByteSize, 4 * 4)
				.addAttribute(vertexBuffer, attrs.aTextureId, gl.FLOAT, false, this.vertByteSize, 5 * 4)
				.addAttribute(vertexBuffer, attrs.aMaskCoord, gl.FLOAT, false, this.vertByteSize, 6 * 4)
				.addAttribute(vertexBuffer, attrs.aMaskClamp, gl.FLOAT, false, this.vertByteSize, 8 * 4);

			return vao;
		}

		fillVertices(float32View: Float32Array, uint32View: Uint32Array, index: number, sprite: any, textureId: number) {
			//first, fill the coordinates!

			const vertexData = sprite.vertexData;
			const n = vertexData.length;

			const lightRgba = sprite.color.lightRgba;
			const darkRgba = sprite.color.darkRgba;
			const stride = this.vertSize;

			const mask = sprite.maskSprite;
			let clamp: any = tempArray;
			let maskVertexData = tempArray;

			if (mask) {
				sprite.calculateMaskVertices();
				clamp = mask._texture.transform.uClampFrame;
				maskVertexData = sprite.maskVertexData;
			}

			const oldIndex = index;

			for (let i = 0; i < n; i += 2) {
				float32View[index] = vertexData[i];
				float32View[index + 1] = vertexData[i + 1];
				uint32View[index + 3] = lightRgba;
				uint32View[index + 4] = darkRgba;
				float32View[index + 5] = mask ? 1 : 0;

				float32View[index + 6] = maskVertexData[i];
				float32View[index + 7] = maskVertexData[i + 1];
				float32View[index + 8] = clamp[0];
				float32View[index + 9] = clamp[1];
				float32View[index + 10] = clamp[2];
				float32View[index + 11] = clamp[3];

				index += stride;
			}

			const uvs = sprite.uvs;
			if (uvs) {
				index = oldIndex + 2;
				for (let i = 0; i < n; i += 2) {
					uint32View[index] = ((Math.round(uvs[i + 1] * 65535) & 0xFFFF) << 16) | (Math.round(uvs[i] * 65535) & 0xFFFF);
					index += stride;
				}
			} else {
				const _uvs = sprite._texture._uvs.uvsUint32;
				index = oldIndex + 2;
				for (let i = 0; i < n; i += 2) {
					uint32View[index] = _uvs[i >> 1];
					index += stride;
				}
			}
		}

		/**
		 * We need different flush for mask strategy
		 * Renders the content and empties the current batch.
		 *
		 */
		flush() {
			if (this.currentIndex === 0) {
				return;
			}

			const gl = this.renderer.gl;
			const MAX_TEXTURES = this.MAX_TEXTURES;

			let np2 = utils.nextPow2((this.countVertex + 3) / 4 | 0);
			let log2 = utils.log2(np2);
			const buffer = this.buffers[log2];

			np2 = utils.nextPow2((this.countIndex + 5) / 6 | 0);
			log2 = utils.log2(np2);
			const bufferIndex = this.buffersIndex[log2];

			const sprites = this.sprites;
			const groups = this.groups;

			const float32View = buffer.float32View;
			const uint32View = buffer.uint32View;

			// const touch = 0;// this.renderer.textureGC.count;

			let nextTexture, nextMaskTexture: any;
			let currentTexture: BaseTexture, currentMaskTexture: BaseTexture = null;
			let groupCount = 1;
			let textureCount = 0;
			let currentGroup = groups[0];
			let blendMode = premultiplyBlendMode[
				(sprites[0] as any)._texture.baseTexture.premultipliedAlpha ? 1 : 0][sprites[0].blendMode];
			let currentUniforms: any = this.getUniforms(sprites[0]);
			let hasMesh = false;

			currentGroup.textureCount = 0;
			currentGroup.start = 0;
			currentGroup.blend = blendMode;
			currentGroup.uniforms = currentUniforms;

			let i;
			let posVertex = 0;
			let posIndex = 0;

			for (i = 0; i < this.currentIndex; ++i) {
				const sprite = sprites[i];

				sprites[i] = null;

				nextTexture = (sprite as any).texture.baseTexture;
				nextMaskTexture = null;

				if (sprite.maskSprite) {
					sprite.calculateMaskVertices();
					nextMaskTexture = sprite.maskSprite.texture.baseTexture;

					if (currentMaskTexture === null) {
						currentMaskTexture = nextMaskTexture;
						currentGroup.textures[1] = nextMaskTexture;
					} else if (currentMaskTexture !== nextMaskTexture) {
						currentTexture = null;
						currentMaskTexture = null;
						textureCount = MAX_TEXTURES;
					}
				}

				const spriteBlendMode = premultiplyBlendMode[Number(nextTexture.premultipliedAlpha)][sprite.blendMode];

				if (blendMode !== spriteBlendMode) {
					// finish a group..
					blendMode = spriteBlendMode;

					// force the batch to break!
					currentTexture = null;
					currentMaskTexture = null;
					textureCount = MAX_TEXTURES;
				}

				const uniforms = i == 0 ? currentUniforms : this.getUniforms(sprite);
				if (currentUniforms !== uniforms) {
					currentTexture = null;
					currentMaskTexture = null;
					textureCount = MAX_TEXTURES;
				}

				if (currentTexture !== nextTexture) {
					currentTexture = nextTexture;
					currentMaskTexture = nextMaskTexture;

					if (textureCount === MAX_TEXTURES) {

						textureCount = 0;

						currentGroup.size = posIndex - currentGroup.start;

						currentGroup = groups[groupCount++];
						currentGroup.textureCount = 0;
						currentGroup.blend = blendMode;
						currentGroup.start = posIndex;
					}

					//nextTexture._enabled = TICK;
					nextTexture._virtalBoundId = textureCount;

					currentGroup.textureCount = MAX_TEXTURES;
					currentGroup.textures[0] = nextTexture;
					currentGroup.textures[1] = nextMaskTexture || PIXI.Texture.WHITE.baseTexture;
					currentGroup.uniforms = uniforms;
					textureCount = MAX_TEXTURES;
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

			currentUniforms = null;
			// / render the groups..
			for (i = 0; i < groupCount; i++) {
				const group = groups[i];
				const groupTextureCount = 2;// group.textureCount;

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

				gl.drawElements(gl.TRIANGLES, group.size, gl.UNSIGNED_SHORT, group.start *   2);
			}

			// reset sprites for the next flush
			this.currentIndex = 0;
			this.countVertex = 0;
			this.countIndex = 0;
		}

		genShader() {
			const gl = this.renderer.gl;

			this.MAX_TEXTURES = 2;

			this.shader = generateMultiTextureShader(this.shaderVert, this.shaderFrag, gl, this.MAX_TEXTURES);
		}
	}

	PIXI.WebGLRenderer.registerPlugin('spriteMasked', SpriteMaskedRenderer);
}