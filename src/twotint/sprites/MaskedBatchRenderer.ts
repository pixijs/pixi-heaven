import {
    BatchRenderer, BaseTexture,
    Buffer,
    Geometry, Renderer, Texture,
    ViewableBuffer, ExtensionType, Color
} from '@pixi/core';
import { premultiplyTint } from '@pixi/utils';
import { TYPES } from '@pixi/constants';
import { LoopShaderGenerator } from './LoopShaderGenerator';

const WHITE = Texture.WHITE.baseTexture;

const shaderVert
    = `precision highp float;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aLight, aDark;
attribute float aTextureId;
attribute vec2 aMaskCoord;
attribute vec4 aMaskClamp;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform vec4 tint;

varying vec2 vTextureCoord;
varying vec4 vLight, vDark;
varying float vTextureId;
varying vec2 vMaskCoord;
varying vec4 vMaskClamp;

void main(void){
gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

vTextureCoord = aTextureCoord;
vTextureId = aTextureId;
vLight = aLight * tint;
vDark = vec4(aDark.rgb * tint.rgb, aDark.a);
vMaskCoord = aMaskCoord;
vMaskClamp = aMaskClamp;
}
`;
const shaderFrag = `
varying vec2 vTextureCoord;
varying vec2 vMaskCoord;
varying vec4 vMaskClamp;
varying vec4 vLight, vDark;
varying float vTextureId;
uniform sampler2D uSamplers[%count%];

void main(void) {
vec4 texColor, maskColor, fragColor;

float maskBits = floor((vTextureId + 0.5) / 64.0);
float textureId = floor(0.5 + vTextureId - maskBits * 64.0);
float maskId = floor((maskBits + 0.5) / 16.0);
maskBits = maskBits - maskId * 16.0;

float clipEnable = step(0.5, maskBits);

float clip = step(3.5,
    step(vMaskClamp.x, vMaskCoord.x) +
    step(vMaskClamp.y, vMaskCoord.y) +
    step(vMaskCoord.x, vMaskClamp.z) +
    step(vMaskCoord.y, vMaskClamp.w));
%loopTex%
%loopMask%
fragColor.a = texColor.a * vLight.a;
fragColor.rgb = ((texColor.a - 1.0) * vDark.a + 1.0 - texColor.rgb) * vDark.rgb + texColor.rgb * vLight.rgb;
gl_FragColor = fragColor * maskColor.r * (clipEnable * clip + 1.0 - clipEnable);
}`;
const tempArray = new Float32Array([0, 0, 0, 0]);

export class MaskedGeometry extends Geometry
{
    _buffer: Buffer;
    _indexBuffer: Buffer;

    constructor(_static = false)
    {
        super();

        this._buffer = new Buffer(null, _static, false);

        this._indexBuffer = new Buffer(null, _static, true);

        this.addAttribute('aVertexPosition', this._buffer, 2, false, TYPES.FLOAT)
            .addAttribute('aTextureCoord', this._buffer, 2, false, TYPES.FLOAT)
            .addAttribute('aLight', this._buffer, 4, true, TYPES.UNSIGNED_BYTE)
            .addAttribute('aDark', this._buffer, 4, true, TYPES.UNSIGNED_BYTE)
            .addAttribute('aTextureId', this._buffer, 1, true, TYPES.FLOAT)
            .addAttribute('aMaskCoord', this._buffer, 2, false, TYPES.FLOAT)
            .addAttribute('aMaskClamp', this._buffer, 4, false, TYPES.FLOAT)
            .addIndex(this._indexBuffer);
    }
}

const elemTex: Array<BaseTexture> = [null, null];

export class MaskedBatchRenderer extends BatchRenderer
{
    static extension = {
        name: 'batchMasked',
        type: ExtensionType.RendererPlugin
    };

    static MAX_TEXTURES = 8;
    constructor(renderer: Renderer)
    {
        super(renderer);

        this.geometryClass = MaskedGeometry;
        this.vertexSize = 13;
        this.maxTextures = 0;
    }

    setShaderGenerator({ vertex = shaderVert, fragment = shaderFrag } = {})
    {
        this.shaderGenerator = new LoopShaderGenerator(vertex, fragment,
            [{
                loopLabel: '%loopTex%',
                inCoord: 'vTextureCoord',
                outColor: 'texColor',
                inTex: 'textureId',
            }, {
                loopLabel: '%loopMask%',
                inCoord: 'vMaskCoord',
                outColor: 'maskColor',
                inTex: 'maskId',
            }]) as any;
    }

    contextChange(): void
    {
        const thisAny = this as any;
        const batchMaxTextures = thisAny.renderer.plugins.batch.maxTextures * 2;

        thisAny.maxTextures = Math.max(2, Math.min(MaskedBatchRenderer.MAX_TEXTURES, batchMaxTextures));
        this._shader = thisAny.shaderGenerator.generateShader(this.maxTextures);

        // we use the second shader as the first one depending on your browser
        // may omit aTextureId as it is not used by the shader so is optimized out.
        for (let i = 0; i < thisAny._packedGeometryPoolSize; i++)
        {
            /* eslint-disable max-len */
            thisAny._packedGeometries[i] = new (this.geometryClass)();
        }

        this.initFlushBuffers();
    }

