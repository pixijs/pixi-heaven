namespace pixi_heaven.mesh {
	import glCore = PIXI.glCore;
	import utils = PIXI.utils;
	const matrixIdentity = PIXI.Matrix.IDENTITY;

	export class MeshColoredRenderer extends PIXI.ObjectRenderer {
		static vert = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aDark;
attribute vec4 aLight;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform mat3 uTransform;
uniform vec4 uLight, uDark;

varying vec2 vTextureCoord;
varying vec4 vDark;
varying vec4 vLight;

void main(void)
{
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;

	vLight.a = uLight.a * aLight.a;
	vDark.a = uDark.a;
	
	vLight.rgb = ((aLight.a - 1.0) * uDark.a + 1.0 - aLight.rgb) * uDark.rgb + aLight.rgb * uLight.rgb;
	vDark.rgb = ((aDark.a - 1.0) * uDark.a + 1.0 - aDark.rgb) * uDark.rgb + aDark.rgb * uLight.rgb;
}
`;

		static frag = `
varying vec2 vTextureCoord;
varying vec4 vLight, vDark;

uniform sampler2D uSampler;

void main(void)
{
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor.a = texColor.a * vLight.a;
	gl_FragColor.rgb = ((texColor.a - 1.0) * vDark.a + 1.0 - texColor.rgb) * vDark.rgb + texColor.rgb * vLight.rgb;
}
`;

		static fragTrim = `
varying vec2 vTextureCoord;
varying vec4 vLight, vDark;
uniform vec4 uClampFrame;

uniform sampler2D uSampler;

void main(void)
{
    vec2 coord = vTextureCoord;
    if (coord.x < uClampFrame.x || coord.x > uClampFrame.z
        || coord.y < uClampFrame.y || coord.y > uClampFrame.w)
            discard;
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor.a = texColor.a * vLight.a;
	gl_FragColor.rgb = ((texColor.a - 1.0) * vDark.a + 1.0 - texColor.rgb) * vDark.rgb + texColor.rgb * vLight.rgb;
}
`;

		shader: PIXI.Shader = null;
		shaderTrim: PIXI.Shader = null;

		/**
		 * Sets up the renderer context and necessary buffers.
		 *
		 * @private
		 */
		onContextChange() {
			const gl = this.renderer.gl;

			this.shader = new PIXI.Shader(gl, MeshColoredRenderer.vert, MeshColoredRenderer.frag);
			this.shaderTrim = new PIXI.Shader(gl, MeshColoredRenderer.vert, MeshColoredRenderer.fragTrim);
		}

		/**
		 * renders mesh
		 *
		 * @param {PIXI.mesh.Mesh} mesh mesh instance
		 */
		render(mesh: Mesh) {
			const renderer = this.renderer;
			const gl = renderer.gl;
			const texture = mesh._texture;

			if (!texture.valid) {
				return;
			}

			let glData = mesh._glDatas[renderer.CONTEXT_UID];
			
			if (!glData || !glData.colorBuffer) {
				renderer.bindVao(null);

				glData = {
					vertexBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.vertices, gl.STREAM_DRAW),
					uvBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.uvs, gl.STREAM_DRAW),
					colorBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.colors, gl.STREAM_DRAW),
					indexBuffer: glCore.GLBuffer.createIndexBuffer(gl, mesh.indices, gl.STATIC_DRAW),
					// build the vao object that will render..
					vao: null,
					dirty: mesh.dirty,
					indexDirty: mesh.indexDirty
				};

				// build the vao object that will render..
				const attrs = this.shader.attributes;

				glData.vao = new glCore.VertexArrayObject(gl)
					.addIndex(glData.indexBuffer)
					.addAttribute(glData.vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, 2 * 4, 0)
					.addAttribute(glData.uvBuffer, attrs.aTextureCoord, gl.FLOAT, false, 2 * 4, 0)
					.addAttribute(glData.colorBuffer, attrs.aDark, gl.UNSIGNED_BYTE, true, 2 * 4, 0)
					.addAttribute(glData.colorBuffer, attrs.aLight, gl.UNSIGNED_BYTE, true, 2 * 4, 4);

				mesh._glDatas[renderer.CONTEXT_UID] = glData;
			}

			renderer.bindVao(glData.vao);

			if (mesh.dirty !== glData.dirty) {
				glData.dirty = mesh.dirty;
				glData.uvBuffer.upload(mesh.uvs);
				glData.colorBuffer.upload(mesh.colors);
			}

			if (mesh.indexDirty !== glData.indexDirty) {
				glData.indexDirty = mesh.indexDirty;
				glData.indexBuffer.upload(mesh.indices);
			}

			glData.vertexBuffer.upload(mesh.vertices);
			
			const isTrimmed = texture.trim && (texture.trim.width < texture.orig.width
				|| texture.trim.height < texture.orig.height);
			const shader = isTrimmed ? this.shaderTrim : this.shader;
			
			renderer.bindShader(shader);

			shader.uniforms.uSampler = renderer.bindTexture(texture);

			renderer.state.setBlendMode(utils.correctBlendMode(mesh.blendMode, texture.baseTexture.premultipliedAlpha));

			if (shader.uniforms.uTransform) {
				if (mesh.uploadUvTransform) {
					shader.uniforms.uTransform = (mesh._uvTransform as any).mapCoord.toArray(true);
				}
				else {
					shader.uniforms.uTransform = matrixIdentity.toArray(true);
				}
			}
			if (isTrimmed)
			{
				shader.uniforms.uClampFrame = (mesh._uvTransform as any).uClampFrame;
			}
			shader.uniforms.translationMatrix = mesh.worldTransform.toArray(true);

			const light = shader.uniforms.uLight;
			const dark = shader.uniforms.uDark;
			const { color } = mesh;
			PIXI.utils.premultiplyRgba(color.light, color.light[3], light, texture.baseTexture.premultipliedAlpha);
			PIXI.utils.premultiplyRgba(color.dark, color.light[3], dark, texture.baseTexture.premultipliedAlpha);
			dark[3] = shader.uniforms.uDark[3];
			shader.uniforms.uLight = light;
			shader.uniforms.uDark = dark;

			const drawMode = mesh.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;

			glData.vao.draw(drawMode, mesh.indices.length, 0);
		}
	}

	PIXI.WebGLRenderer.registerPlugin('meshColored', MeshColoredRenderer);
}
