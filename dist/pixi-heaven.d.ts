/// <reference types="pixi.js" />
declare module PIXI.heaven.webgl {
    class BatchBuffer {
        vertices: ArrayBuffer;
        float32View: Float32Array;
        uint32View: Uint32Array;
        constructor(size: number);
        destroy(): void;
    }
}
declare module PIXI.heaven.webgl {
    function generateMultiTextureShader(vertexSrc: string, fragmentSrc: string, gl: WebGLRenderingContext, maxTextures: number): PIXI.Shader;
}
declare module PIXI {
    interface ObjectRenderer {
        renderer: WebGLRenderer;
    }
    interface BaseTexture {
        _virtalBoundId: number;
    }
}
declare module PIXI.heaven.webgl {
    import BaseTexture = PIXI.BaseTexture;
    import ObjectRenderer = PIXI.ObjectRenderer;
    import GLBuffer = PIXI.glCore.GLBuffer;
    import VertexArrayObject = PIXI.glCore.VertexArrayObject;
    import WebGLRenderer = PIXI.WebGLRenderer;
    import Sprite = PIXI.Sprite;
    class BatchGroup {
        textures: Array<BaseTexture>;
        textureCount: number;
        ids: Array<Number>;
        size: number;
        start: number;
        blend: number;
        uniforms: any;
    }
    abstract class MultiTextureSpriteRenderer extends ObjectRenderer {
        shaderVert: string;
        shaderFrag: string;
        MAX_TEXTURES_LOCAL: number;
        abstract createVao(vertexBuffer: GLBuffer): PIXI.glCore.VertexArrayObject;
        abstract fillVertices(float32View: Float32Array, uint32View: Uint32Array, index: number, sprite: any, textureId: number): void;
        getUniforms(spr: PIXI.Sprite): any;
        syncUniforms(obj: any): void;
        vertSize: number;
        vertByteSize: number;
        size: number;
        buffers: Array<BatchBuffer>;
        indices: Uint16Array;
        shader: PIXI.Shader;
        currentIndex: number;
        groups: Array<BatchGroup>;
        sprites: Array<Sprite>;
        indexBuffer: GLBuffer;
        vertexBuffers: Array<GLBuffer>;
        vaos: Array<VertexArrayObject>;
        vao: VertexArrayObject;
        vaoMax: number;
        vertexCount: number;
        MAX_TEXTURES: number;
        constructor(renderer: WebGLRenderer);
        onContextChange(): void;
        onPrerender(): void;
        render(sprite: Sprite): void;
        flush(): void;
        start(): void;
        stop(): void;
        destroy(): void;
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
        darkR: number;
        darkG: number;
        darkB: number;
        lightR: number;
        lightG: number;
        lightB: number;
        alpha: number;
        pma: boolean;
        tintBGR: number;
        setLight(R: number, G: number, B: number): void;
        setDark(R: number, G: number, B: number): void;
        clear(): void;
        invalidate(): void;
        updateTransformLocal(): void;
        updateTransform(): void;
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
declare module PIXI.heaven {
    class Sprite extends PIXI.Sprite {
        color: ColorTransform;
        constructor(texture: PIXI.Texture);
        _tintRGB: number;
        tint: number;
        updateTransform(): void;
        _onTextureUpdate(): void;
    }
}
declare module PIXI.heaven {
}
declare module PIXI.heaven {
    class SpriteModel {
    }
}
declare module PIXI.heaven {
}
declare module PIXI.heaven.utils {
    function createIndicesForQuads(size: number): Uint16Array;
    function isPow2(v: number): boolean;
    function nextPow2(v: number): number;
    function log2(v: number): number;
}
