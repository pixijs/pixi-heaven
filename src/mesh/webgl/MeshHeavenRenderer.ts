namespace pixi_heaven.mesh {
	import glCore = PIXI.glCore;
	import utils = PIXI.utils;
	const matrixIdentity = PIXI.Matrix.IDENTITY;

	export class MeshHeavenRenderer extends PIXI.ObjectRenderer {
		static vert = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform mat3 uTransform;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;
}
`;

		static frag = `
varying vec2 vTextureCoord;
uniform vec4 uLight, uDark;

uniform sampler2D uSampler;

void main(void)
{
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor.a = texColor.a * uLight.a;
	gl_FragColor.rgb = ((texColor.a - 1.0) * uDark.a + 1.0 - texColor.rgb) * uDark.rgb + texColor.rgb * uLight.rgb;
}
`;

		static fragTrim = `
varying vec2 vTextureCoord;
uniform vec4 uLight, uDark;
uniform vec4 uClampFrame;

uniform sampler2D uSampler;

void main(void)
{
    vec2 coord = vTextureCoord;
    if (coord.x < uClampFrame.x || coord.x > uClampFrame.z
        || coord.y < uClampFrame.y || coord.y > uClampFrame.w)
            discard;
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor.a = texColor.a * uLight.a;
	gl_FragColor.rgb = ((texColor.a - 1.0) * uDark.a + 1.0 - texColor.rgb) * uDark.rgb + texColor.rgb * uLight.rgb;
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

			this.shader = new PIXI.Shader(gl, MeshHeavenRenderer.vert, MeshHeavenRenderer.frag);
			this.shaderTrim = new PIXI.Shader(gl, MeshHeavenRenderer.vert, MeshHeavenRenderer.fragTrim);
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
			
			if (!glData) {
				renderer.bindVao(null);

				glData = {
					vertexBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.vertices, gl.STREAM_DRAW),
					uvBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.uvs, gl.STREAM_DRAW),
					indexBuffer: glCore.GLBuffer.createIndexBuffer(gl, mesh.indices, gl.STATIC_DRAW),
					// build the vao object that will render..
					vao: null,
					dirty: mesh.dirty,
					indexDirty: mesh.indexDirty
				};

				// build the vao object that will render..
				glData.vao = new glCore.VertexArrayObject(gl)
					.addIndex(glData.indexBuffer)
					.addAttribute(glData.vertexBuffer, this.shader.attributes.aVertexPosition, gl.FLOAT, false, 2 * 4, 0)
					.addAttribute(glData.uvBuffer, this.shader.attributes.aTextureCoord, gl.FLOAT, false, 2 * 4, 0);

				mesh._glDatas[renderer.CONTEXT_UID] = glData;
			}

			renderer.bindVao(glData.vao);

			if (mesh.dirty !== glData.dirty) {
				glData.dirty = mesh.dirty;
				glData.uvBuffer.upload(mesh.uvs);
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

			shader.uniforms.uLight = mesh.color.light;
			shader.uniforms.uDark = mesh.color.dark;

			const drawMode = mesh.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;

			glData.vao.draw(drawMode, mesh.indices.length, 0);
		}
	}

	PIXI.WebGLRenderer.registerPlugin('meshHeaven', MeshHeavenRenderer);
}
