import { Program, Shader, UniformGroup } from '@pixi/core';
import { Matrix } from '@pixi/math';

export interface ILoopDescriptor
{
    loopLabel: string
    inTex: string
    inCoord: string
    outColor: string
}

export class LoopShaderGenerator
{
    programCache: {[key: number]: Program} = {};
    defaultGroupCache: {[key: number]: UniformGroup} = {};

    constructor(public vertexSrc: string, public fragTemplate: string, public loops: Array<ILoopDescriptor>)
    {
        if (fragTemplate.indexOf('%count%') < 0)
        {
            throw new Error('Fragment template must contain "%count%".');
        }
        for (let i = 0; i < loops.length; i++)
        {
            if (fragTemplate.indexOf(loops[i].loopLabel) < 0)
            {
                throw new Error(`Fragment template must contain "${loops[i].loopLabel}".`);
            }
        }
    }

    generateShader(maxTextures: number): Shader
    {
        if (!this.programCache[maxTextures])
        {
            const sampleValues = new Int32Array(maxTextures);
            const { loops } = this;

            for (let i = 0; i < maxTextures; i++)
            {
                sampleValues[i] = i;
            }

            this.defaultGroupCache[maxTextures] = new UniformGroup({ uSamplers: sampleValues }, true);

            let fragmentSrc = this.fragTemplate;

            for (let i = 0; i < loops.length; i++)
            {
                fragmentSrc = fragmentSrc.replace(/%count%/gi, `${maxTextures}`);
                fragmentSrc = fragmentSrc.replace(new RegExp(loops[i].loopLabel, 'gi'),
                    this.generateSampleSrc(maxTextures, loops[i]));
            }

            this.programCache[maxTextures] = new Program(this.vertexSrc, fragmentSrc);
        }

        // TODO: move this to generator parameters
        const uniforms = {
            tint: new Float32Array([1, 1, 1, 1]),
            translationMatrix: new Matrix(),
            default: this.defaultGroupCache[maxTextures],
        };

        return new Shader(this.programCache[maxTextures], uniforms);
    }

    generateSampleSrc(maxTextures: number, loop: ILoopDescriptor): string
    {
        let src = '';

        src += '\n';
        src += '\n';

        for (let i = 0; i < maxTextures; i++)
        {
            if (i > 0)
            {
                src += '\nelse ';
            }

            if (i < maxTextures - 1)
            {
                src += `if(${loop.inTex} < ${i}.5)`;
            }

            src += '\n{';
            src += `\n\t${loop.outColor} = texture2D(uSamplers[${i}], ${loop.inCoord});`;
            src += '\n}';
        }

        src += '\n';
        src += '\n';

        return src;
    }
}
