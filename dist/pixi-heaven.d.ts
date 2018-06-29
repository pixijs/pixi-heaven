/// <reference types="pixi.js" />
/// <reference types="webgl-ext" />
declare module PIXI.heaven {
    import Rectangle = PIXI.Rectangle;
    class AtlasNode<T> {
        childs: Array<AtlasNode<T>>;
        rect: Rectangle;
        data: T;
        insert(atlasWidth: number, atlasHeight: number, width: number, height: number, data: T): AtlasNode<T>;
    }
}
declare module PIXI.heaven {
}
declare module PIXI.heaven {
    import BaseTexture = PIXI.BaseTexture;
    import Texture = PIXI.Texture;
    import WebGLRenderer = PIXI.WebGLRenderer;
    class AtlasEntry {
        baseTexture: BaseTexture;
        atlas: IAtlas;
        currentNode: AtlasNode<AtlasEntry>;
        currentAtlas: SuperAtlas;
        width: number;
        height: number;
        nodeUpdateID: number;
        regions: Array<TextureRegion>;
        constructor(atlas: IAtlas, baseTexture: BaseTexture);
    }
    interface IRepackResult {
        failed: Array<AtlasEntry>;
        apply(): void;
    }
    interface IAtlas {
        add(texture: BaseTexture | Texture, swapCache?: boolean): TextureRegion;
        addHash(textures: {
            [key: string]: Texture;
        }, swapCache?: boolean): {
            [key: string]: TextureRegion;
        };
        repack(): IRepackResult;
        prepare(renderer: WebGLRenderer): Promise<void>;
    }
}
declare module PIXI.heaven {
    import Texture = PIXI.Texture;
    class TextureRegion extends PIXI.Texture {
        uid: number;
        proxied: Texture;
        entry: AtlasEntry;
        constructor(entry: AtlasEntry, texture?: PIXI.Texture);
        updateFrame(): void;
    }
}
declare module PIXI.heaven {
    interface ITextureResource {
        onTextureUpload(renderer: PIXI.WebGLRenderer, baseTexture: PIXI.BaseTexture, glTexture: PIXI.glCore.GLTexture): boolean;
        onTextureTag?(baseTexture: PIXI.BaseTexture): void;
        onTextureNew?(baseTexture: PIXI.BaseTexture): void;
        onTextureDestroy?(baseTexture: PIXI.BaseTexture): boolean;
    }
}
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
        buffersIndex: Array<Uint16Array>;
        bigMeshVertexBuffer: BatchBuffer;
        indices: Uint16Array;
        shader: PIXI.Shader;
        currentIndex: number;
        groups: Array<BatchGroup>;
        sprites: Array<any>;
        countVertex: number;
        countIndex: number;
        indexBuffer: GLBuffer;
        vertexBuffers: Array<GLBuffer>;
        indexBuffers: Array<GLBuffer>;
        vaos: Array<VertexArrayObject>;
        vao: VertexArrayObject;
        vaoMax: number;
        vertexCount: number;
        MAX_TEXTURES: number;
        changedIndexBuffer: number;
        constructor(renderer: WebGLRenderer);
        genShader(): void;
        onContextChange(): void;
        onPrerender(): void;
        render(element: any): void;
        renderSingleMesh(mesh: mesh.Mesh): void;
        checkVaoMax(): boolean;
        flush(): void;
        start(): void;
        stop(): void;
        destroy(): void;
    }
}
declare module PIXI.heaven {
    interface Extensions {
        depthTexture: WebGLDepthTexture;
        floatTexture: OESTextureFloat;
    }
    class AtlasManager {
        renderer: PIXI.WebGLRenderer;
        gl: WebGLRenderingContext;
        extensions: Extensions;
        constructor(renderer: PIXI.WebGLRenderer);
        onContextChange: (gl: WebGLRenderingContext) => void;
        updateTexture: (texture_: PIXI.BaseTexture | PIXI.Texture, location?: number) => any;
        setStyle(texture: PIXI.BaseTexture, glTexture: PIXI.glCore.GLTexture): void;
        destroy(): void;
    }
}
declare module PIXI {
    interface BaseTexture {
        uid: number;
        _updateID: number;
        _mips: Array<ImageData>;
        resource: PIXI.heaven.ITextureResource;
        forceUploadStyle: boolean;
        generateMips(levels: number): void;
    }
    interface BaseRenderTexture {
        uid: number;
        generateMips(levels: number): void;
    }
}
declare module PIXI.heaven {
}
declare module PIXI {
    namespace GroupD8 {
        function isVertical(rotation: number): boolean;
    }
}
declare module PIXI {
    interface BaseTexture {
        uid: number;
        _updateID: number;
        resource: PIXI.heaven.ITextureResource;
        forceUploadStyle: boolean;
    }
    interface BaseRenderTexture {
        uid: number;
    }
}
declare module PIXI.glCore {
    interface GLTexture {
        _updateID: number;
    }
}
declare module PIXI.heaven {
}
declare module PIXI.loaders {
    interface Resource {
        spritesheet?: PIXI.Spritesheet;
    }
}
declare module PIXI.heaven {
    import Resource = PIXI.loaders.Resource;
    function atlasChecker(): (resource: Resource, next: () => any) => any;
}
declare module PIXI.heaven.mesh {
    class Mesh extends PIXI.Container {
        _texture: PIXI.Texture;
        uvs: Float32Array;
        vertices: Float32Array;
        indices: Uint16Array;
        colors: Uint32Array;
        drawMode: number;
        dirty: number;
        indexDirty: number;
        blendMode: number;
        canvasPadding: number;
        tintRgb: Float32Array;
        _glDatas: {
            [key: number]: any;
        };
        uploadUvTransform: boolean;
        pluginName: string;
        _uvTransform: PIXI.TextureMatrix;
        vertexData: Float32Array;
        maskVertexData: Float32Array;
        maskSprite: PIXI.Sprite;
        constructor(texture?: PIXI.Texture, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array, drawMode?: number);
        updateTransform(): void;
        _renderWebGL(renderer: PIXI.WebGLRenderer): void;
        _renderCanvas(renderer: PIXI.CanvasRenderer): void;
        _onTextureUpdate(): void;
        multiplyUvs(): void;
        refresh(forceUpdate?: boolean): void;
        _refreshUvs(): void;
        _calculateBounds(): void;
        containsPoint(point: PIXI.PointLike): boolean;
        calculateVertices(): void;
        calculateMaskVertices(): void;
        texture: PIXI.Texture;
        enableColors(): void;
        setRGB(rgb: Float32Array, dark: boolean): void;
        color: ColorTransform;
        tint: number;
        static DRAW_MODES: {
            TRIANGLE_MESH: number;
            TRIANGLES: number;
        };
    }
}
declare module PIXI.heaven.mesh {
    class Plane extends Mesh {
        _verticesX: number;
        _verticesY: number;
        _direction: number;
        _lastWidth: number;
        _lastHeight: number;
        _width: number;
        _height: number;
        _dimensionsID: number;
        _lastDimensionsID: number;
        _verticesID: number;
        _lastVerticesID: number;
        _uvsID: number;
        _lastUvsID: number;
        _anchor: PIXI.ObservablePoint;
        autoResetVertices: boolean;
        calculatedVertices: Float32Array;
        constructor(texture: PIXI.Texture, verticesX?: number, verticesY?: number, direction?: number);
        verticesX: number;
        verticesY: number;
        direction: number;
        width: number;
        height: number;
        anchor: PIXI.ObservablePoint;
        _onAnchorUpdate(): void;
        invalidateVertices(): void;
        invalidateUvs(): void;
        invalidate(): void;
        refresh(forceUpdate?: boolean): void;
        refreshDimensions(forceUpdate?: boolean): void;
        refreshVertices(forceUpdate?: boolean): void;
        _refreshUvs(): void;
        calcVertices(): void;
        calcColors(): void;
        _refreshVertices(): void;
        reset(): void;
    }
}
declare module PIXI.heaven.mesh {
    class NineSlicePlane extends Plane {
        _leftWidth: number;
        _rightWidth: number;
        _topHeight: number;
        _bottomHeight: number;
        constructor(texture: PIXI.Texture, leftWidth?: number, topHeight?: number, rightWidth?: number, bottomHeight?: number);
        leftWidth: number;
        rightWidth: number;
        topHeight: number;
        bottomHeight: number;
        _refreshVertices(): void;
        _refreshUvs(): void;
        updateHorizontalVertices(): void;
        updateVerticalVertices(): void;
        _renderCanvas(renderer: PIXI.CanvasRenderer): void;
        drawSegment(context: CanvasRenderingContext2D, textureSource: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, w: number, h: number, x1: number, y1: number, x2: number, y2: number): void;
    }
}
declare module PIXI.heaven.mesh {
    class Rope extends Plane {
        points: Array<RopePoint>;
        calculatedPoints: Array<RopePoint>;
        autoUpdate: boolean;
        constructor(texture: PIXI.Texture, verticesX: Array<RopePoint> | number, verticesY?: number, direction?: number);
        updateTransform(): void;
        _onAnchorUpdate(): void;
        _checkPointsLen(): void;
        refresh(forceUpdate?: boolean): void;
        calcPoints(): void;
        resetPoints(): void;
        resetOffsets(): void;
        reset(): void;
        calcVertices(): void;
        calcColors(): void;
        enableColors(): void;
    }
}
declare module PIXI.heaven.mesh {
    class RopePoint extends PIXI.Point {
        offset: number;
        scale: number;
        _color: ColorTransform;
        constructor(x?: number, y?: number, offset?: number, scale?: number);
        color: ColorTransform;
        clone(): RopePoint;
        copy(p: PIXI.Point | RopePoint): void;
        set(x: number, y: number, offset?: number, scale?: number): void;
    }
}
declare module PIXI.heaven.mesh {
    class MeshColoredRenderer extends PIXI.ObjectRenderer {
        static vert: string;
        static frag: string;
        static fragTrim: string;
        shader: PIXI.Shader;
        shaderTrim: PIXI.Shader;
        onContextChange(): void;
        render(mesh: Mesh): void;
    }
}
declare module PIXI.heaven.mesh {
    class MeshHeavenRenderer extends PIXI.ObjectRenderer {
        static vert: string;
        static frag: string;
        static fragTrim: string;
        shader: PIXI.Shader;
        shaderTrim: PIXI.Shader;
        onContextChange(): void;
        render(mesh: Mesh): void;
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
    let settings: {
        MESH_PLUGIN: string;
        SPINE_MESH_PLUGIN: string;
    };
}
declare module PIXI.heaven {
    interface IAtlasOptions {
        width?: number;
        height?: number;
        loadFactor?: number;
        repackBeforeResize?: boolean;
        repackAfterResize?: boolean;
        algoTreeResize?: boolean;
        maxSize?: number;
        format?: number;
        hasAllFields?: boolean;
        mipLevels?: number;
        padding?: number;
    }
    class AtlasOptions implements IAtlasOptions {
        width: number;
        height: number;
        loadFactor: number;
        repackBeforeResize: boolean;
        repackAfterResize: boolean;
        algoTreeResize: boolean;
        maxSize: number;
        mipLevels: number;
        padding: number;
        format: number;
        static MAX_SIZE: number;
        constructor(src: IAtlasOptions);
        assign(src: IAtlasOptions): this;
    }
}
declare module PIXI.heaven {
    import BaseTexture = PIXI.BaseTexture;
    class SuperAtlasEntry {
        baseTexture: BaseTexture;
        superAtlas: SuperAtlas;
    }
    class AtlasTree implements IRepackResult {
        failed: Array<AtlasEntry>;
        root: AtlasNode<AtlasEntry>;
        good: Array<AtlasEntry>;
        hash: {
            [key: number]: AtlasNode<AtlasEntry>;
        };
        apply(): void;
    }
    class SuperAtlas implements ITextureResource, IAtlas {
        static MAX_SIZE: number;
        baseTexture: PIXI.BaseTexture;
        format: number;
        width: number;
        height: number;
        options: AtlasOptions;
        all: {
            [key: number]: AtlasEntry;
        };
        tree: AtlasTree;
        onTextureNew(baseTexture: PIXI.BaseTexture): void;
        static create(options: IAtlasOptions): SuperAtlas;
        destroy(): void;
        add(texture: BaseTexture | PIXI.Texture, swapCache?: boolean): TextureRegion;
        addHash(textures: {
            [key: string]: PIXI.Texture;
        }, swapCache?: boolean): {
            [key: string]: TextureRegion;
        };
        insert(entry: AtlasEntry): void;
        remove(entry: AtlasEntry): void;
        tryInsert(entry: AtlasEntry): boolean;
        private createAtlasRoot();
        repack(failOnFirst?: boolean): IRepackResult;
        prepare(renderer: PIXI.WebGLRenderer): Promise<void>;
        imageTextureRebuildUpdateID: number;
        onTextureUpload(renderer: PIXI.WebGLRenderer, baseTexture: PIXI.BaseTexture, tex: PIXI.glCore.GLTexture): boolean;
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
        maskSprite: PIXI.Sprite;
        maskVertexData: Float32Array;
        uvs: Float32Array;
        indices: Uint16Array;
        constructor(texture: PIXI.Texture);
        _tintRGB: number;
        tint: number;
        updateTransform(): void;
        _onTextureUpdate(): void;
        _calculateBounds(): void;
        calculateVertices(): void;
        calculateMaskVertices(): void;
    }
}
declare module PIXI.heaven {
}
declare module PIXI.heaven.webgl {
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
declare module PIXI.heaven.spine {
    class Spine extends PIXI.spine.Spine {
        hasSpriteMask: boolean;
        color: ColorTransform;
        constructor(spineData: PIXI.spine.core.SkeletonData);
        newSprite(tex: PIXI.Texture): any;
        newMesh(texture: PIXI.Texture, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array, drawMode?: number): any;
    }
    class SpineMesh extends mesh.Mesh {
        region: PIXI.spine.core.TextureRegion;
        spine: Spine;
        constructor(texture: PIXI.Texture, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array, drawMode?: number, spine?: Spine);
        _renderWebGL(renderer: PIXI.WebGLRenderer): void;
    }
    class SpineSprite extends Sprite {
        region: PIXI.spine.core.TextureRegion;
        spine: Spine;
        constructor(tex: PIXI.Texture, spine: Spine);
        _renderWebGL(renderer: PIXI.WebGLRenderer): void;
    }
}
