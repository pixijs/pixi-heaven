import { ColorTransform } from './ColorTransform';
import { DisplayObject } from '@pixi/display';
import { Renderer } from '@pixi/core';
import { BitmapText } from '@pixi/text-bitmap';
import { DoubleTintMeshMaterial } from './mesh/DoubleTintMeshMaterial';
import { MeshH } from './mesh/MeshH';

export class BitmapTextH extends BitmapText
{
    constructor(text: string, style?: any)
    {
        super(text, style);
        if (!this.color)
        {
            this.color = new ColorTransform();
        }
    }

    color: ColorTransform;

    get tint()
    {
        return this.color ? this.color.tintBGR : 0xffffff;
    }

    set tint(value: number)
    {
        if (this.color)
        {
            this.color.tintBGR = value;
        }
    }

    addChild(...additionalChildren: DisplayObject[]): any
    {
        const child: MeshH = additionalChildren[0] as any;

        if (!child.color && child.geometry)
        {
            if (!this.color)
            {
                this.color = new ColorTransform();
            }
            child.color = this.color;
            (child as any).material = new DoubleTintMeshMaterial(child.material.texture, { color: this.color });
        }

        return super.addChild(child, ...additionalChildren);
    }

    _render(renderer: Renderer)
    {
        this.color.alpha = this.worldAlpha;
        this.color.updateTransform();
        super._render(renderer);
    }
}
