namespace pixi_heaven.webgl {
	import TYPES = PIXI.TYPES;
	import BaseTexture = PIXI.BaseTexture;
	import premultiplyTint = PIXI.utils.premultiplyTint;
	import AbstractBatchRenderer = PIXI.AbstractBatchRenderer;

	const WHITE = PIXI.Texture.WHITE.baseTexture;

	const shaderVert =
		`precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aLight, aDark;
attribute float aTextureId;
attribute vec2 aMaskCoord;
attribute vec4 aMaskClamp;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform vec4 tint;

varying vec2 vTextureCoord;
varying vec4 vLight, vDark;
varying float vTextureId;
varying vec2 vMaskCoord;
varying vec4 vMaskClamp;

void main(void){
gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

vTextureCoord = aTextureCoord;
vTextureId = aTextureId;
vLight = aLight * tint;
vDark = vec4(aDark.rgb * tint.rgb, aDark.a);
vMaskCoord = aMaskCoord;
vMaskClamp = aMaskClamp;
}
`;
	const shaderFrag = `
varying vec2 vTextureCoord;
varying vec2 vMaskCoord;
varying vec4 vMaskClamp;
varying vec4 vLight, vDark;
varying float vTextureId;
uniform sampler2D uSamplers[%count%];

void main(void) {
vec4 texColor, maskColor, fragColor;

float maskBits = floor((vTextureId + 0.5) / 64.0);
float textureId = floor(0.5 + vTextureId - maskBits * 64.0);
float maskId = floor((maskBits + 0.5) / 16.0);
maskBits = maskBits - maskId * 16.0;

float clipEnable = step(0.5, maskBits);

float clip = step(3.5,
    step(vMaskClamp.x, vMaskCoord.x) +
    step(vMaskClamp.y, vMaskCoord.y) +
    step(vMaskCoord.x, vMaskClamp.z) +
    step(vMaskCoord.y, vMaskClamp.w));
%loopTex%
%loopMask%
fragColor.a = texColor.a * vLight.a;
fragColor.rgb = ((texColor.a - 1.0) * vDark.a + 1.0 - texColor.rgb) * vDark.rgb + texColor.rgb * vLight.rgb;
gl_FragColor = fragColor * maskColor.r * (clipEnable * clip + 1.0 - clipEnable);
}`;
	const tempArray = new Float32Array([0, 0, 0, 0]);

	export class MaskedGeometry extends PIXI.Geometry {
		_buffer: PIXI.Buffer;
		_indexBuffer: PIXI.Buffer;

		constructor(_static = false) {
			super();

			this._buffer = new PIXI.Buffer(null, _static, false);

			this._indexBuffer = new PIXI.Buffer(null, _static, true);

			this.addAttribute('aVertexPosition', this._buffer, 2, false, TYPES.FLOAT)
				.addAttribute('aTextureCoord', this._buffer, 2, false, TYPES.FLOAT)
				.addAttribute('aLight', this._buffer, 4, true, TYPES.UNSIGNED_BYTE)
				.addAttribute('aDark', this._buffer, 4, true, TYPES.UNSIGNED_BYTE)
				.addAttribute('aTextureId', this._buffer, 1, true, TYPES.FLOAT)
				.addAttribute('aMaskCoord', this._buffer, 2, false, TYPES.FLOAT)
				.addAttribute('aMaskClamp', this._buffer, 4, false, TYPES.FLOAT)
				.addIndex(this._indexBuffer);
		}
	}

	const elemTex: Array<BaseTexture> = [null, null];

	export class MaskedPluginFactory {
		static MAX_TEXTURES = 8;