    buildTexturesAndDrawCalls(): void
    {
        const textures: Array<BaseTexture> = (this as any)._bufferedTextures;
        const elements: Array<any> = (this as any)._bufferedElements;
        const _bufferSize: number = (this as any)._bufferSize;
        const {
            maxTextures
        } = this;
        const textureArrays = BatchRenderer._textureArrayPool;
        const batch = this.renderer.batch;
        const boundTextures: BaseTexture[] = (this as any)._tempBoundTextures;
        const touch = this.renderer.textureGC.count;

        let TICK = ++BaseTexture._globalBatch;
        let countTexArrays = 0;
        let texArray = textureArrays[0];
        let start = 0;

        batch.copyBoundTextures(boundTextures, maxTextures);

        for (let i = 0; i < _bufferSize; ++i)
        {
            // here are my changes, use two textures instead of one
            // use WHITE as default mask
            const maskTexNull = elements[i].maskSprite ? elements[i].maskSprite.texture.baseTexture : null;

            elemTex[0] = maskTexNull && maskTexNull.valid ? maskTexNull : WHITE;
            elemTex[1] = textures[i];
            textures[i] = null;

            const cnt = (elemTex[0]._batchEnabled !== TICK ? 1 : 0)
                + (elemTex[1]._batchEnabled !== TICK ? 1 : 0);

            if (texArray.count + cnt > maxTextures)
            {
                batch.boundArray(texArray, boundTextures, TICK, maxTextures);
                this.buildDrawCalls(texArray, start, i);
                start = i;
                texArray = textureArrays[++countTexArrays];
                ++TICK;
            }

            for (let j = 0; j < 2; j++)
            {
                const tex = elemTex[j];

                if (tex._batchEnabled !== TICK)
                {
                    tex._batchEnabled = TICK;
                    (tex as any).touched = touch;
                    texArray.elements[texArray.count++] = tex;
                }
            }
        }

        if (texArray.count > 0)
        {
            batch.boundArray(texArray, boundTextures, TICK, maxTextures);
            this.buildDrawCalls(texArray, start, _bufferSize);
            ++countTexArrays;
            ++TICK;
        }

        // Clean-up

        for (let i = 0; i < boundTextures.length; i++)
        {
            boundTextures[i] = null;
        }
        BaseTexture._globalBatch = TICK;
    }

    packInterleavedGeometry(element: any, attributeBuffer: ViewableBuffer, indexBuffer: Uint16Array, aIndex: number, iIndex: number)
    {
        const {
            uint32View,
            float32View,
        } = attributeBuffer;

        let lightRgba = -1;
        let darkRgba = 0;

        if (element.color)
        {
            lightRgba = element.color.lightRgba;
            darkRgba = element.color.darkRgba;
        }
        else
        {
            const alpha = Math.min(element.worldAlpha, 1.0);

            lightRgba = Color.shared
                .setValue(element._tintRGB)
                .toPremultiplied(alpha, element._texture.baseTexture.alphaMode > 0);
        }

        const p = aIndex / this.vertexSize;
        const uvs = element.uvs;
        const indices = element.indices;
        const vertexData = element.vertexData;
        const textureId = element._texture.baseTexture._batchLocation;
        let maskTex = WHITE;

        const mask = element.maskSprite;
        let clamp: any = tempArray;
        let maskVertexData = tempArray;
        let maskBit = 0;

        if (mask)
        {
            // TODO: exclude from batcher, move it to element render()
            element.calculateMaskVertices();
            clamp = mask._texture.uvMatrix.uClampFrame;
            maskVertexData = element.maskVertexData;
            if (mask.texture.valid)
            {
                maskTex = mask.texture.baseTexture;
                maskBit = 1;
            }
        }

        for (let i = 0; i < vertexData.length; i += 2)
        {
            float32View[aIndex++] = vertexData[i];
            float32View[aIndex++] = vertexData[i + 1];
            float32View[aIndex++] = uvs[i];
            float32View[aIndex++] = uvs[i + 1];
            uint32View[aIndex++] = lightRgba;
            uint32View[aIndex++] = darkRgba;
            float32View[aIndex++] = (((maskTex._batchLocation * 16.0) + maskBit) * 64.0) + textureId;

            float32View[aIndex++] = maskVertexData[i];
            float32View[aIndex++] = maskVertexData[i + 1];
            float32View[aIndex++] = clamp[0];
            float32View[aIndex++] = clamp[1];
            float32View[aIndex++] = clamp[2];
            float32View[aIndex++] = clamp[3];
        }

        for (let i = 0; i < indices.length; i++)
        {
            indexBuffer[iIndex++] = p + indices[i];
        }
    }
}
