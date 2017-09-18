namespace pixi_heaven {
	import MultiTextureSpriteRenderer = pixi_heaven.webgl.MultiTextureSpriteRenderer;

	class SpriteHeavenRenderer extends MultiTextureSpriteRenderer {
		shaderVert =
			`precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aLight, aDark;
attribute float aTextureId;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec4 vLight, vDark;
varying float vTextureId;

void main(void){
    gl_Position.xyz = projectionMatrix * vec3(aVertexPosition, 1.0);
    gl_Position.w = 1.0;
    
    vTextureCoord = aTextureCoord;
    vTextureId = aTextureId;
    vLight = aLight;
    vDark = aDark;
}
`;
		shaderFrag = `
varying vec2 vTextureCoord;
varying vec4 vLight, vDark;
varying float vTextureId;
uniform sampler2D uSamplers[%count%];

void main(void) {
vec4 texColor;
vec2 texCoord = vTextureCoord;
float textureId = floor(vTextureId+0.5);
%forloop%
gl_FragColor.a = texColor.a * vLight.a;
gl_FragColor.rgb = ((texColor.a - 1.0) * vDark.a + 1.0 - texColor.rgb) * vDark.rgb + texColor.rgb * vLight.rgb;
}`;

		createVao(vertexBuffer: PIXI.glCore.GLBuffer) {
			const attrs = this.shader.attributes;
			this.vertSize = attrs.aTextureId ? 7 : 6;
			this.vertByteSize = this.vertSize * 4;


			const gl = this.renderer.gl;
			const vao = this.renderer.createVao()
				.addIndex(this.indexBuffer)
				.addAttribute(vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0)
				.addAttribute(vertexBuffer, attrs.aTextureCoord, gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4)
				.addAttribute(vertexBuffer, attrs.aLight, gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4)
				.addAttribute(vertexBuffer, attrs.aDark, gl.UNSIGNED_BYTE, true, this.vertByteSize, 4 * 4);

			if (attrs.aTextureId) {
				vao.addAttribute(vertexBuffer, attrs.aTextureId, gl.FLOAT, false, this.vertByteSize, 6 * 4);
			}

			return vao;
		}

		fillVertices(float32View: Float32Array, uint32View: Uint32Array, index: number, sprite: any, textureId: number) {
			//first, fill the coordinates!

			const vertexData = sprite.vertexData;
			const uvs = sprite._texture._uvs.uvsUint32;

			const n = vertexData.length / 2;

			const lightArgb = sprite.color.lightArgb;
			const darkArgb = sprite.color.darkArgb;
			const stride = this.vertSize;

			for (let i = 0; i < n; i++) {
				float32View[index] = vertexData[i * 2];
				float32View[index + 1] = vertexData[i * 2 + 1];
				uint32View[index + 2] = uvs[i * 2];
				uint32View[index + 3] = uvs[i * 2 + 1];
				uint32View[index + 4] = lightArgb;
				uint32View[index + 5] = darkArgb;
				index += stride;
			}

			if (stride === 7) {
				for (let i = 0; i < n; i++) {
					float32View[index + 6] = textureId;
				}
			}
		}
	}

	PIXI.WebGLRenderer.registerPlugin('spriteHeaven', SpriteHeavenRenderer);
}