declare module PIXI.heaven {
}
declare module PIXI.heaven {
    interface IFrameObject {
        texture: PIXI.Texture;
        time: number;
    }
    interface ITextureAnimationTarget {
        texture: PIXI.Texture;
        animState: AnimationState;
    }
    class AnimationState {
        texture: PIXI.Texture;
        _textures: Array<PIXI.Texture>;
        _durations: Array<number>;
        _autoUpdate: boolean;
        animationSpeed: number;
        _target: ITextureAnimationTarget;
        loop: boolean;
        onComplete: Function;
        onFrameChange: Function;
        onLoop: Function;
        _currentTime: number;
        playing: boolean;
        constructor(textures: Array<PIXI.Texture> | Array<IFrameObject>, autoUpdate?: boolean);
        stop(): void;
        play(): void;
        gotoAndStop(frameNumber: number): void;
        gotoAndPlay(frameNumber: number): void;
        update(deltaTime: number): void;
        updateTexture(): void;
        bind(target: ITextureAnimationTarget): void;
        static fromFrames(frames: Array<string>): AnimationState;
        static fromImages(images: Array<string>): AnimationState;
        get totalFrames(): number;
        get textures(): PIXI.Texture[];
        set textures(value: PIXI.Texture[]);
        get currentFrame(): number;
    }
}
declare module PIXI.heaven {
    class TexturePolygon {
        vertices: ArrayLike<number>;
        uvs: ArrayLike<number>;
        indices: ArrayLike<number>;
        constructor(vertices: ArrayLike<number>, uvs: ArrayLike<number>, indices: ArrayLike<number>);
    }
}
declare module PIXI.heaven {
    enum CLAMP_OPTIONS {
        NEVER = 0,
        AUTO = 1,
        ALWAYS = 2
    }
    let settings: {
        MESH_CLAMP: CLAMP_OPTIONS;
        BLEND_ADD_UNITY: boolean;
    };
}
declare module PIXI.heaven {
    class BitmapText extends PIXI.BitmapText {
        constructor(text: string, style?: any);
        color: ColorTransform;
        get tint(): number;
        set tint(value: number);
        addChild(...additionalChildren: PIXI.DisplayObject[]): any;
        _render(renderer: PIXI.Renderer): void;
    }
}
declare module PIXI.heaven {
    class ColorTransform {
        dark: Float32Array;
        light: Float32Array;
        _updateID: number;
        _currentUpdateID: number;
        darkRgba: number;
        lightRgba: number;
        hasNoTint: boolean;
        get darkR(): number;
        set darkR(value: number);
        get darkG(): number;
        set darkG(value: number);
        get darkB(): number;
        set darkB(value: number);
        get lightR(): number;
        set lightR(value: number);
        get lightG(): number;
        set lightG(value: number);
        get lightB(): number;
        set lightB(value: number);
        get alpha(): number;
        set alpha(value: number);
        get pma(): boolean;
        set pma(value: boolean);
        get tintBGR(): number;
        set tintBGR(value: number);
        setLight(R: number, G: number, B: number): void;
        setDark(R: number, G: number, B: number): void;
        clear(): void;
        invalidate(): void;
        updateTransformLocal(): void;
        updateTransform(): void;
    }
}
declare module PIXI.heaven {
    class Mesh extends PIXI.Mesh {
        color: ColorTransform;
        maskSprite: PIXI.Sprite;
        useSpriteMask: boolean;
        constructor(geometry: PIXI.Geometry, shader: MeshMaterial, state: PIXI.State, drawMode?: number);
        _renderDefault(renderer: PIXI.Renderer): void;
        _render(renderer: PIXI.Renderer): void;
        _renderToBatch(renderer: PIXI.Renderer): void;
    }
    class SimpleMesh extends Mesh {
        constructor(texture: PIXI.Texture, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array, drawMode?: number);
        autoUpdate: boolean;
        get vertices(): Float32Array;
        set vertices(value: Float32Array);
        _render(renderer: PIXI.Renderer): void;
    }
}
declare module PIXI.heaven {
    class MeshMaterial extends PIXI.Shader {
        uvMatrix: PIXI.TextureMatrix;
        batchable: boolean;
        readonly allowTrim: boolean;
        pluginName: string;
        color: ColorTransform;
        constructor(uSampler: PIXI.Texture, options?: any);
        get texture(): any;
        set texture(value: any);
        set alpha(value: number);
        get alpha(): number;
        set tint(value: number);
        get tint(): number;
        update(): void;
    }
}
declare module PIXI {
    interface Sprite {
        convertToHeaven(): PIXI.heaven.Sprite;
    }
    interface Mesh {
        convertToHeaven(): void;
    }
    interface Graphics {
        convertToHeaven(): void;
    }
    interface Container {
        convertToHeaven(): void;
        convertSubtreeToHeaven(): void;
    }
}
declare module PIXI.heaven {
}
declare module PIXI.heaven.webgl {
    class DarkLightGeometry extends PIXI.Geometry {
        _buffer: PIXI.Buffer;
        _indexBuffer: PIXI.Buffer;
        constructor(_static?: boolean);
    }
    class DarkLightPluginFactory {
        static create(options: any): any;
    }
}
declare module PIXI.heaven.webgl {
    interface ILoopDescriptor {
        loopLabel: string;
        inTex: string;
        inCoord: string;
        outColor: string;
    }
    import Program = PIXI.Program;
    import UniformGroup = PIXI.UniformGroup;
    import Shader = PIXI.Shader;
    export class LoopShaderGenerator {
        vertexSrc: string;
        fragTemplate: string;
        loops: Array<ILoopDescriptor>;
        programCache: {
            [key: number]: Program;
        };
        defaultGroupCache: {
            [key: number]: UniformGroup;
        };
        constructor(vertexSrc: string, fragTemplate: string, loops: Array<ILoopDescriptor>);
        generateShader(maxTextures: number): Shader;
        generateSampleSrc(maxTextures: number, loop: ILoopDescriptor): string;
    }
    export {};
}
declare module PIXI.heaven.webgl {
    class MaskedGeometry extends PIXI.Geometry {
        _buffer: PIXI.Buffer;
        _indexBuffer: PIXI.Buffer;
        constructor(_static?: boolean);
    }
    class MaskedPluginFactory {
        static MAX_TEXTURES: number;
        static create(options: any): any;
    }
}
declare module PIXI.heaven {
    class Sprite extends PIXI.Sprite implements ITextureAnimationTarget {
        color: ColorTransform;
        maskSprite: PIXI.Sprite;
        maskVertexData: Float32Array;
        uvs: Float32Array;
        indices: Uint16Array;
        animState: AnimationState;
        blendAddUnity: boolean;
        constructor(texture: PIXI.Texture);
        get _tintRGB(): number;
        set _tintRGB(value: number);
        get tint(): number;
        set tint(value: number);
        _onTextureUpdate(): void;
        _render(renderer: PIXI.Renderer): void;
        _calculateBounds(): void;
        calculateVertices(): void;
        calculateMaskVertices(): void;
        destroy(options?: any): void;
    }
}
declare module PIXI.heaven.utils {
    function createIndicesForQuads(size: number): Uint16Array;
    function isPow2(v: number): boolean;
    function nextPow2(v: number): number;
    function log2(v: number): number;
}
declare module PIXI.heaven {
}
declare module PIXI.heaven {
    class Spine extends PIXI.spine.Spine {
        hasSpriteMask: boolean;
        color: ColorTransform;
        constructor(spineData: PIXI.spine.core.SkeletonData);
        newSprite(tex: PIXI.Texture): any;
        newMesh(texture: PIXI.Texture, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array, drawMode?: number): any;
    }
    class SpineMesh extends SimpleMesh {
        region: PIXI.spine.core.TextureRegion;
        spine: Spine;
        constructor(texture: PIXI.Texture, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array, drawMode?: number, spine?: Spine);
        _render(renderer: PIXI.Renderer): void;
    }
    class SpineSprite extends Sprite {
        region: PIXI.spine.core.TextureRegion;
        spine: Spine;
        constructor(tex: PIXI.Texture, spine: Spine);
        _render(renderer: PIXI.Renderer): void;
    }
}
