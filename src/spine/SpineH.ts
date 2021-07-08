import { ISpineClass } from './base';
import { Graphics } from '@pixi/graphics';
import {Renderer, Texture} from '@pixi/core';
import {SpriteH, SimpleMeshH, ColorTransform} from "../twotint";
import {Container} from "@pixi/display";

export class SpineSprite extends SpriteH {
    spine: Container;

    constructor(tex: Texture, spine: Container) {
        super(tex);
        this.spine = spine;
    }

    _render(renderer: Renderer) {
        if (this.maskSprite) {
            (this.spine as any).hasSpriteMask = true;
        }
        if ((this.spine as any).hasSpriteMask) {
            this.pluginName = 'batchMasked';
        }
        super._render(renderer);
    }
}

export class SpineMesh extends SimpleMeshH {
    spine: Container;

    constructor(texture: Texture, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array, drawMode?: number,
                spine: Container = null) {
        super(texture, vertices, uvs, indices, drawMode);
        this.spine = spine;
    }

    _render(renderer: Renderer) {
        // part of SimpleMesh
        if (this.autoUpdate)
        {
            this.geometry.getBuffer('aVertexPosition').update();
        }
        if (this.maskSprite) {
            (this.spine as any).hasSpriteMask = true;
        }
        if ((this.spine as any).hasSpriteMask) {
            (this.material as any).pluginName = 'batchMasked';
            this._renderToBatch(renderer);
        } else {
            super._renderDefault(renderer);
        }
    }
}

export function applySpineMixin(spineClassPrototype: ISpineClass): void
{
    spineClassPrototype.newMesh = function newMesh(texture: Texture, vertices?: Float32Array,
        uvs?: Float32Array, indices?: Uint16Array, drawMode?: number)
    {
        return new SimpleMeshH(texture, vertices, uvs, indices, drawMode) as any;
    };
    spineClassPrototype.newContainer = function newMesh()
    {
        if (!this.color)
        {
            this.hasSpriteMask = false;
            this.color = new ColorTransform();
        }
        return new Container();
    };
    spineClassPrototype.newSprite = function newSprite(texture: Texture)
    {
        return new SpriteH(texture);
    };
    spineClassPrototype.newGraphics = function newMesh()
    {
        return new Graphics();
    };
    spineClassPrototype.transformHack = function transformHack()
    {
        return 2;
    };
}
