import {ColorTransform} from "../ColorTransform";
import {Mesh as MeshBase, MeshGeometry} from '@pixi/mesh';
import {SpriteH} from "../sprites/SpriteH";
import {Geometry, Renderer, State, Texture} from "@pixi/core";
import {DoubleTintMeshMaterial} from "./DoubleTintMeshMaterial";

export class MeshH extends MeshBase {
    color: ColorTransform = null;
    maskSprite: SpriteH = null;
    maskVertexData: Float32Array = null;
    useSpriteMask = false;

    constructor(geometry: Geometry, shader: DoubleTintMeshMaterial, state: State, drawMode?: number) {
        super(geometry, shader as any, state, drawMode);
        this.color = shader.color;
    }

    _renderDefault(renderer: Renderer) {
        const shader = this.shader as any as DoubleTintMeshMaterial;

        shader.color.alpha = this.worldAlpha;
        if (shader.update) {
            shader.update();
        }

        renderer.batch.flush();

        shader.uniforms.translationMatrix = this.worldTransform.toArray(true);

        // bind and sync uniforms..
        renderer.shader.bind(shader, false);

        // set state..
        renderer.state.set(this.state);

        // bind the geometry...
        renderer.geometry.bind(this.geometry, shader);

        // then render it
        renderer.geometry.draw(this.drawMode, this.size, this.start, (this.geometry as any).instanceCount);
    }

    _render(renderer: Renderer) {
        // part of SimpleMesh
        if (this.maskSprite) {
            this.useSpriteMask = true;
        }
        if (this.useSpriteMask) {
            (this.material as any).pluginName = 'batchMasked';
            this._renderToBatch(renderer);
        } else {
            super._render(renderer);
        }
    }

    _renderToBatch(renderer: Renderer)
    {
        this.color.updateTransform();
        super._renderToBatch(renderer);
    }

    calculateMaskVertices() {
        SpriteH.prototype.calculateMaskVertices.call(this);
    }
}


export class SimpleMeshH extends MeshH {
    constructor(texture: Texture, vertices?: Float32Array, uvs?: Float32Array,
                indices?: Uint16Array, drawMode?: number) {
        super(new MeshGeometry(vertices, uvs, indices),
            new DoubleTintMeshMaterial(texture),
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

    _render(renderer: Renderer) {
        if (this.autoUpdate) {
            this.geometry.getBuffer('aVertexPosition').update();
        }

        (super._render as any)(renderer);
    }
}
