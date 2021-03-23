namespace pixi_heaven {
	const vertex = `attribute vec2 aVertexPosition;
	attribute vec2 aTextureCoord;

	uniform mat3 projectionMatrix;
	uniform mat3 translationMatrix;
	uniform mat3 uTextureMatrix;

	varying vec2 vTextureCoord;

	void main(void)
	{
		gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

		vTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;
	}`;

	const fragment = `varying vec2 vTextureCoord;
uniform vec4 uLight, uDark;

uniform sampler2D uSampler;

void main(void)
{
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor.a = texColor.a * uLight.a;
	gl_FragColor.rgb = ((texColor.a - 1.0) * uDark.a + 1.0 - texColor.rgb) * uDark.rgb + texColor.rgb * uLight.rgb;
}
	`;

	const fragTrim = `
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

	export class MeshMaterial extends PIXI.Shader {
		uvMatrix: PIXI.TextureMatrix;
		batchable: boolean;
		readonly allowTrim: boolean;
		pluginName: string;
		color: ColorTransform;
		_colorId: number;

		constructor(uSampler: PIXI.Texture, options?: any) {
			const uniforms = {
				uSampler,
				uTextureMatrix: PIXI.Matrix.IDENTITY,
				uDark: new Float32Array([0, 0, 0, 1]),
				uLight: new Float32Array([1, 1, 1, 1]),
			};

			// Set defaults
			options = (Object as any).assign({
				pluginName: 'batchHeaven',
			}, options);

			let allowTrim = options.allowTrim;

			if (!allowTrim) {
				if (settings.MESH_CLAMP === CLAMP_OPTIONS.AUTO) {
					allowTrim = uSampler.trim && (uSampler.trim.width < uSampler.orig.width || uSampler.trim.height < uSampler.orig.height);
				} else if (settings.MESH_CLAMP === CLAMP_OPTIONS.ALWAYS) {
					allowTrim = true;
				}
			}

			if (options.uniforms) {
				(Object as any).assign(uniforms, options.uniforms);
			}

			super(options.program || PIXI.Program.from(vertex, allowTrim ? fragTrim: fragment), uniforms);

			this.allowTrim = allowTrim;

			/**
			 * TextureMatrix instance for this Mesh, used to track Texture changes
			 *
			 * @member {PIXI.TextureMatrix}
			 * @readonly
			 */
			this.uvMatrix = new PIXI.TextureMatrix(uSampler);

			/**
			 * `true` if shader can be batch with the renderer's batch system.
			 * @member {boolean}
			 * @default true
			 */
			this.batchable = options.program === undefined && !this.allowTrim;

			/**
			 * Renderer plugin for batching
			 *
			 * @member {string}
			 * @default 'batch'
			 */
			this.pluginName = options.pluginName;

			this.color = options.color || new ColorTransform();

			this._colorId = -1;
		}

		/**
		 * Reference to the texture being rendered.
		 * @member {PIXI.Texture}
		 */
		get texture() {
			return this.uniforms.uSampler;
		}

		set texture(value) {
			if (this.uniforms.uSampler !== value) {
				this.uniforms.uSampler = value;
				this.uvMatrix.texture = value;
				this.color.pma = value.baseTexture.premultiplyAlpha;
			}
		}

		/**
		 * This gets automatically set by the object using this.
		 *
		 * @default 1
		 * @member {number}
		 */
		set alpha(value) {
			this.color.alpha = value;
		}

		get alpha() {
			return this.color.alpha;
		}

		/**
		 * Multiply tint for the material.
		 * @member {number}
		 * @default 0xFFFFFF
		 */
		set tint(value) {
			this.color.tintBGR = value;
		}

		get tint() {
			return this.color.tintBGR;
		}

		/**
		 * Gets called automatically by the Mesh. Intended to be overridden for custom
		 * MeshMaterial objects.
		 */
		update() {
			this.color.updateTransform();
			if (this._colorId !== this.color._updateID) {
				this._colorId = this.color._updateID;
				const { color, uniforms } = this;
				const light = uniforms.uLight;
				const dark = uniforms.uDark;

				PIXI.utils.premultiplyRgba(color.light, color.light[3], light, uniforms.uSampler.alphaMode);
				PIXI.utils.premultiplyRgba(color.dark, color.light[3], dark, uniforms.uSampler.alphaMode);
				dark[3] = color.dark[3];
			}

			if (this.uvMatrix.update()) {
				this.uniforms.uTextureMatrix = this.uvMatrix.mapCoord;
				if (this.allowTrim) {
					this.uniforms.uClampFrame = this.uvMatrix.uClampFrame;
				}
			}
		}
	}
}
