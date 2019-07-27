namespace pixi_heaven {
	export class Mesh extends PIXI.Mesh {
		color: ColorTransform = null;

		constructor(geometry: PIXI.Geometry, shader: MeshMaterial, state: PIXI.State, drawMode?: number) {
			super(geometry, shader, state, drawMode);
			this.color = shader.color;
		}

		_renderDefault(renderer: PIXI.Renderer) {
			const shader = this.shader as MeshMaterial;

			shader.color.alpha = this.worldAlpha;
			if (shader.update) {
				shader.update();
			}

			renderer.batch.flush();

			if ((shader as any).program.uniformData.translationMatrix) {
				shader.uniforms.translationMatrix = this.worldTransform.toArray(true);
			}

			// bind and sync uniforms..
			renderer.shader.bind(shader, false);

			// set state..
			renderer.state.set(this.state);

			// bind the geometry...
			renderer.geometry.bind(this.geometry, shader);

			// then render it
			renderer.geometry.draw(this.drawMode, this.size, this.start, (this.geometry as any).instanceCount);
		}

		_renderToBatch(renderer: PIXI.Renderer)
		{
			this.color.updateTransform();
			super._renderToBatch(renderer);
		}
	}


	export class SimpleMesh extends Mesh {
		constructor(texture: PIXI.Texture, vertices?: Float32Array, uvs?: Float32Array,
		            indices?: Uint16Array, drawMode?: number) {
			super(new PIXI.MeshGeometry(vertices, uvs, indices),
				new MeshMaterial(texture),
				null,
				drawMode);

			(this.geometry.getBuffer('aVertexPosition') as any).static = false;
		}

		autoUpdate = true;

		get vertices() {
			return this.geometry.getBuffer('aVertexPosition').data as Float32Array;
		}

		set vertices(value) {
			this.geometry.getBuffer('aVertexPosition').data = value;
		}

		protected _render(renderer: PIXI.Renderer) {
			if (this.autoUpdate) {
				this.geometry.getBuffer('aVertexPosition').update();
			}

			(super._render as any)(renderer);
		}
	}
}
