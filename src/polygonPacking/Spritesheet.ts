import {Spritesheet} from "@pixi/spritesheet";
import {Rectangle} from "@pixi/math";
import {Texture} from "@pixi/core";

export class TexturePolygon {
    constructor(public vertices: ArrayLike<number>, public uvs: ArrayLike<number>, public indices: ArrayLike<number>) {
    }
}

export function applySpritesheetMixin(): void
{
    (Spritesheet.prototype as any)._processFrames = function (initialFrameIndex: number) {
        const meta = this.data.meta;

        let frameIndex = initialFrameIndex;
        const maxFrames = Spritesheet.BATCH_SIZE;

        while (frameIndex - initialFrameIndex < maxFrames && frameIndex < this._frameKeys.length)
        {
            const i = this._frameKeys[frameIndex];
            const data = this._frames[i];
            const rect = data.frame;

            if (rect)
            {
                let frame = null;
                let trim = null;
                const sourceSize = data.trimmed !== false && data.sourceSize
                    ? data.sourceSize : data.frame;

                const orig = new Rectangle(
                    0,
                    0,
                    Math.floor(sourceSize.w) / this.resolution,
                    Math.floor(sourceSize.h) / this.resolution
                );

                if (data.rotated)
                {
                    frame = new Rectangle(
                        Math.floor(rect.x) / this.resolution,
                        Math.floor(rect.y) / this.resolution,
                        Math.floor(rect.h) / this.resolution,
                        Math.floor(rect.w) / this.resolution
                    );
                }
                else
                {
                    frame = new Rectangle(
                        Math.floor(rect.x) / this.resolution,
                        Math.floor(rect.y) / this.resolution,
                        Math.floor(rect.w) / this.resolution,
                        Math.floor(rect.h) / this.resolution
                    );
                }

                //  Check to see if the sprite is trimmed
                if (data.trimmed !== false && data.spriteSourceSize)
                {
                    trim = new Rectangle(
                        Math.floor(data.spriteSourceSize.x) / this.resolution,
                        Math.floor(data.spriteSourceSize.y) / this.resolution,
                        Math.floor(rect.w) / this.resolution,
                        Math.floor(rect.h) / this.resolution
                    );
                }

                this.textures[i] = new Texture(
                    this.baseTexture,
                    frame,
                    orig,
                    trim,
                    data.rotated ? 2 : 0,
                    data.anchor
                );

                if (data.vertices) {
                    const vertices = new Float32Array(data.vertices.length * 2);

                    for (let i = 0; i < data.vertices.length; i++) {
                        vertices[i * 2] = Math.floor(data.vertices[i][0] ) / this.resolution;
                        vertices[i * 2 + 1] = Math.floor(data.vertices[i][1] ) / this.resolution;
                    }

                    const uvs = new Float32Array(data.verticesUV.length * 2);

                    for (let i = 0; i < data.verticesUV.length; i++) {
                        uvs[i * 2] = data.verticesUV[i][0] / meta.size.w;
                        uvs[i * 2 + 1] = data.verticesUV[i][1] / meta.size.h;
                    }

                    const indices = new Uint16Array(data.triangles.length * 3);
                    for (let i = 0; i < data.triangles.length; i++) {
                        indices[i * 3] = data.triangles[i][0];
                        indices[i * 3 + 1] = data.triangles[i][1];
                        indices[i * 3 + 2] = data.triangles[i][2];
                    }

                    (this.textures[i] as any).polygon = new TexturePolygon(vertices, uvs, indices);
                }

                // lets also add the frame to pixi's global cache for 'from' and 'fromLoader' functions
                Texture.addToCache(this.textures[i], i);
            }

            frameIndex++;
        }
    }
}