		static create(options: any): any {
			const {vertex, fragment, vertexSize, geometryClass} = (Object as any).assign({
				vertex: shaderVert,
				fragment: shaderFrag,
				geometryClass: MaskedGeometry,
				vertexSize: 13,
			}, options);

			return class BatchPlugin extends AbstractBatchRenderer {
				constructor(renderer: PIXI.Renderer) {
					super(renderer);

					this.shaderGenerator = new LoopShaderGenerator(vertex, fragment,
						[{
							loopLabel: '%loopTex%',
							inCoord: 'vTextureCoord',
							outColor: 'texColor',
							inTex: 'textureId',
						}, {
							loopLabel: '%loopMask%',
							inCoord: 'vMaskCoord',
							outColor: 'maskColor',
							inTex: 'maskId',
						}]);
					this.geometryClass = geometryClass;
					this.vertexSize = vertexSize;
				}

				vertexSize: number;

				contextChange(): void {
					const thisAny = this as any;
					const batchMAX_TEXTURES = thisAny.renderer.plugins['batch'].MAX_TEXTURES * 2;

					thisAny.MAX_TEXTURES = Math.max(2, Math.min(MaskedPluginFactory.MAX_TEXTURES, batchMAX_TEXTURES));
					this._shader = thisAny.shaderGenerator.generateShader(this.MAX_TEXTURES);

					// we use the second shader as the first one depending on your browser
					// may omit aTextureId as it is not used by the shader so is optimized out.
					for (let i = 0; i < thisAny._packedGeometryPoolSize; i++) {
						/* eslint-disable max-len */
						thisAny._packedGeometries[i] = new (this.geometryClass)();
					}

					this.initFlushBuffers();
				}

				buildTexturesAndDrawCalls(): void {
					const textures: Array<PIXI.BaseTexture> = (this as any)._bufferedTextures;
					const elements: Array<any> = (this as any)._bufferedElements;
					const _bufferSize: number = (this as any)._bufferSize;
					const {
						MAX_TEXTURES
					} = this;
					const textureArrays = AbstractBatchRenderer._textureArrayPool;
					const batch = this.renderer.batch;
					const boundTextures: BaseTexture[] = (this as any)._tempBoundTextures;
					const touch = this.renderer.textureGC.count;

					let TICK = ++BaseTexture._globalBatch;
					let countTexArrays = 0;
					let texArray = textureArrays[0];
					let start = 0;

					batch.copyBoundTextures(boundTextures, MAX_TEXTURES);

					for (let i = 0; i < _bufferSize; ++i) {
						// here are my changes, use two textures instead of one
						// use WHITE as default mask
						const maskTexNull = elements[i].maskSprite ? elements[i].maskSprite.texture.baseTexture : null;
						elemTex[0] = maskTexNull && maskTexNull.valid ? maskTexNull : WHITE;
						elemTex[1] = textures[i];
						textures[i] = null;

						const cnt = (elemTex[0]._batchEnabled !== TICK ? 1 : 0) +
							(elemTex[1]._batchEnabled !== TICK ? 1 : 0);

						if (texArray.count + cnt > MAX_TEXTURES) {
							batch.boundArray(texArray, boundTextures, TICK, MAX_TEXTURES);
							this.buildDrawCalls(texArray, start, i);
							start = i;
							texArray = textureArrays[++countTexArrays];
							++TICK;
						}

						for (let j = 0; j < 2; j++) {
							const tex = elemTex[j];

							if (tex._batchEnabled !== TICK) {
								tex._batchEnabled = TICK;
								(tex as any).touched = touch;
								texArray.elements[texArray.count++] = tex;
							}
						}
					}

					if (texArray.count > 0) {
						batch.boundArray(texArray, boundTextures, TICK, MAX_TEXTURES);
						this.buildDrawCalls(texArray, start, _bufferSize);
						++countTexArrays;
						++TICK;
					}

					// Clean-up

					for (let i = 0; i < boundTextures.length; i++) {
						boundTextures[i] = null;
					}
					BaseTexture._globalBatch = TICK;
				}

				packInterleavedGeometry(element: any, attributeBuffer: PIXI.ViewableBuffer, indexBuffer: Uint16Array, aIndex: number, iIndex: number) {
					const {
						uint32View,
						float32View,
					} = attributeBuffer;

					let lightRgba = -1;
					let darkRgba = 0;

					if (element.color) {
						lightRgba = element.color.lightRgba;
						darkRgba = element.color.darkRgba;
					} else {
						const alpha = Math.min(element.worldAlpha, 1.0);
						lightRgba = (alpha < 1.0
							&& element._texture.baseTexture.premultiplyAlpha)
							? premultiplyTint(element._tintRGB, alpha)
							: element._tintRGB + (alpha * 255 << 24);
					}

					const p = aIndex / this.vertexSize;
					const uvs = element.uvs;
					const indices = element.indices;
					const vertexData = element.vertexData;
					let textureId = element._texture.baseTexture._batchLocation;
					let maskTex = WHITE;

					const mask = element.maskSprite;
					let clamp: any = tempArray;
					let maskVertexData = tempArray;
					let maskBit = 0;

					if (mask) {
						//TODO: exclude from batcher, move it to element render()
						element.calculateMaskVertices();
						clamp = mask._texture.uvMatrix.uClampFrame;
						maskVertexData = element.maskVertexData;
						if (mask.texture.valid) {
							maskTex = mask.texture.baseTexture;
							maskBit = 1;
						}
					}

					for (let i = 0; i < vertexData.length; i += 2) {
						float32View[aIndex++] = vertexData[i];
						float32View[aIndex++] = vertexData[i + 1];
						float32View[aIndex++] = uvs[i];
						float32View[aIndex++] = uvs[i + 1];
						uint32View[aIndex++] = lightRgba;
						uint32View[aIndex++] = darkRgba;
						float32View[aIndex++] = ((maskTex._batchLocation * 16.0 + maskBit) * 64.0) + textureId;

						float32View[aIndex++] = maskVertexData[i];
						float32View[aIndex++] = maskVertexData[i + 1];
						float32View[aIndex++] = clamp[0];
						float32View[aIndex++] = clamp[1];
						float32View[aIndex++] = clamp[2];
						float32View[aIndex++] = clamp[3];
					}

					for (let i = 0; i < indices.length; i++) {
						indexBuffer[iIndex++] = p + indices[i];
					}
				}
			};
		}
	}

	PIXI.Renderer.registerPlugin('batchMasked', MaskedPluginFactory.create({}));
}
