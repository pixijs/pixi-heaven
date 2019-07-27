namespace pixi_heaven {
	namespace pixi_projection {
		import TYPES = PIXI.TYPES;
		import premultiplyTint = PIXI.utils.premultiplyTint;

		const shaderVert =
			`precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aLight, aDark;
attribute float aTextureId;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform vec4 tint;

varying vec2 vTextureCoord;
varying vec4 vLight, vDark;
varying float vTextureId;

void main(void){
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = aTextureCoord;
    vTextureId = aTextureId;
    vLight = aLight * tint;
    vDark = vec4(aDark.rgb * tint.rgb, aDark.a);
}
`;
		const shaderFrag = `
varying vec2 vTextureCoord;
varying vec4 vLight, vDark;
varying float vTextureId;
uniform sampler2D uSamplers[%count%];

void main(void) {
vec4 color;
float textureId = floor(vTextureId+0.5);
%forloop%
gl_FragColor.a = color.a * vLight.a;
gl_FragColor.rgb = ((color.a - 1.0) * vDark.a + 1.0 - color.rgb) * vDark.rgb + color.rgb * vLight.rgb;
}`;

		export class DarkLightGeometry extends PIXI.Geometry
		{
			_buffer: PIXI.Buffer;
			_indexBuffer : PIXI.Buffer;

			constructor(_static = false)
			{
				super();

				this._buffer = new PIXI.Buffer(null, _static, false);

				this._indexBuffer = new PIXI.Buffer(null, _static, true);

				this.addAttribute('aVertexPosition', this._buffer, 2, false, TYPES.FLOAT)
					.addAttribute('aTextureCoord', this._buffer, 2, false, TYPES.FLOAT)
					.addAttribute('aLight', this._buffer, 4, true, TYPES.UNSIGNED_BYTE)
					.addAttribute('aDark', this._buffer, 4, true, TYPES.UNSIGNED_BYTE)
					.addAttribute('aTextureId', this._buffer, 1, true, TYPES.FLOAT)
					.addIndex(this._indexBuffer);
			}
		}

		export class DarkLightPluginFactory {
			static create(options: any): any
			{
				const { vertex, fragment, vertexSize, geometryClass } = (Object as any).assign({
					vertex: shaderVert,
					fragment: shaderFrag,
					geometryClass: DarkLightGeometry,
					vertexSize: 7,
				}, options);

				return class BatchPlugin extends PIXI.AbstractBatchRenderer
				{
					constructor(renderer: PIXI.Renderer)
					{
						super(renderer);

						this.shaderGenerator = new PIXI.BatchShaderGenerator(vertex, fragment);
						this.geometryClass = geometryClass;
						this.vertexSize = vertexSize;
					}

					vertexSize: number;

					packInterleavedGeometry(element: any, attributeBuffer: PIXI.ViewableBuffer, indexBuffer: Uint16Array, aIndex: number, iIndex: number)
					{
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
						const textureId = element._texture.baseTexture._id;

						for (let i = 0; i < vertexData.length; i += 2)
						{
							float32View[aIndex++] = vertexData[i];
							float32View[aIndex++] = vertexData[i + 1];
							float32View[aIndex++] = uvs[i];
							float32View[aIndex++] = uvs[i + 1];
							uint32View[aIndex++] = lightRgba;
							uint32View[aIndex++] = darkRgba;
							float32View[aIndex++] = textureId;
						}

						for (let i = 0; i < indices.length; i++)
						{
							indexBuffer[iIndex++] = p + indices[i];
						}
					}
				};
			}
		}

		PIXI.Renderer.registerPlugin('batchHeaven', DarkLightPluginFactory.create({}));
	}
}
