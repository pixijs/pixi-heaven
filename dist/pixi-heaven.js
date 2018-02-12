var pixi_heaven;
(function (pixi_heaven) {
    var Resource = PIXI.loaders.Resource;
    function atlasChecker() {
        return function (resource, next) {
            var atlas = resource.metadata.runtimeAtlas;
            if (!atlas) {
                return next();
            }
            if (resource.type === Resource.TYPE.IMAGE) {
                if (resource.texture) {
                    resource.texture = atlas.add(resource.texture, true);
                }
                return next();
            }
            if (resource.type === Resource.TYPE.JSON &&
                resource.spritesheet) {
                resource.spritesheet.textures = atlas.addHash(resource.spritesheet.textures, true);
                resource.textures = resource.spritesheet.textures;
                return next();
            }
            next();
        };
    }
    pixi_heaven.atlasChecker = atlasChecker;
    PIXI.loaders.Loader.addPixiMiddleware(atlasChecker);
    PIXI.loader.use(atlasChecker());
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var utils;
    (function (utils) {
        function createIndicesForQuads(size) {
            var totalIndices = size * 6;
            var indices = new Uint16Array(totalIndices);
            for (var i = 0, j = 0; i < totalIndices; i += 6, j += 4) {
                indices[i + 0] = j + 0;
                indices[i + 1] = j + 1;
                indices[i + 2] = j + 2;
                indices[i + 3] = j + 0;
                indices[i + 4] = j + 2;
                indices[i + 5] = j + 3;
            }
            return indices;
        }
        utils.createIndicesForQuads = createIndicesForQuads;
        function isPow2(v) {
            return !(v & (v - 1)) && (!!v);
        }
        utils.isPow2 = isPow2;
        function nextPow2(v) {
            v += +(v === 0);
            --v;
            v |= v >>> 1;
            v |= v >>> 2;
            v |= v >>> 4;
            v |= v >>> 8;
            v |= v >>> 16;
            return v + 1;
        }
        utils.nextPow2 = nextPow2;
        function log2(v) {
            var r, shift;
            r = +(v > 0xFFFF) << 4;
            v >>>= r;
            shift = +(v > 0xFF) << 3;
            v >>>= shift;
            r |= shift;
            shift = +(v > 0xF) << 2;
            v >>>= shift;
            r |= shift;
            shift = +(v > 0x3) << 1;
            v >>>= shift;
            r |= shift;
            return r | (v >> 1);
        }
        utils.log2 = log2;
    })(utils = pixi_heaven.utils || (pixi_heaven.utils = {}));
})(pixi_heaven || (pixi_heaven = {}));
PIXI.heaven = pixi_heaven;
var pixi_heaven;
(function (pixi_heaven) {
    var Rectangle = PIXI.Rectangle;
    var INF = 1 << 20;
    var AtlasNode = (function () {
        function AtlasNode() {
            this.childs = [];
            this.rect = new Rectangle(0, 0, INF, INF);
            this.data = null;
        }
        AtlasNode.prototype.insert = function (atlasWidth, atlasHeight, width, height, data) {
            if (this.childs.length > 0) {
                var newNode = this.childs[0].insert(atlasWidth, atlasHeight, width, height, data);
                if (newNode != null) {
                    return newNode;
                }
                return this.childs[1].insert(atlasWidth, atlasHeight, width, height, data);
            }
            else {
                var rect = this.rect;
                if (this.data != null)
                    return null;
                var w = Math.min(rect.width, atlasWidth - rect.x);
                if (width > rect.width ||
                    width > atlasWidth - rect.x ||
                    height > rect.height ||
                    height > atlasHeight - rect.y)
                    return null;
                if (width == rect.width && height == rect.height) {
                    this.data = data;
                    return this;
                }
                this.childs.push(new AtlasNode());
                this.childs.push(new AtlasNode());
                var dw = rect.width - width;
                var dh = rect.height - height;
                if (dw > dh) {
                    this.childs[0].rect = new Rectangle(rect.x, rect.y, width, rect.height);
                    this.childs[1].rect = new Rectangle(rect.x + width, rect.y, rect.width - width, rect.height);
                }
                else {
                    this.childs[0].rect = new Rectangle(rect.x, rect.y, rect.width, height);
                    this.childs[1].rect = new Rectangle(rect.x, rect.y + height, rect.width, rect.height - height);
                }
                return this.childs[0].insert(atlasWidth, atlasHeight, width, height, data);
            }
        };
        return AtlasNode;
    }());
    pixi_heaven.AtlasNode = AtlasNode;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var AtlasEntry = (function () {
        function AtlasEntry(atlas, baseTexture) {
            this.nodeUpdateID = 0;
            this.regions = [];
            this.baseTexture = baseTexture;
            this.width = baseTexture.width;
            this.height = baseTexture.height;
            this.atlas = atlas;
        }
        return AtlasEntry;
    }());
    pixi_heaven.AtlasEntry = AtlasEntry;
})(pixi_heaven || (pixi_heaven = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var pixi_heaven;
(function (pixi_heaven) {
    var Texture = PIXI.Texture;
    var Rectangle = PIXI.Rectangle;
    var TextureRegion = (function (_super) {
        __extends(TextureRegion, _super);
        function TextureRegion(entry, texture) {
            if (texture === void 0) { texture = new Texture(entry.baseTexture); }
            var _this = _super.call(this, entry.currentAtlas ? entry.currentAtlas.baseTexture : texture.baseTexture, entry.currentNode ? new Rectangle(texture.frame.x + entry.currentNode.rect.x, texture.frame.y + entry.currentNode.rect.y, texture.frame.width, texture.frame.height) : texture.frame.clone(), texture.orig, texture.trim, texture.rotate) || this;
            _this.uid = PIXI.utils.uid();
            _this.proxied = texture;
            _this.entry = entry;
            return _this;
        }
        TextureRegion.prototype.updateFrame = function () {
            var texture = this.proxied;
            var entry = this.entry;
            var frame = this._frame;
            if (entry.currentNode) {
                this.baseTexture = entry.currentAtlas.baseTexture;
                frame.x = texture.frame.x + entry.currentNode.rect.x;
                frame.y = texture.frame.y + entry.currentNode.rect.y;
            }
            else {
                this.baseTexture = texture.baseTexture;
                frame.x = texture.frame.x;
                frame.y = texture.frame.y;
            }
            frame.width = texture.frame.width;
            frame.height = texture.frame.height;
            this._updateUvs();
        };
        return TextureRegion;
    }(PIXI.Texture));
    pixi_heaven.TextureRegion = TextureRegion;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var webgl;
    (function (webgl) {
        var BatchBuffer = (function () {
            function BatchBuffer(size) {
                this.vertices = new ArrayBuffer(size);
                this.float32View = new Float32Array(this.vertices);
                this.uint32View = new Uint32Array(this.vertices);
            }
            BatchBuffer.prototype.destroy = function () {
                this.vertices = null;
            };
            return BatchBuffer;
        }());
        webgl.BatchBuffer = BatchBuffer;
    })(webgl = pixi_heaven.webgl || (pixi_heaven.webgl = {}));
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var webgl;
    (function (webgl) {
        function generateMultiTextureShader(vertexSrc, fragmentSrc, gl, maxTextures) {
            fragmentSrc = fragmentSrc.replace(/%count%/gi, maxTextures + '');
            fragmentSrc = fragmentSrc.replace(/%forloop%/gi, generateSampleSrc(maxTextures));
            var shader = new PIXI.Shader(gl, vertexSrc, fragmentSrc);
            var sampleValues = new Int32Array(maxTextures);
            for (var i = 0; i < maxTextures; i++) {
                sampleValues[i] = i;
            }
            shader.bind();
            shader.uniforms.uSamplers = sampleValues;
            return shader;
        }
        webgl.generateMultiTextureShader = generateMultiTextureShader;
        function generateSampleSrc(maxTextures) {
            var src = '';
            src += '\n';
            src += '\n';
            for (var i = 0; i < maxTextures; i++) {
                if (i > 0) {
                    src += '\nelse ';
                }
                if (i < maxTextures - 1) {
                    src += "if(textureId == " + i + ".0)";
                }
                src += '\n{';
                src += "\n\ttexColor = texture2D(uSamplers[" + i + "], texCoord);";
                src += '\n}';
            }
            src += '\n';
            src += '\n';
            return src;
        }
    })(webgl = pixi_heaven.webgl || (pixi_heaven.webgl = {}));
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var webgl;
    (function (webgl) {
        var ObjectRenderer = PIXI.ObjectRenderer;
        var settings = PIXI.settings;
        var GLBuffer = PIXI.glCore.GLBuffer;
        var premultiplyBlendMode = PIXI.utils.premultiplyBlendMode;
        var TICK = 1 << 20;
        var BatchGroup = (function () {
            function BatchGroup() {
                this.textures = [];
                this.textureCount = 0;
                this.ids = [];
                this.size = 0;
                this.start = 0;
                this.blend = PIXI.BLEND_MODES.NORMAL;
                this.uniforms = null;
            }
            return BatchGroup;
        }());
        webgl.BatchGroup = BatchGroup;
        var MultiTextureSpriteRenderer = (function (_super) {
            __extends(MultiTextureSpriteRenderer, _super);
            function MultiTextureSpriteRenderer(renderer) {
                var _this = _super.call(this, renderer) || this;
                _this.shaderVert = '';
                _this.shaderFrag = '';
                _this.MAX_TEXTURES_LOCAL = 32;
                _this.vertSize = 5;
                _this.vertByteSize = _this.vertSize * 4;
                _this.size = settings.SPRITE_BATCH_SIZE;
                _this.currentIndex = 0;
                _this.sprites = [];
                _this.vertexBuffers = [];
                _this.vaos = [];
                _this.vaoMax = 2;
                _this.vertexCount = 0;
                _this.MAX_TEXTURES = 1;
                _this.indices = pixi_heaven.utils.createIndicesForQuads(_this.size);
                _this.groups = [];
                for (var k = 0; k < _this.size; k++) {
                    _this.groups[k] = new BatchGroup();
                }
                _this.vaoMax = 2;
                _this.vertexCount = 0;
                _this.renderer.on('prerender', _this.onPrerender, _this);
                return _this;
            }
            MultiTextureSpriteRenderer.prototype.getUniforms = function (spr) {
                return null;
            };
            MultiTextureSpriteRenderer.prototype.syncUniforms = function (obj) {
                if (!obj)
                    return;
                var sh = this.shader;
                for (var key in obj) {
                    sh.uniforms[key] = obj[key];
                }
            };
            MultiTextureSpriteRenderer.prototype.genShader = function () {
                var gl = this.renderer.gl;
                this.MAX_TEXTURES = Math.min(this.MAX_TEXTURES_LOCAL, this.renderer.plugins['sprite'].MAX_TEXTURES);
                this.shader = webgl.generateMultiTextureShader(this.shaderVert, this.shaderFrag, gl, this.MAX_TEXTURES);
            };
            MultiTextureSpriteRenderer.prototype.onContextChange = function () {
                var gl = this.renderer.gl;
                this.genShader();
                this.indexBuffer = GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);
                this.renderer.bindVao(null);
                var attrs = this.shader.attributes;
                for (var i = 0; i < this.vaoMax; i++) {
                    var vertexBuffer = this.vertexBuffers[i] = GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
                    this.vaos[i] = this.createVao(vertexBuffer);
                }
                if (!this.buffers) {
                    this.buffers = [];
                    for (var i = 1; i <= pixi_heaven.utils.nextPow2(this.size); i *= 2) {
                        this.buffers.push(new webgl.BatchBuffer(i * 4 * this.vertByteSize));
                    }
                }
                this.vao = this.vaos[0];
            };
            MultiTextureSpriteRenderer.prototype.onPrerender = function () {
                this.vertexCount = 0;
            };
            MultiTextureSpriteRenderer.prototype.render = function (sprite) {
                if (this.currentIndex >= this.size) {
                    this.flush();
                }
                if (!sprite._texture._uvs) {
                    return;
                }
                if (!sprite._texture.baseTexture) {
                    return;
                }
                this.sprites[this.currentIndex++] = sprite;
            };
            MultiTextureSpriteRenderer.prototype.flush = function () {
                if (this.currentIndex === 0) {
                    return;
                }
                var gl = this.renderer.gl;
                var MAX_TEXTURES = this.MAX_TEXTURES;
                var np2 = pixi_heaven.utils.nextPow2(this.currentIndex);
                var log2 = pixi_heaven.utils.log2(np2);
                var buffer = this.buffers[log2];
                var sprites = this.sprites;
                var groups = this.groups;
                var float32View = buffer.float32View;
                var uint32View = buffer.uint32View;
                var index = 0;
                var nextTexture;
                var currentTexture;
                var currentUniforms = null;
                var groupCount = 1;
                var textureCount = 0;
                var currentGroup = groups[0];
                var blendMode = premultiplyBlendMode[sprites[0]._texture.baseTexture.premultipliedAlpha ? 1 : 0][sprites[0].blendMode];
                currentGroup.textureCount = 0;
                currentGroup.start = 0;
                currentGroup.blend = blendMode;
                TICK++;
                var i;
                for (i = 0; i < this.currentIndex; ++i) {
                    var sprite = sprites[i];
                    nextTexture = sprite._texture.baseTexture;
                    var spriteBlendMode = premultiplyBlendMode[Number(nextTexture.premultipliedAlpha)][sprite.blendMode];
                    if (blendMode !== spriteBlendMode) {
                        blendMode = spriteBlendMode;
                        currentTexture = null;
                        textureCount = MAX_TEXTURES;
                        TICK++;
                    }
                    var uniforms = this.getUniforms(sprite);
                    if (currentUniforms !== uniforms) {
                        currentUniforms = uniforms;
                        currentTexture = null;
                        textureCount = MAX_TEXTURES;
                        TICK++;
                    }
                    if (currentTexture !== nextTexture) {
                        currentTexture = nextTexture;
                        if (nextTexture._enabled !== TICK) {
                            if (textureCount === MAX_TEXTURES) {
                                TICK++;
                                textureCount = 0;
                                currentGroup.size = i - currentGroup.start;
                                currentGroup = groups[groupCount++];
                                currentGroup.textureCount = 0;
                                currentGroup.blend = blendMode;
                                currentGroup.start = i;
                                currentGroup.uniforms = currentUniforms;
                            }
                            nextTexture._enabled = TICK;
                            nextTexture._virtalBoundId = textureCount;
                            currentGroup.textures[currentGroup.textureCount++] = nextTexture;
                            textureCount++;
                        }
                    }
                    this.fillVertices(float32View, uint32View, index, sprite, nextTexture._virtalBoundId);
                    index += this.vertSize * 4;
                }
                currentGroup.size = i - currentGroup.start;
                if (!settings.CAN_UPLOAD_SAME_BUFFER) {
                    if (this.vaoMax <= this.vertexCount) {
                        this.vaoMax++;
                        var attrs = this.shader.attributes;
                        var vertexBuffer = this.vertexBuffers[this.vertexCount] = GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
                        this.vaos[this.vertexCount] = this.createVao(vertexBuffer);
                    }
                    this.renderer.bindVao(this.vaos[this.vertexCount]);
                    this.vertexBuffers[this.vertexCount].upload(buffer.vertices, 0, false);
                    this.vertexCount++;
                }
                else {
                    this.vertexBuffers[this.vertexCount].upload(buffer.vertices, 0, true);
                }
                currentUniforms = null;
                for (i = 0; i < groupCount; i++) {
                    var group = groups[i];
                    var groupTextureCount = group.textureCount;
                    if (group.uniforms !== currentUniforms) {
                        this.syncUniforms(group.uniforms);
                    }
                    for (var j = 0; j < groupTextureCount; j++) {
                        this.renderer.bindTexture(group.textures[j], j, true);
                        group.textures[j]._virtalBoundId = -1;
                        var v = this.shader.uniforms.samplerSize;
                        if (v) {
                            v[0] = group.textures[j].realWidth;
                            v[1] = group.textures[j].realHeight;
                            this.shader.uniforms.samplerSize = v;
                        }
                    }
                    this.renderer.state.setBlendMode(group.blend);
                    gl.drawElements(gl.TRIANGLES, group.size * 6, gl.UNSIGNED_SHORT, group.start * 6 * 2);
                }
                this.currentIndex = 0;
            };
            MultiTextureSpriteRenderer.prototype.start = function () {
                this.renderer.bindShader(this.shader);
                if (settings.CAN_UPLOAD_SAME_BUFFER) {
                    this.renderer.bindVao(this.vaos[this.vertexCount]);
                    this.vertexBuffers[this.vertexCount].bind();
                }
            };
            MultiTextureSpriteRenderer.prototype.stop = function () {
                this.flush();
            };
            MultiTextureSpriteRenderer.prototype.destroy = function () {
                for (var i = 0; i < this.vaoMax; i++) {
                    if (this.vertexBuffers[i]) {
                        this.vertexBuffers[i].destroy();
                    }
                    if (this.vaos[i]) {
                        this.vaos[i].destroy();
                    }
                }
                if (this.indexBuffer) {
                    this.indexBuffer.destroy();
                }
                this.renderer.off('prerender', this.onPrerender, this);
                _super.prototype.destroy.call(this);
                if (this.shader) {
                    this.shader.destroy();
                    this.shader = null;
                }
                this.vertexBuffers = null;
                this.vaos = null;
                this.indexBuffer = null;
                this.indices = null;
                this.sprites = null;
                for (var i = 0; i < this.buffers.length; ++i) {
                    this.buffers[i].destroy();
                }
            };
            return MultiTextureSpriteRenderer;
        }(ObjectRenderer));
        webgl.MultiTextureSpriteRenderer = MultiTextureSpriteRenderer;
    })(webgl = pixi_heaven.webgl || (pixi_heaven.webgl = {}));
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var AtlasManager = (function () {
        function AtlasManager(renderer) {
            var _this = this;
            this.extensions = null;
            this.onContextChange = function (gl) {
                _this.gl = gl;
                _this.renderer.textureManager.updateTexture = _this.updateTexture;
                _this.extensions = {
                    depthTexture: gl.getExtension('WEBKIT_WEBGL_depth_texture'),
                    floatTexture: gl.getExtension('OES_texture_float'),
                };
            };
            this.updateTexture = function (texture_, location) {
                var tm = _this.renderer.textureManager;
                var gl = _this.gl;
                var anyThis = _this;
                var texture = texture_.baseTexture || texture_;
                var isRenderTexture = !!texture._glRenderTargets;
                if (!texture.hasLoaded) {
                    return null;
                }
                var boundTextures = _this.renderer.boundTextures;
                if (location === undefined) {
                    location = 0;
                    for (var i = 0; i < boundTextures.length; ++i) {
                        if (boundTextures[i] === texture) {
                            location = i;
                            break;
                        }
                    }
                }
                boundTextures[location] = texture;
                gl.activeTexture(gl.TEXTURE0 + location);
                var glTexture = texture._glTextures[_this.renderer.CONTEXT_UID];
                if (!glTexture) {
                    if (isRenderTexture) {
                        var renderTarget = new PIXI.RenderTarget(_this.gl, texture.width, texture.height, texture.scaleMode, texture.resolution);
                        renderTarget.resize(texture.width, texture.height);
                        texture._glRenderTargets[_this.renderer.CONTEXT_UID] = renderTarget;
                        glTexture = renderTarget.texture;
                    }
                    else {
                        glTexture = new PIXI.glCore.GLTexture(_this.gl, null, null, null, null);
                        glTexture.bind(location);
                    }
                    texture._glTextures[_this.renderer.CONTEXT_UID] = glTexture;
                    texture.on('update', tm.updateTexture, tm);
                    texture.on('dispose', tm.destroyTexture, tm);
                }
                else if (isRenderTexture) {
                    texture._glRenderTargets[_this.renderer.CONTEXT_UID].resize(texture.width, texture.height);
                }
                glTexture.premultiplyAlpha = texture.premultipliedAlpha;
                if (!isRenderTexture) {
                    if (!texture.resource) {
                        glTexture.upload(texture.source);
                    }
                    else if (!texture.resource.onTextureUpload(_this.renderer, texture, glTexture)) {
                        glTexture.uploadData(null, texture.realWidth, texture.realHeight);
                    }
                }
                if (texture.forceUploadStyle) {
                    _this.setStyle(texture, glTexture);
                }
                glTexture._updateID = texture._updateID;
                return glTexture;
            };
            this.renderer = renderer;
            renderer.on('context', this.onContextChange);
        }
        AtlasManager.prototype.setStyle = function (texture, glTexture) {
            var gl = this.gl;
            if (texture.isPowerOfTwo) {
                if (texture.mipmap) {
                    glTexture.enableMipmap();
                }
                if (texture.wrapMode === PIXI.WRAP_MODES.CLAMP) {
                    glTexture.enableWrapClamp();
                }
                else if (texture.wrapMode === PIXI.WRAP_MODES.REPEAT) {
                    glTexture.enableWrapRepeat();
                }
                else {
                    glTexture.enableWrapMirrorRepeat();
                }
            }
            else {
                glTexture.enableWrapClamp();
            }
            if (texture.scaleMode === PIXI.SCALE_MODES.NEAREST) {
                glTexture.enableNearestScaling();
            }
            else {
                glTexture.enableLinearScaling();
            }
        };
        AtlasManager.prototype.destroy = function () {
            this.renderer.off('context', this.onContextChange);
        };
        return AtlasManager;
    }());
    pixi_heaven.AtlasManager = AtlasManager;
    PIXI.WebGLRenderer.registerPlugin('atlas', AtlasManager);
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    PIXI.BaseTexture.prototype._updateID = 0;
    PIXI.BaseTexture.prototype.resource = null;
    PIXI.BaseTexture.prototype.forceUploadStyle = true;
    var tmpCanvas;
    PIXI.BaseTexture.prototype.generateMips = function (levels) {
        if (!levels)
            return;
        var src = this.source;
        if (!tmpCanvas)
            tmpCanvas = document.createElement("canvas");
        var sw = ((src.width + 1) >> 1) << 1;
        var h = src.height;
        var sh = 0;
        for (var i = 1; i <= levels; i++) {
            sh += h;
            h = (h + 1) >> 1;
        }
        if (tmpCanvas.width < sw) {
            tmpCanvas.width = sw;
        }
        if (tmpCanvas.height < sh) {
            tmpCanvas.height = sh;
        }
        var context = tmpCanvas.getContext("2d");
        context.clearRect(0, 0, sw, sh);
        this._mips = [];
        var w = src.width;
        h = src.height;
        context.drawImage(src, 0, 0, w, h, 0, 0, w / 2, h / 2);
        var h1 = 0;
        for (var i = 1; i <= levels; i++) {
            w = (w + 1) >> 1;
            h = (h + 1) >> 1;
            var data = context.getImageData(0, h1, w, h);
            this._mips.push({
                width: data.width,
                height: data.height,
                data: new Uint8Array(data.data)
            });
            if (i < levels) {
                context.drawImage(tmpCanvas, 0, h1, w, h, 0, h1 + h, w / 2, h / 2);
                h1 += h;
            }
        }
    };
})(pixi_heaven || (pixi_heaven = {}));
if (!PIXI.GroupD8.isVertical) {
    PIXI.GroupD8.isVertical = function (rotation) {
        return (rotation & 3) === 2;
    };
}
var pixi_heaven;
(function (pixi_heaven) {
    PIXI.glCore.GLTexture.prototype._updateID = -1;
    PIXI.BaseTexture.prototype._updateID = 0;
    PIXI.BaseTexture.prototype.resource = null;
    PIXI.BaseTexture.prototype.forceUploadStyle = true;
    function bindTexture(texture, location, forceLocation) {
        texture = texture || this.emptyTextures[location];
        texture = texture.baseTexture || texture;
        texture.touched = this.textureGC.count;
        if (!forceLocation) {
            for (var i = 0; i < this.boundTextures.length; i++) {
                if (this.boundTextures[i] === texture) {
                    return i;
                }
            }
            if (location === undefined) {
                this._nextTextureLocation++;
                this._nextTextureLocation %= this.boundTextures.length;
                location = this.boundTextures.length - this._nextTextureLocation - 1;
            }
        }
        else {
            location = location || 0;
        }
        var gl = this.gl;
        var glTexture = texture._glTextures[this.CONTEXT_UID];
        if (texture === this.emptyTextures[location]) {
            glTexture._updateID = 0;
        }
        if (!glTexture || glTexture._updateID < texture._updateID) {
            this.textureManager.updateTexture(texture, location);
        }
        else {
            this.boundTextures[location] = texture;
            gl.activeTexture(gl.TEXTURE0 + location);
            gl.bindTexture(gl.TEXTURE_2D, glTexture.texture);
        }
        return location;
    }
    PIXI.WebGLRenderer.prototype.bindTexture = bindTexture;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var mesh;
    (function (mesh) {
        var tempPoint = new PIXI.Point();
        var tempPolygon = new PIXI.Polygon();
        var Mesh = (function (_super) {
            __extends(Mesh, _super);
            function Mesh(texture, vertices, uvs, indices, drawMode) {
                if (texture === void 0) { texture = PIXI.Texture.EMPTY; }
                if (drawMode === void 0) { drawMode = PIXI.mesh.Mesh.DRAW_MODES.TRIANGLE_MESH; }
                var _this = _super.call(this) || this;
                _this.dirty = 0;
                _this.indexDirty = 0;
                _this.blendMode = PIXI.BLEND_MODES.NORMAL;
                _this.canvasPadding = 0;
                _this.tintRgb = new Float32Array([1, 1, 1]);
                _this._glDatas = {};
                _this.uploadUvTransform = false;
                _this.pluginName = 'meshHeaven';
                _this.color = new pixi_heaven.ColorTransform();
                _this._texture = texture;
                if (!texture.baseTexture.hasLoaded) {
                    texture.once('update', _this._onTextureUpdate, _this);
                }
                _this.uvs = uvs || new Float32Array([
                    0, 0,
                    1, 0,
                    1, 1,
                    0, 1
                ]);
                _this.vertices = vertices || new Float32Array([
                    0, 0,
                    100, 0,
                    100, 100,
                    0, 100
                ]);
                _this.indices = indices || new Uint16Array([0, 1, 3, 2]);
                _this.colors = null;
                _this.drawMode = drawMode;
                _this._uvTransform = new PIXI.TextureMatrix(texture, 0);
                return _this;
            }
            Mesh.prototype.updateTransform = function () {
                this.refresh();
                this._boundsID++;
                this.transform.updateTransform(this.parent.transform);
                this.worldAlpha = this.alpha * this.parent.worldAlpha;
                if (this.color) {
                    this.color.alpha = this.worldAlpha;
                    this.color.updateTransform();
                }
                for (var i = 0, j = this.children.length; i < j; ++i) {
                    var child = this.children[i];
                    if (child.visible) {
                        child.updateTransform();
                    }
                }
            };
            Mesh.prototype._renderWebGL = function (renderer) {
                renderer.setObjectRenderer(renderer.plugins[this.pluginName]);
                renderer.plugins[this.pluginName].render(this);
            };
            Mesh.prototype._renderCanvas = function (renderer) {
                renderer.plugins['mesh'].render(this);
            };
            Mesh.prototype._onTextureUpdate = function () {
                this._uvTransform.texture = this._texture;
                this.color.pma = this._texture.baseTexture.premultipliedAlpha;
                this.refresh();
            };
            Mesh.prototype.multiplyUvs = function () {
                if (!this.uploadUvTransform) {
                    this._uvTransform.multiplyUvs(this.uvs);
                }
            };
            Mesh.prototype.refresh = function (forceUpdate) {
                if (forceUpdate === void 0) { forceUpdate = false; }
                if (this._uvTransform.update(forceUpdate)) {
                    this._refreshUvs();
                }
            };
            Mesh.prototype._refreshUvs = function () {
            };
            Mesh.prototype._calculateBounds = function () {
                this._bounds.addVertices(this.transform, this.vertices, 0, this.vertices.length);
            };
            Mesh.prototype.containsPoint = function (point) {
                if (!this.getBounds().contains(point.x, point.y)) {
                    return false;
                }
                this.worldTransform.applyInverse(point, tempPoint);
                var vertices = this.vertices;
                var points = tempPolygon.points;
                var indices = this.indices;
                var len = this.indices.length;
                var step = this.drawMode === Mesh.DRAW_MODES.TRIANGLES ? 3 : 1;
                for (var i = 0; i + 2 < len; i += step) {
                    var ind0 = indices[i] * 2;
                    var ind1 = indices[i + 1] * 2;
                    var ind2 = indices[i + 2] * 2;
                    points[0] = vertices[ind0];
                    points[1] = vertices[ind0 + 1];
                    points[2] = vertices[ind1];
                    points[3] = vertices[ind1 + 1];
                    points[4] = vertices[ind2];
                    points[5] = vertices[ind2 + 1];
                    if (tempPolygon.contains(tempPoint.x, tempPoint.y)) {
                        return true;
                    }
                }
                return false;
            };
            Object.defineProperty(Mesh.prototype, "texture", {
                get: function () {
                    return this._texture;
                },
                set: function (value) {
                    if (this._texture === value) {
                        return;
                    }
                    this._texture = value;
                    if (value) {
                        if (value.baseTexture.hasLoaded) {
                            this._onTextureUpdate();
                        }
                        else {
                            value.once('update', this._onTextureUpdate, this);
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });
            Mesh.prototype.enableColors = function () {
                this.pluginName = 'meshColored';
                var len = this.vertices.length / 2;
                var colors = new Uint32Array(len * 2);
                this.colors = colors;
                for (var i = 0; i < len; i++) {
                    this.colors[i * 2] = 0;
                    this.colors[i * 2 + 1] = 0xffffffff;
                }
            };
            Mesh.prototype.setRGB = function (rgb, dark) {
                var colors = this.colors;
                var j = dark ? 0 : 1;
                var a = dark ? 0 : (0xff << 24);
                for (var i = 0; i < rgb.length; i += 3) {
                    colors[j] = a | ((rgb[i] * 255) << 16) | ((rgb[i + 1] * 255) << 8) | ((rgb[i + 2] * 255) << 0);
                    j += 2;
                }
                this.dirty++;
            };
            Object.defineProperty(Mesh.prototype, "tint", {
                get: function () {
                    return this.color ? this.color.tintBGR : 0xffffff;
                },
                set: function (value) {
                    this.color && (this.color.tintBGR = value);
                },
                enumerable: true,
                configurable: true
            });
            Mesh.DRAW_MODES = PIXI.mesh.Mesh.DRAW_MODES;
            return Mesh;
        }(PIXI.Container));
        mesh.Mesh = Mesh;
    })(mesh = pixi_heaven.mesh || (pixi_heaven.mesh = {}));
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var mesh;
    (function (mesh) {
        var GroupD8 = PIXI.GroupD8;
        var Plane = (function (_super) {
            __extends(Plane, _super);
            function Plane(texture, verticesX, verticesY, direction) {
                if (verticesX === void 0) { verticesX = 2; }
                if (verticesY === void 0) { verticesY = 2; }
                if (direction === void 0) { direction = 0; }
                var _this = _super.call(this, texture) || this;
                _this._dimensionsID = 0;
                _this._lastDimensionsID = -1;
                _this._verticesID = 0;
                _this._lastVerticesID = -1;
                _this._uvsID = 0;
                _this._lastUvsID = -1;
                _this.autoResetVertices = true;
                _this.calculatedVertices = null;
                _this._verticesX = verticesX || 2;
                _this._verticesY = verticesY || 2;
                _this._direction = (direction || 0) & (~1);
                _this._lastWidth = texture.orig.width;
                _this._lastHeight = texture.orig.height;
                _this._width = 0;
                _this._height = 0;
                _this._anchor = new PIXI.ObservablePoint(_this._onAnchorUpdate, _this);
                _this.drawMode = mesh.Mesh.DRAW_MODES.TRIANGLES;
                _this.refresh();
                return _this;
            }
            Object.defineProperty(Plane.prototype, "verticesX", {
                get: function () {
                    return this._verticesX;
                },
                set: function (value) {
                    if (this._verticesX === value) {
                        return;
                    }
                    this._verticesX = value;
                    this._dimensionsID++;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Plane.prototype, "verticesY", {
                get: function () {
                    return this._verticesY;
                },
                set: function (value) {
                    if (this._verticesY === value) {
                        return;
                    }
                    this._verticesY = value;
                    this._dimensionsID++;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Plane.prototype, "direction", {
                get: function () {
                    return this._direction;
                },
                set: function (value) {
                    if (value % 2 !== 0) {
                        throw new Error('plane does not support diamond shape yet');
                    }
                    if (this._direction === value) {
                        return;
                    }
                    this._direction = value;
                    this._verticesID++;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Plane.prototype, "width", {
                get: function () {
                    return this._width || this.texture.orig.width;
                },
                set: function (value) {
                    if (this._width === value) {
                        return;
                    }
                    this._width = value;
                    this._verticesID++;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Plane.prototype, "height", {
                get: function () {
                    return this._height || this.texture.orig.height;
                },
                set: function (value) {
                    if (this._height === value) {
                        return;
                    }
                    this._height = value;
                    this._verticesID++;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Plane.prototype, "anchor", {
                get: function () {
                    return this._anchor;
                },
                set: function (value) {
                    this._anchor.copy(value);
                },
                enumerable: true,
                configurable: true
            });
            Plane.prototype._onAnchorUpdate = function () {
                this._verticesID++;
            };
            Plane.prototype.invalidateVertices = function () {
                this._verticesID++;
            };
            Plane.prototype.invalidateUvs = function () {
                this._uvsID++;
            };
            Plane.prototype.invalidate = function () {
                this._verticesID++;
                this._uvsID++;
            };
            Plane.prototype.refresh = function (forceUpdate) {
                if (forceUpdate === void 0) { forceUpdate = false; }
                if (this._texture.noFrame) {
                    return;
                }
                this.refreshDimensions(forceUpdate);
                if (this._lastWidth !== this.width
                    || this._lastHeight !== this.height) {
                    this._lastWidth = this.width;
                    this._lastHeight = this.height;
                    if (this.autoResetVertices) {
                        this._verticesID++;
                    }
                }
                if (this._uvTransform.update(forceUpdate)) {
                    this._uvsID++;
                }
                if (this._uvsID !== this._lastUvsID) {
                    this._refreshUvs();
                }
                this.refreshVertices();
            };
            Plane.prototype.refreshDimensions = function (forceUpdate) {
                if (forceUpdate === void 0) { forceUpdate = false; }
                if (!forceUpdate && this._lastDimensionsID === this._dimensionsID) {
                    return;
                }
                this._lastDimensionsID = this._dimensionsID;
                this._verticesID++;
                this._uvsID++;
                var total = this._verticesX * this._verticesY;
                var segmentsX = this._verticesX - 1;
                var segmentsY = this._verticesY - 1;
                var indices = [];
                var totalSub = segmentsX * segmentsY;
                for (var i = 0; i < totalSub; i++) {
                    var xpos = i % segmentsX;
                    var ypos = (i / segmentsX) | 0;
                    var value = (ypos * this._verticesX) + xpos;
                    var value2 = (ypos * this._verticesX) + xpos + 1;
                    var value3 = ((ypos + 1) * this._verticesX) + xpos;
                    var value4 = ((ypos + 1) * this._verticesX) + xpos + 1;
                    indices.push(value, value2, value3);
                    indices.push(value2, value4, value3);
                }
                this.indices = new Uint16Array(indices);
                this.uvs = new Float32Array(total * 2);
                this.vertices = new Float32Array(total * 2);
                this.calculatedVertices = new Float32Array(total * 2);
                this.indexDirty++;
            };
            Plane.prototype.refreshVertices = function (forceUpdate) {
                if (forceUpdate === void 0) { forceUpdate = false; }
                var texture = this._texture;
                if (texture.noFrame) {
                    return;
                }
                if (forceUpdate || this._lastVerticesID !== this._verticesID) {
                    this._lastVerticesID = this._verticesID;
                    this._refreshVertices();
                }
            };
            Plane.prototype._refreshUvs = function () {
                this._uvsID = this._lastUvsID;
                var total = this._verticesX * this._verticesY;
                var uvs = this.uvs;
                var direction = this._direction;
                var ux = GroupD8.uX(direction);
                var uy = GroupD8.uY(direction);
                var vx = GroupD8.vX(direction);
                var vy = GroupD8.vY(direction);
                var factorU = 1.0 / (this._verticesX - 1);
                var factorV = 1.0 / (this._verticesY - 1);
                for (var i = 0; i < total; i++) {
                    var x = (i % this._verticesX);
                    var y = ((i / this._verticesX) | 0);
                    x = (x * factorU) - 0.5;
                    y = (y * factorV) - 0.5;
                    uvs[i * 2] = (ux * x) + (vx * y) + 0.5;
                    uvs[(i * 2) + 1] = (uy * x) + (vy * y) + 0.5;
                }
                this.dirty++;
                this.multiplyUvs();
            };
            Plane.prototype.calcVertices = function () {
                var total = this._verticesX * this._verticesY;
                var vertices = this.calculatedVertices;
                var width = this.width;
                var height = this.height;
                var direction = this._direction;
                var ux = GroupD8.uX(direction);
                var uy = GroupD8.uY(direction);
                var vx = GroupD8.vX(direction);
                var vy = GroupD8.vY(direction);
                var anchor = this._anchor;
                var offsetX = (0.5 * (1 - (ux + vx))) - anchor._x;
                var offsetY = (0.5 * (1 - (uy + vy))) - anchor._y;
                var factorU = 1.0 / (this._verticesX - 1);
                var factorV = 1.0 / (this._verticesY - 1);
                ux *= factorU;
                uy *= factorU;
                vx *= factorV;
                vy *= factorV;
                for (var i = 0; i < total; i++) {
                    var x = (i % this._verticesX);
                    var y = ((i / this._verticesX) | 0);
                    vertices[i * 2] = ((ux * x) + (vx * y) + offsetX) * width;
                    vertices[(i * 2) + 1] = ((uy * x) + (vy * y) + offsetY) * height;
                }
            };
            Plane.prototype._refreshVertices = function () {
                this.calcVertices();
                var vertices = this.vertices;
                var calculatedVertices = this.calculatedVertices;
                var len = vertices.length;
                for (var i = 0; i < len; i++) {
                    vertices[i] = calculatedVertices[i];
                }
            };
            Plane.prototype.reset = function () {
                if (!this.texture.noFrame) {
                    this._refreshUvs();
                    this.refreshVertices(true);
                }
            };
            return Plane;
        }(mesh.Mesh));
        mesh.Plane = Plane;
    })(mesh = pixi_heaven.mesh || (pixi_heaven.mesh = {}));
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var mesh;
    (function (mesh) {
        var DEFAULT_BORDER_SIZE = 10;
        var NineSlicePlane = (function (_super) {
            __extends(NineSlicePlane, _super);
            function NineSlicePlane(texture, leftWidth, topHeight, rightWidth, bottomHeight) {
                if (leftWidth === void 0) { leftWidth = DEFAULT_BORDER_SIZE; }
                if (topHeight === void 0) { topHeight = DEFAULT_BORDER_SIZE; }
                if (rightWidth === void 0) { rightWidth = DEFAULT_BORDER_SIZE; }
                if (bottomHeight === void 0) { bottomHeight = DEFAULT_BORDER_SIZE; }
                var _this = _super.call(this, texture, 4, 4) || this;
                _this._leftWidth = leftWidth;
                _this._rightWidth = rightWidth;
                _this._topHeight = topHeight;
                _this._bottomHeight = bottomHeight;
                _this.refresh(true);
                return _this;
            }
            Object.defineProperty(NineSlicePlane.prototype, "leftWidth", {
                get: function () {
                    return this._leftWidth;
                },
                set: function (value) {
                    if (this._leftWidth === value) {
                        return;
                    }
                    this._leftWidth = value;
                    this._verticesID++;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NineSlicePlane.prototype, "rightWidth", {
                get: function () {
                    return this._rightWidth;
                },
                set: function (value) {
                    if (this._rightWidth === value) {
                        return;
                    }
                    this._rightWidth = value;
                    this._verticesID++;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NineSlicePlane.prototype, "topHeight", {
                get: function () {
                    return this._topHeight;
                },
                set: function (value) {
                    if (this._topHeight === value) {
                        return;
                    }
                    this._topHeight = value;
                    this._verticesID++;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NineSlicePlane.prototype, "bottomHeight", {
                get: function () {
                    return this._bottomHeight;
                },
                set: function (value) {
                    if (this._bottomHeight === value) {
                        return;
                    }
                    this._bottomHeight = value;
                    this._verticesID++;
                },
                enumerable: true,
                configurable: true
            });
            NineSlicePlane.prototype._refreshVertices = function () {
                this.updateHorizontalVertices();
                this.updateVerticalVertices();
                var vertices = this.vertices;
                var anchor = this._anchor;
                var offsetX = anchor._x * this.width;
                var offsetY = anchor._y * this.height;
                for (var i = 0; i < 32; i += 2) {
                    vertices[i] += offsetX;
                    vertices[i + 1] += offsetY;
                }
                this.dirty++;
            };
            NineSlicePlane.prototype._refreshUvs = function () {
                this._uvsID = this._lastUvsID;
                var uvs = this.uvs;
                var texture = this._texture;
                var width = texture.orig.width;
                var height = texture.orig.height;
                uvs[0] = uvs[8] = uvs[16] = uvs[24] = 0;
                uvs[2] = uvs[10] = uvs[18] = uvs[26] = this._leftWidth / width;
                uvs[4] = uvs[12] = uvs[20] = uvs[28] = 1 - (this._rightWidth / width);
                uvs[6] = uvs[14] = uvs[22] = uvs[30] = 1;
                uvs[1] = uvs[3] = uvs[5] = uvs[7] = 0;
                uvs[9] = uvs[11] = uvs[13] = uvs[15] = this._topHeight / height;
                uvs[17] = uvs[19] = uvs[21] = uvs[23] = 1 - (this._bottomHeight / height);
                uvs[25] = uvs[27] = uvs[29] = uvs[31] = 1;
                this.dirty++;
                this.multiplyUvs();
            };
            NineSlicePlane.prototype.updateHorizontalVertices = function () {
                var vertices = this.vertices;
                vertices[1] = vertices[3] = vertices[5] = vertices[7] = 0;
                vertices[9] = vertices[11] = vertices[13] = vertices[15] = this._topHeight;
                vertices[17] = vertices[19] = vertices[21] = vertices[23] = this._height - this._bottomHeight;
                vertices[25] = vertices[27] = vertices[29] = vertices[31] = this._height;
            };
            NineSlicePlane.prototype.updateVerticalVertices = function () {
                var vertices = this.vertices;
                vertices[0] = vertices[8] = vertices[16] = vertices[24] = 0;
                vertices[2] = vertices[10] = vertices[18] = vertices[26] = this._leftWidth;
                vertices[4] = vertices[12] = vertices[20] = vertices[28] = this._width - this._rightWidth;
                vertices[6] = vertices[14] = vertices[22] = vertices[30] = this._width;
            };
            NineSlicePlane.prototype._renderCanvas = function (renderer) {
                if (!this._texture.valid) {
                    return;
                }
                if (this._texture.rotate) {
                    _super.prototype._renderCanvas.call(this, renderer);
                    return;
                }
                var context = renderer.context;
                context.globalAlpha = this.worldAlpha;
                var transform = this.worldTransform;
                var res = renderer.resolution;
                if (renderer.roundPixels) {
                    context.setTransform(transform.a * res, transform.b * res, transform.c * res, transform.d * res, (transform.tx * res) | 0, (transform.ty * res) | 0);
                }
                else {
                    context.setTransform(transform.a * res, transform.b * res, transform.c * res, transform.d * res, transform.tx * res, transform.ty * res);
                }
                var base = this._texture.baseTexture;
                var textureSource = base.source;
                var w = base.realWidth;
                var h = base.realHeight;
                this.drawSegment(context, textureSource, w, h, 0, 1, 10, 11);
                this.drawSegment(context, textureSource, w, h, 2, 3, 12, 13);
                this.drawSegment(context, textureSource, w, h, 4, 5, 14, 15);
                this.drawSegment(context, textureSource, w, h, 8, 9, 18, 19);
                this.drawSegment(context, textureSource, w, h, 10, 11, 20, 21);
                this.drawSegment(context, textureSource, w, h, 12, 13, 22, 23);
                this.drawSegment(context, textureSource, w, h, 16, 17, 26, 27);
                this.drawSegment(context, textureSource, w, h, 18, 19, 28, 29);
                this.drawSegment(context, textureSource, w, h, 20, 21, 30, 31);
            };
            NineSlicePlane.prototype.drawSegment = function (context, textureSource, w, h, x1, y1, x2, y2) {
                var uvs = this.uvs;
                var vertices = this.vertices;
                var sw = (uvs[x2] - uvs[x1]) * w;
                var sh = (uvs[y2] - uvs[y1]) * h;
                var dw = vertices[x2] - vertices[x1];
                var dh = vertices[y2] - vertices[y1];
                if (sw < 1) {
                    sw = 1;
                }
                if (sh < 1) {
                    sh = 1;
                }
                if (dw < 1) {
                    dw = 1;
                }
                if (dh < 1) {
                    dh = 1;
                }
                context.drawImage(textureSource, uvs[x1] * w, uvs[y1] * h, sw, sh, vertices[x1], vertices[y1], dw, dh);
            };
            return NineSlicePlane;
        }(mesh.Plane));
        mesh.NineSlicePlane = NineSlicePlane;
    })(mesh = pixi_heaven.mesh || (pixi_heaven.mesh = {}));
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var mesh;
    (function (mesh) {
        var GroupD8 = PIXI.GroupD8;
        var Rope = (function (_super) {
            __extends(Rope, _super);
            function Rope(texture, verticesX, verticesY, direction) {
                if (verticesY === void 0) { verticesY = 2; }
                if (direction === void 0) { direction = 0; }
                var _this = _super.call(this, texture, verticesX.length || verticesX, verticesY, direction) || this;
                _this.points = [];
                _this.calculatedPoints = [];
                _this.autoUpdate = true;
                _this.points = [];
                _this.calculatedPoints = [];
                if (verticesX instanceof Array) {
                    _this.points = verticesX;
                    _this.autoResetVertices = false;
                }
                _this._checkPointsLen();
                if (GroupD8.isVertical(direction)) {
                    _this._anchor._x = 0.5;
                }
                else {
                    _this._anchor._y = 0.5;
                }
                _this.refresh();
                return _this;
            }
            Rope.prototype.updateTransform = function () {
                if (this.autoUpdate) {
                    this._verticesID++;
                }
                this.refresh();
                this.containerUpdateTransform();
            };
            Rope.prototype._onAnchorUpdate = function () {
                this.reset();
            };
            Rope.prototype._checkPointsLen = function () {
                var len = this._verticesX;
                var points = this.points;
                var calculatedPoints = this.calculatedPoints;
                if (points.length > len) {
                    points.length = len;
                }
                while (points.length < len) {
                    points.push(new mesh.RopePoint(0, 0, 0, 1.0));
                }
                if (calculatedPoints.length > len) {
                    calculatedPoints.length = len;
                }
                while (calculatedPoints.length < len) {
                    calculatedPoints.push(new mesh.RopePoint(0, 0, 0, 1.0));
                }
            };
            Rope.prototype.refresh = function (forceUpdate) {
                if (forceUpdate === void 0) { forceUpdate = false; }
                if (!this.points || this._texture.noFrame) {
                    return;
                }
                if (this._lastWidth !== this.width
                    || this._lastHeight !== this.height) {
                    this._lastWidth = this.width;
                    this._lastHeight = this.height;
                    if (this.autoResetVertices) {
                        this.resetPoints();
                    }
                }
                _super.prototype.refresh.call(this, forceUpdate);
            };
            Rope.prototype.calcPoints = function () {
                var len = this._verticesX;
                var points = this.calculatedPoints;
                var dir = this._direction;
                var width = this.width;
                var height = this.height;
                var dx = GroupD8.uX(dir);
                var dy = GroupD8.uY(dir);
                var anchor = this._anchor;
                var offsetX = dx !== 0 ? 0.5 - anchor._x : 0;
                var offsetY = dy !== 0 ? 0.5 - anchor._y : 0;
                for (var i = 0; i < len; i++) {
                    var t = (i - ((len - 1) * 0.5)) / (len - 1);
                    points[i].x = ((t * dx) + offsetX) * width;
                    points[i].y = ((t * dy) + offsetY) * height;
                }
            };
            Rope.prototype.resetPoints = function () {
                this.calcPoints();
                var len = this._verticesX;
                var points = this.points;
                var calculatedPoints = this.calculatedPoints;
                for (var i = 0; i < len; i++) {
                    points[i].x = calculatedPoints[i].x;
                    points[i].y = calculatedPoints[i].y;
                }
            };
            Rope.prototype.resetOffsets = function () {
                var points = this.points;
                var len = points.length;
                for (var i = 0; i < len; i++) {
                    points[i].offset = 0.0;
                }
                for (var i = 0; i < len; i++) {
                    points[i].scale = 1.0;
                }
            };
            Rope.prototype.reset = function () {
                this._checkPointsLen();
                this.resetPoints();
                this.resetOffsets();
                _super.prototype.reset.call(this);
            };
            Rope.prototype.calcVertices = function () {
                var points = this.points;
                var lastPoint = points[0];
                var nextPoint;
                var normalX = 0;
                var normalY = 0;
                var width = this.width;
                var height = this.height;
                var vertices = this.calculatedVertices;
                var verticesX = this.verticesX;
                var verticesY = this.verticesY;
                var direction = this._direction;
                var vx = GroupD8.vX(direction);
                var vy = GroupD8.vY(direction);
                var wide = (vx * width) + (vy * height);
                var anchor = this._anchor;
                var normalOffset = wide * ((anchor._x * vx) + (anchor._y * vy));
                var normalFactor = -Math.abs(wide) / (verticesY - 1);
                for (var i = 0; i < verticesX; i++) {
                    var point = points[i];
                    var offset = points[i].offset || 0;
                    var scale = (points[i].scale !== undefined) ? points[i].scale : 1.0;
                    if (i < points.length - 1) {
                        nextPoint = points[i + 1];
                    }
                    else {
                        nextPoint = point;
                    }
                    normalY = -(nextPoint.x - lastPoint.x);
                    normalX = nextPoint.y - lastPoint.y;
                    var perpLength = Math.sqrt((normalX * normalX) + (normalY * normalY));
                    normalX /= perpLength;
                    normalY /= perpLength;
                    for (var j = 0; j < verticesY; j++) {
                        var ind = (i + (j * verticesX)) * 2;
                        vertices[ind] = point.x + (normalX * (offset + (scale * (normalOffset + (normalFactor * j)))));
                        vertices[ind + 1] = point.y + (normalY * (offset + (scale * (normalOffset + (normalFactor * j)))));
                    }
                    lastPoint = point;
                }
            };
            return Rope;
        }(mesh.Plane));
        mesh.Rope = Rope;
    })(mesh = pixi_heaven.mesh || (pixi_heaven.mesh = {}));
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var mesh;
    (function (mesh) {
        var RopePoint = (function (_super) {
            __extends(RopePoint, _super);
            function RopePoint(x, y, offset, scale) {
                if (x === void 0) { x = 0; }
                if (y === void 0) { y = 0; }
                if (offset === void 0) { offset = 0; }
                if (scale === void 0) { scale = 1.0; }
                var _this = _super.call(this, x, y) || this;
                _this.offset = offset;
                _this.scale = scale;
                return _this;
            }
            RopePoint.prototype.clone = function () {
                return new RopePoint(this.x, this.y, this.offset, this.scale);
            };
            RopePoint.prototype.copy = function (p) {
                this.set(p.x, p.y, p.offset, p.scale);
            };
            RopePoint.prototype.set = function (x, y, offset, scale) {
                this.x = x || 0;
                this.y = y || ((y !== 0) ? this.x : 0);
                this.offset = offset || 0;
                this.scale = (scale !== undefined) ? scale : 1.0;
            };
            return RopePoint;
        }(PIXI.Point));
        mesh.RopePoint = RopePoint;
    })(mesh = pixi_heaven.mesh || (pixi_heaven.mesh = {}));
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var mesh;
    (function (mesh_1) {
        var glCore = PIXI.glCore;
        var utils = PIXI.utils;
        var matrixIdentity = PIXI.Matrix.IDENTITY;
        var MeshColoredRenderer = (function (_super) {
            __extends(MeshColoredRenderer, _super);
            function MeshColoredRenderer() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.shader = null;
                _this.shaderTrim = null;
                return _this;
            }
            MeshColoredRenderer.prototype.onContextChange = function () {
                var gl = this.renderer.gl;
                this.shader = new PIXI.Shader(gl, MeshColoredRenderer.vert, MeshColoredRenderer.frag);
                this.shaderTrim = new PIXI.Shader(gl, MeshColoredRenderer.vert, MeshColoredRenderer.fragTrim);
            };
            MeshColoredRenderer.prototype.render = function (mesh) {
                var renderer = this.renderer;
                var gl = renderer.gl;
                var texture = mesh._texture;
                if (!texture.valid) {
                    return;
                }
                var glData = mesh._glDatas[renderer.CONTEXT_UID];
                if (!glData || !glData.colorBuffer) {
                    renderer.bindVao(null);
                    glData = {
                        vertexBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.vertices, gl.STREAM_DRAW),
                        uvBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.uvs, gl.STREAM_DRAW),
                        colorBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.colors, gl.STREAM_DRAW),
                        indexBuffer: glCore.GLBuffer.createIndexBuffer(gl, mesh.indices, gl.STATIC_DRAW),
                        vao: null,
                        dirty: mesh.dirty,
                        indexDirty: mesh.indexDirty
                    };
                    var attrs = this.shader.attributes;
                    glData.vao = new glCore.VertexArrayObject(gl)
                        .addIndex(glData.indexBuffer)
                        .addAttribute(glData.vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, 2 * 4, 0)
                        .addAttribute(glData.uvBuffer, attrs.aTextureCoord, gl.FLOAT, false, 2 * 4, 0)
                        .addAttribute(glData.colorBuffer, attrs.aDark, gl.UNSIGNED_BYTE, true, 2 * 4, 0)
                        .addAttribute(glData.colorBuffer, attrs.aLight, gl.UNSIGNED_BYTE, true, 2 * 4, 4);
                    mesh._glDatas[renderer.CONTEXT_UID] = glData;
                }
                renderer.bindVao(glData.vao);
                if (mesh.dirty !== glData.dirty) {
                    glData.dirty = mesh.dirty;
                    glData.uvBuffer.upload(mesh.uvs);
                    glData.colorBuffer.upload(mesh.colors);
                }
                if (mesh.indexDirty !== glData.indexDirty) {
                    glData.indexDirty = mesh.indexDirty;
                    glData.indexBuffer.upload(mesh.indices);
                }
                glData.vertexBuffer.upload(mesh.vertices);
                var isTrimmed = texture.trim && (texture.trim.width < texture.orig.width
                    || texture.trim.height < texture.orig.height);
                var shader = isTrimmed ? this.shaderTrim : this.shader;
                renderer.bindShader(shader);
                shader.uniforms.uSampler = renderer.bindTexture(texture);
                renderer.state.setBlendMode(utils.correctBlendMode(mesh.blendMode, texture.baseTexture.premultipliedAlpha));
                if (shader.uniforms.uTransform) {
                    if (mesh.uploadUvTransform) {
                        shader.uniforms.uTransform = mesh._uvTransform.mapCoord.toArray(true);
                    }
                    else {
                        shader.uniforms.uTransform = matrixIdentity.toArray(true);
                    }
                }
                if (isTrimmed) {
                    shader.uniforms.uClampFrame = mesh._uvTransform.uClampFrame;
                }
                shader.uniforms.translationMatrix = mesh.worldTransform.toArray(true);
                shader.uniforms.uLight = mesh.color.light;
                shader.uniforms.uDark = mesh.color.dark;
                var drawMode = mesh.drawMode === mesh_1.Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;
                glData.vao.draw(drawMode, mesh.indices.length, 0);
            };
            MeshColoredRenderer.vert = "\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aDark;\nattribute vec4 aLight;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform mat3 uTransform;\nuniform vec4 uLight, uDark;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vDark;\nvarying vec4 vLight;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;\n\n\tvLight.a = uLight.a * aLight.a;\n\tvDark.a = uDark.a;\n\t\n\tvLight.rgb = ((aLight.a - 1.0) * uDark.a + 1.0 - aLight.rgb) * uDark.rgb + aLight.rgb * uLight.rgb;\n\tvDark.rgb = ((aDark.a - 1.0) * uDark.a + 1.0 - aDark.rgb) * uDark.rgb + aDark.rgb * uLight.rgb;\n}\n";
            MeshColoredRenderer.frag = "\nvarying vec2 vTextureCoord;\nvarying vec4 vLight, vDark;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    vec4 texColor = texture2D(uSampler, vTextureCoord);\n    gl_FragColor.a = texColor.a * vLight.a;\n\tgl_FragColor.rgb = ((texColor.a - 1.0) * vDark.a + 1.0 - texColor.rgb) * vDark.rgb + texColor.rgb * vLight.rgb;\n}\n";
            MeshColoredRenderer.fragTrim = "\nvarying vec2 vTextureCoord;\nvarying vec4 vLight, vDark;\nuniform vec4 uClampFrame;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    vec2 coord = vTextureCoord;\n    if (coord.x < uClampFrame.x || coord.x > uClampFrame.z\n        || coord.y < uClampFrame.y || coord.y > uClampFrame.w)\n            discard;\n    vec4 texColor = texture2D(uSampler, vTextureCoord);\n    gl_FragColor.a = texColor.a * vLight.a;\n\tgl_FragColor.rgb = ((texColor.a - 1.0) * vDark.a + 1.0 - texColor.rgb) * vDark.rgb + texColor.rgb * vLight.rgb;\n}\n";
            return MeshColoredRenderer;
        }(PIXI.ObjectRenderer));
        mesh_1.MeshColoredRenderer = MeshColoredRenderer;
        PIXI.WebGLRenderer.registerPlugin('meshColored', MeshColoredRenderer);
    })(mesh = pixi_heaven.mesh || (pixi_heaven.mesh = {}));
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var mesh;
    (function (mesh_2) {
        var glCore = PIXI.glCore;
        var utils = PIXI.utils;
        var matrixIdentity = PIXI.Matrix.IDENTITY;
        var MeshHeavenRenderer = (function (_super) {
            __extends(MeshHeavenRenderer, _super);
            function MeshHeavenRenderer() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.shader = null;
                _this.shaderTrim = null;
                return _this;
            }
            MeshHeavenRenderer.prototype.onContextChange = function () {
                var gl = this.renderer.gl;
                this.shader = new PIXI.Shader(gl, MeshHeavenRenderer.vert, MeshHeavenRenderer.frag);
                this.shaderTrim = new PIXI.Shader(gl, MeshHeavenRenderer.vert, MeshHeavenRenderer.fragTrim);
            };
            MeshHeavenRenderer.prototype.render = function (mesh) {
                var renderer = this.renderer;
                var gl = renderer.gl;
                var texture = mesh._texture;
                if (!texture.valid) {
                    return;
                }
                var glData = mesh._glDatas[renderer.CONTEXT_UID];
                if (!glData) {
                    renderer.bindVao(null);
                    glData = {
                        vertexBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.vertices, gl.STREAM_DRAW),
                        uvBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.uvs, gl.STREAM_DRAW),
                        indexBuffer: glCore.GLBuffer.createIndexBuffer(gl, mesh.indices, gl.STATIC_DRAW),
                        vao: null,
                        dirty: mesh.dirty,
                        indexDirty: mesh.indexDirty
                    };
                    glData.vao = new glCore.VertexArrayObject(gl)
                        .addIndex(glData.indexBuffer)
                        .addAttribute(glData.vertexBuffer, this.shader.attributes.aVertexPosition, gl.FLOAT, false, 2 * 4, 0)
                        .addAttribute(glData.uvBuffer, this.shader.attributes.aTextureCoord, gl.FLOAT, false, 2 * 4, 0);
                    mesh._glDatas[renderer.CONTEXT_UID] = glData;
                }
                renderer.bindVao(glData.vao);
                if (mesh.dirty !== glData.dirty) {
                    glData.dirty = mesh.dirty;
                    glData.uvBuffer.upload(mesh.uvs);
                }
                if (mesh.indexDirty !== glData.indexDirty) {
                    glData.indexDirty = mesh.indexDirty;
                    glData.indexBuffer.upload(mesh.indices);
                }
                glData.vertexBuffer.upload(mesh.vertices);
                var isTrimmed = texture.trim && (texture.trim.width < texture.orig.width
                    || texture.trim.height < texture.orig.height);
                var shader = isTrimmed ? this.shaderTrim : this.shader;
                renderer.bindShader(shader);
                shader.uniforms.uSampler = renderer.bindTexture(texture);
                renderer.state.setBlendMode(utils.correctBlendMode(mesh.blendMode, texture.baseTexture.premultipliedAlpha));
                if (shader.uniforms.uTransform) {
                    if (mesh.uploadUvTransform) {
                        shader.uniforms.uTransform = mesh._uvTransform.mapCoord.toArray(true);
                    }
                    else {
                        shader.uniforms.uTransform = matrixIdentity.toArray(true);
                    }
                }
                if (isTrimmed) {
                    shader.uniforms.uClampFrame = mesh._uvTransform.uClampFrame;
                }
                shader.uniforms.translationMatrix = mesh.worldTransform.toArray(true);
                shader.uniforms.uLight = mesh.color.light;
                shader.uniforms.uDark = mesh.color.dark;
                var drawMode = mesh.drawMode === mesh_2.Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;
                glData.vao.draw(drawMode, mesh.indices.length, 0);
            };
            MeshHeavenRenderer.vert = "\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform mat3 uTransform;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;\n}\n";
            MeshHeavenRenderer.frag = "\nvarying vec2 vTextureCoord;\nuniform vec4 uLight, uDark;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    vec4 texColor = texture2D(uSampler, vTextureCoord);\n    gl_FragColor.a = texColor.a * uLight.a;\n\tgl_FragColor.rgb = ((texColor.a - 1.0) * uDark.a + 1.0 - texColor.rgb) * uDark.rgb + texColor.rgb * uLight.rgb;\n}\n";
            MeshHeavenRenderer.fragTrim = "\nvarying vec2 vTextureCoord;\nuniform vec4 uLight, uDark;\nuniform vec4 uClampFrame;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    vec2 coord = vTextureCoord;\n    if (coord.x < uClampFrame.x || coord.x > uClampFrame.z\n        || coord.y < uClampFrame.y || coord.y > uClampFrame.w)\n            discard;\n    vec4 texColor = texture2D(uSampler, vTextureCoord);\n    gl_FragColor.a = texColor.a * uLight.a;\n\tgl_FragColor.rgb = ((texColor.a - 1.0) * uDark.a + 1.0 - texColor.rgb) * uDark.rgb + texColor.rgb * uLight.rgb;\n}\n";
            return MeshHeavenRenderer;
        }(PIXI.ObjectRenderer));
        mesh_2.MeshHeavenRenderer = MeshHeavenRenderer;
        PIXI.WebGLRenderer.registerPlugin('meshHeaven', MeshHeavenRenderer);
    })(mesh = pixi_heaven.mesh || (pixi_heaven.mesh = {}));
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var AtlasOptions = (function () {
        function AtlasOptions(src) {
            this.width = 2048;
            this.height = 2048;
            this.loadFactor = 0.95;
            this.repackBeforeResize = true;
            this.repackAfterResize = true;
            this.algoTreeResize = false;
            this.maxSize = 0;
            this.mipLevels = 0;
            this.padding = 0;
            this.format = WebGLRenderingContext.RGBA;
            if (src) {
                this.assign(src);
            }
        }
        AtlasOptions.prototype.assign = function (src) {
            this.width = src.width || this.width;
            this.height = src.height || src.width || this.height;
            this.maxSize = src.maxSize || AtlasOptions.MAX_SIZE;
            this.format = src.format || this.format;
            this.loadFactor = src.loadFactor || this.loadFactor;
            this.padding = src.padding || this.padding;
            this.mipLevels = src.mipLevels || this.mipLevels;
            if (src.repackAfterResize !== undefined) {
                this.repackAfterResize = src.repackAfterResize;
            }
            if (src.repackBeforeResize !== undefined) {
                this.repackBeforeResize = src.repackBeforeResize;
            }
            if (src.algoTreeResize !== undefined) {
                this.algoTreeResize = src.algoTreeResize;
            }
            return this;
        };
        AtlasOptions.MAX_SIZE = 0;
        return AtlasOptions;
    }());
    pixi_heaven.AtlasOptions = AtlasOptions;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var RGBA = WebGLRenderingContext.RGBA;
    var BaseTexture = PIXI.BaseTexture;
    var SuperAtlasEntry = (function () {
        function SuperAtlasEntry() {
        }
        return SuperAtlasEntry;
    }());
    pixi_heaven.SuperAtlasEntry = SuperAtlasEntry;
    var AtlasTree = (function () {
        function AtlasTree() {
            this.failed = [];
            this.good = [];
            this.hash = {};
        }
        AtlasTree.prototype.apply = function () {
            throw new Error("Method not implemented.");
        };
        return AtlasTree;
    }());
    pixi_heaven.AtlasTree = AtlasTree;
    var SuperAtlas = (function () {
        function SuperAtlas() {
            this.baseTexture = null;
            this.format = RGBA;
            this.width = 2048;
            this.height = 2048;
            this.all = {};
            this.tree = null;
            this.imageTextureRebuildUpdateID = 0;
        }
        SuperAtlas.prototype.onTextureNew = function (baseTexture) {
            this.baseTexture = baseTexture;
            baseTexture.resource = this;
            baseTexture.width = this.width;
            baseTexture.height = this.height;
            baseTexture.hasLoaded = true;
            baseTexture.height = this.height;
        };
        SuperAtlas.create = function (options) {
            var opt = options instanceof pixi_heaven.AtlasOptions ? options : new pixi_heaven.AtlasOptions(options);
            var atlas = new SuperAtlas();
            atlas.options = opt;
            atlas.width = opt.width;
            atlas.height = opt.height;
            atlas.format = opt.format;
            atlas.onTextureNew(new PIXI.BaseTexture());
            atlas.tree = new AtlasTree();
            atlas.tree.root = atlas.createAtlasRoot();
            return atlas;
        };
        SuperAtlas.prototype.destroy = function () {
            if (this.baseTexture) {
                this.baseTexture.destroy();
                this.baseTexture = null;
            }
        };
        SuperAtlas.prototype.add = function (texture, swapCache) {
            var baseTexture;
            var arg;
            if (texture instanceof BaseTexture) {
                baseTexture = texture;
                arg = new PIXI.Texture(baseTexture);
            }
            else {
                baseTexture = texture.baseTexture;
                arg = texture;
            }
            var entry = this.all[baseTexture.uid];
            if (!entry) {
                entry = new pixi_heaven.AtlasEntry(this, baseTexture);
                var p1 = this.options.padding, p2 = (1 << this.options.mipLevels);
                var w1 = entry.width + p1, h1 = entry.height + p1;
                entry.width = w1 + (p2 - entry.width % p2) % p2;
                entry.height = h1 + (p2 - entry.height % p2) % p2;
                this.insert(entry);
            }
            var region = new pixi_heaven.TextureRegion(entry, arg);
            if (swapCache) {
                var ids = texture.textureCacheIds;
                for (var i = 0; i < ids.length; i++) {
                    PIXI.utils.TextureCache[ids[i]] = region;
                }
            }
            entry.regions.push(region);
            return region;
        };
        SuperAtlas.prototype.addHash = function (textures, swapCache) {
            var hash = {};
            for (var key in textures) {
                hash[key] = this.add(textures[key], swapCache);
            }
            return hash;
        };
        SuperAtlas.prototype.insert = function (entry) {
            if (this.tryInsert(entry))
                return;
            this.tree.failed.push(entry);
            this.all[entry.baseTexture.uid] = entry;
        };
        SuperAtlas.prototype.remove = function (entry) {
            if (entry.currentNode == null) {
                var failed = this.tree.failed;
                var ind = failed.indexOf(entry);
                if (ind >= 0) {
                    failed.splice(ind, 1);
                }
            }
            else {
                throw new Error("Cant remove packed texture");
            }
        };
        SuperAtlas.prototype.tryInsert = function (entry) {
            var node = this.tree.root.insert(this.width, this.height, entry.width, entry.height, entry);
            if (!node) {
                return false;
            }
            entry.nodeUpdateID = ++this.baseTexture._updateID;
            entry.currentNode = node;
            entry.currentAtlas = this;
            this.all[entry.baseTexture.uid] = entry;
            this.tree.hash[entry.baseTexture.uid] = node;
            this.tree.good.push(entry);
            return true;
        };
        SuperAtlas.prototype.createAtlasRoot = function () {
            var res = new pixi_heaven.AtlasNode();
            if (!this.options.algoTreeResize) {
                res.rect.width = this.width;
                res.rect.height = this.height;
            }
            return res;
        };
        SuperAtlas.prototype.repack = function (failOnFirst) {
            var _this = this;
            if (failOnFirst === void 0) { failOnFirst = false; }
            var pack = new AtlasTree();
            var all = this.tree.good.slice(0);
            var failed = this.tree.failed;
            for (var i = 0; i < failed.length; i++) {
                all.push(failed[i]);
            }
            all.sort(function (a, b) {
                if (b.width == a.width) {
                    return b.height - a.height;
                }
                return b.width - a.width;
            });
            var root = this.createAtlasRoot();
            pack.root = root;
            for (var _i = 0, all_1 = all; _i < all_1.length; _i++) {
                var obj = all_1[_i];
                var node = root.insert(this.width, this.height, obj.width, obj.height, obj);
                if (!node) {
                    pack.failed.push(obj);
                    if (failOnFirst) {
                        return pack;
                    }
                }
                else {
                    pack.hash[obj.baseTexture.uid] = node;
                }
            }
            pack.apply = function () {
                _this.tree.root = pack.root;
                _this.tree.failed = pack.failed.slice(0);
                _this.tree.hash = pack.hash;
                for (var _i = 0, all_2 = all; _i < all_2.length; _i++) {
                    var obj = all_2[_i];
                    obj.currentNode = pack.hash[obj.baseTexture.uid] || null;
                    obj.currentAtlas = obj.currentNode ? _this : null;
                    for (var _a = 0, _b = obj.regions; _a < _b.length; _a++) {
                        var region = _b[_a];
                        region.updateFrame();
                    }
                }
                _this.imageTextureRebuildUpdateID++;
            };
            return pack;
        };
        SuperAtlas.prototype.prepare = function (renderer) {
            renderer.textureManager.updateTexture(this.baseTexture);
            throw new Error("Method not implemented.");
        };
        SuperAtlas.prototype.onTextureUpload = function (renderer, baseTexture, tex) {
            tex.bind();
            var imgTexture = this.baseTexture;
            var gl = tex.gl;
            var levels = this.options.mipLevels;
            tex.mipmap = levels > 0;
            tex.premultiplyAlpha = imgTexture.premultipliedAlpha;
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, imgTexture.premultipliedAlpha);
            var uploadAll = tex._updateID < this.imageTextureRebuildUpdateID;
            if (uploadAll) {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imgTexture.width, imgTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                if (tex.mipmap) {
                    for (var lvl = 1; (imgTexture.width >> lvl) > 0; lvl++) {
                        gl.texImage2D(gl.TEXTURE_2D, lvl, gl.RGBA, imgTexture.width >> lvl, imgTexture.height >> lvl, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                    }
                }
            }
            for (var key in this.tree.hash) {
                var node = this.tree.hash[key];
                var entry = node.data;
                var entryTex = entry.baseTexture;
                if (!uploadAll && tex._updateID >= entry.nodeUpdateID)
                    continue;
                var rect = node.rect;
                gl.texSubImage2D(gl.TEXTURE_2D, 0, rect.left, rect.top, gl.RGBA, gl.UNSIGNED_BYTE, entry.baseTexture.source);
                if (levels > 0) {
                    if (!entryTex._mips || entryTex._mips.length < levels) {
                        entryTex.generateMips(levels);
                    }
                    var mips = entryTex._mips;
                    for (var lvl = 1; lvl <= levels; lvl++) {
                        var mip = mips[lvl - 1];
                        gl.texSubImage2D(gl.TEXTURE_2D, lvl, rect.left >> lvl, rect.top >> lvl, mip.width, mip.height, gl.RGBA, gl.UNSIGNED_BYTE, mip.data);
                    }
                }
            }
            return true;
        };
        SuperAtlas.MAX_SIZE = 2048;
        return SuperAtlas;
    }());
    pixi_heaven.SuperAtlas = SuperAtlas;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var whiteRgba = [1.0, 1.0, 1.0, 1.0];
    var blackRgba = [0.0, 0.0, 0.0, 1.0];
    var ColorTransform = (function () {
        function ColorTransform() {
            this.dark = new Float32Array(blackRgba);
            this.light = new Float32Array(whiteRgba);
            this._updateID = 0;
            this._currentUpdateID = -1;
            this.darkRgba = 0;
            this.lightRgba = -1;
            this.hasNoTint = true;
        }
        Object.defineProperty(ColorTransform.prototype, "darkR", {
            get: function () {
                return this.dark[0];
            },
            set: function (value) {
                if (this.dark[0] === value)
                    return;
                this.dark[0] = value;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "darkG", {
            get: function () {
                return this.dark[1];
            },
            set: function (value) {
                if (this.dark[1] === value)
                    return;
                this.dark[1] = value;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "darkB", {
            get: function () {
                return this.dark[2];
            },
            set: function (value) {
                if (this.dark[2] === value)
                    return;
                this.dark[2] = value;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "lightR", {
            get: function () {
                return this.light[0];
            },
            set: function (value) {
                if (this.light[0] === value)
                    return;
                this.light[0] = value;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "lightG", {
            get: function () {
                return this.light[1];
            },
            set: function (value) {
                if (this.light[1] === value)
                    return;
                this.light[1] = value;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "lightB", {
            get: function () {
                return this.light[2];
            },
            set: function (value) {
                if (this.light[2] === value)
                    return;
                this.light[2] = value;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "alpha", {
            get: function () {
                return this.light[3];
            },
            set: function (value) {
                if (this.light[3] === value)
                    return;
                this.light[3] = value;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "pma", {
            get: function () {
                return this.dark[3] !== 0.0;
            },
            set: function (value) {
                if ((this.dark[3] !== 0.0) !== value)
                    return;
                this.dark[3] = value ? 1.0 : 0.0;
                this._updateID++;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColorTransform.prototype, "tintBGR", {
            get: function () {
                var light = this.light;
                return ((light[0] * 255) << 16) + ((light[1] * 255) << 8) + (light[2] * 255 | 0);
            },
            set: function (value) {
                this.setLight(((value >> 16) & 0xff) / 255.0, ((value >> 8) & 0xff) / 255.0, (value & 0xff) / 255.0);
            },
            enumerable: true,
            configurable: true
        });
        ColorTransform.prototype.setLight = function (R, G, B) {
            var color = this.light;
            if (color[0] === R && color[1] === G && color[2] === B) {
                return;
            }
            color[0] = R;
            color[1] = G;
            color[2] = B;
            this._updateID++;
        };
        ColorTransform.prototype.setDark = function (R, G, B) {
            var color = this.dark;
            if (color[0] === R && color[1] === G && color[2] === B) {
                return;
            }
            color[0] = R;
            color[1] = G;
            color[2] = B;
            this._updateID++;
        };
        ColorTransform.prototype.clear = function () {
            this.dark[0] = 0.0;
            this.dark[1] = 0.0;
            this.dark[2] = 0.0;
            this.light[0] = 1.0;
            this.light[1] = 1.0;
            this.light[2] = 1.0;
        };
        ColorTransform.prototype.invalidate = function () {
            this._updateID++;
        };
        ColorTransform.prototype.updateTransformLocal = function () {
            var dark = this.dark, light = this.light;
            var la = 255 * (1.0 + (light[3] - 1.0) * dark[3]);
            this.hasNoTint = dark[0] === 0.0 && dark[1] === 0.0 && dark[2] === 0.0
                && light[0] === 1.0 && light[1] === 1.0 && light[2] === 1.0;
            this.darkRgba = (dark[0] * la | 0) + ((dark[1] * la) << 8)
                + ((dark[2] * la) << 16) + ((dark[3] * 255) << 24);
            this.lightRgba = (light[0] * la | 0) + ((light[1] * la) << 8)
                + ((light[2] * la) << 16) + ((light[3] * 255) << 24);
            this._currentUpdateID = this._updateID;
        };
        ColorTransform.prototype.updateTransform = function () {
            if (this._currentUpdateID === this._updateID) {
                return;
            }
            this.updateTransformLocal();
        };
        return ColorTransform;
    }());
    pixi_heaven.ColorTransform = ColorTransform;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    PIXI.Container.prototype.convertToHeaven = function () {
    };
    function tintGet() {
        return this.color.tintBGR;
    }
    function tintSet(value) {
        this.color.tintBGR = value;
    }
    function tintRGBGet() {
        this.color.updateTransform();
        return this.color.lightRgba & 0xffffff;
    }
    PIXI.Sprite.prototype.convertToHeaven = function () {
        if (this.color) {
            return;
        }
        Object.defineProperty(this, "tint", {
            get: tintGet,
            set: tintSet,
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(this, "_tintRGB", {
            get: tintRGBGet,
            enumerable: true,
            configurable: true
        });
        this._onTextureUpdate = pixi_heaven.Sprite.prototype._onTextureUpdate;
        this.updateTransform = pixi_heaven.Sprite.prototype.updateTransform;
        this.color = new pixi_heaven.ColorTransform();
        this.pluginName = 'spriteHeaven';
        return this;
    };
    PIXI.Container.prototype.convertSubtreeToHeaven = function () {
        if (this.convertToHeaven) {
            this.convertToHeaven();
        }
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].convertSubtreeToHeaven();
        }
    };
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var sign = PIXI.utils.sign;
    var tempMat = new PIXI.Matrix();
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite(texture) {
            var _this = _super.call(this, texture) || this;
            _this.color = new pixi_heaven.ColorTransform();
            _this.maskSprite = null;
            _this.maskVertexData = null;
            _this.pluginName = 'spriteHeaven';
            if (_this.texture.valid)
                _this._onTextureUpdate();
            return _this;
        }
        Object.defineProperty(Sprite.prototype, "_tintRGB", {
            get: function () {
                this.color.updateTransform();
                return this.color.lightRgba & 0xffffff;
            },
            set: function (value) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "tint", {
            get: function () {
                return this.color ? this.color.tintBGR : 0xffffff;
            },
            set: function (value) {
                this.color && (this.color.tintBGR = value);
            },
            enumerable: true,
            configurable: true
        });
        Sprite.prototype.updateTransform = function () {
            this._boundsID++;
            this.transform.updateTransform(this.parent.transform);
            this.worldAlpha = this.alpha * this.parent.worldAlpha;
            if (this.color) {
                this.color.alpha = this.worldAlpha;
                this.color.updateTransform();
            }
            for (var i = 0, j = this.children.length; i < j; ++i) {
                var child = this.children[i];
                if (child.visible) {
                    child.updateTransform();
                }
            }
        };
        Sprite.prototype._onTextureUpdate = function () {
            this._textureID = -1;
            this._textureTrimmedID = -1;
            this.cachedTint = 0xFFFFFF;
            if (this.color) {
                this.color.pma = this._texture.baseTexture.premultipliedAlpha;
            }
            if (this._width) {
                this.scale.x = sign(this.scale.x) * this._width / this._texture.orig.width;
            }
            if (this._height) {
                this.scale.y = sign(this.scale.y) * this._height / this._texture.orig.height;
            }
        };
        Sprite.prototype.calculateMaskVertices = function () {
            var maskSprite = this.maskSprite;
            var tex = maskSprite.texture;
            var orig = tex.orig;
            var anchor = maskSprite.anchor;
            if (!tex.valid) {
                return;
            }
            if (!tex.transform) {
                tex.transform = new PIXI.TextureMatrix(tex, 0.0);
            }
            tex.transform.update();
            maskSprite.transform.worldTransform.copy(tempMat);
            tempMat.invert();
            tempMat.scale(1.0 / orig.width, 1.0 / orig.height);
            tempMat.translate(anchor.x, anchor.y);
            tempMat.prepend(tex.transform.mapCoord);
            if (!this.maskVertexData) {
                this.maskVertexData = new Float32Array(8);
            }
            var vertexData = this.vertexData;
            var maskVertexData = this.maskVertexData;
            for (var i = 0; i < 8; i += 2) {
                maskVertexData[i] = vertexData[i] * tempMat.a + vertexData[i + 1] * tempMat.c + tempMat.tx;
                maskVertexData[i + 1] = vertexData[i] * tempMat.b + vertexData[i + 1] * tempMat.d + tempMat.ty;
            }
        };
        return Sprite;
    }(PIXI.Sprite));
    pixi_heaven.Sprite = Sprite;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var MultiTextureSpriteRenderer = pixi_heaven.webgl.MultiTextureSpriteRenderer;
    var SpriteHeavenRenderer = (function (_super) {
        __extends(SpriteHeavenRenderer, _super);
        function SpriteHeavenRenderer() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.shaderVert = "precision highp float;\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aLight, aDark;\nattribute float aTextureId;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vLight, vDark;\nvarying float vTextureId;\n\nvoid main(void){\n    gl_Position.xyw = projectionMatrix * vec3(aVertexPosition, 1.0);\n    gl_Position.z = 0.0;\n    \n    vTextureCoord = aTextureCoord;\n    vTextureId = aTextureId;\n    vLight = aLight;\n    vDark = aDark;\n}\n";
            _this.shaderFrag = "\nvarying vec2 vTextureCoord;\nvarying vec4 vLight, vDark;\nvarying float vTextureId;\nuniform sampler2D uSamplers[%count%];\n\nvoid main(void) {\nvec4 texColor;\nvec2 texCoord = vTextureCoord;\nfloat textureId = floor(vTextureId+0.5);\n%forloop%\ngl_FragColor.a = texColor.a * vLight.a;\ngl_FragColor.rgb = ((texColor.a - 1.0) * vDark.a + 1.0 - texColor.rgb) * vDark.rgb + texColor.rgb * vLight.rgb;\n}";
            return _this;
        }
        SpriteHeavenRenderer.prototype.createVao = function (vertexBuffer) {
            var attrs = this.shader.attributes;
            this.vertSize = attrs.aTextureId ? 6 : 5;
            this.vertByteSize = this.vertSize * 4;
            var gl = this.renderer.gl;
            var vao = this.renderer.createVao()
                .addIndex(this.indexBuffer)
                .addAttribute(vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0)
                .addAttribute(vertexBuffer, attrs.aTextureCoord, gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4)
                .addAttribute(vertexBuffer, attrs.aLight, gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4)
                .addAttribute(vertexBuffer, attrs.aDark, gl.UNSIGNED_BYTE, true, this.vertByteSize, 4 * 4);
            if (attrs.aTextureId) {
                vao.addAttribute(vertexBuffer, attrs.aTextureId, gl.FLOAT, false, this.vertByteSize, 5 * 4);
            }
            return vao;
        };
        SpriteHeavenRenderer.prototype.fillVertices = function (float32View, uint32View, index, sprite, textureId) {
            var vertexData = sprite.vertexData;
            var uvs = sprite._texture._uvs.uvsUint32;
            var n = vertexData.length / 2;
            var lightRgba = sprite.color.lightRgba;
            var darkRgba = sprite.color.darkRgba;
            var stride = this.vertSize;
            var oldIndex = index;
            for (var i = 0; i < n; i++) {
                float32View[index] = vertexData[i * 2];
                float32View[index + 1] = vertexData[i * 2 + 1];
                uint32View[index + 2] = uvs[i];
                uint32View[index + 3] = lightRgba;
                uint32View[index + 4] = darkRgba;
                index += stride;
            }
            if (stride === 6) {
                index = oldIndex + 5;
                for (var i = 0; i < n; i++) {
                    float32View[index] = textureId;
                    index += stride;
                }
            }
        };
        return SpriteHeavenRenderer;
    }(MultiTextureSpriteRenderer));
    PIXI.WebGLRenderer.registerPlugin('spriteHeaven', SpriteHeavenRenderer);
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var webgl;
    (function (webgl) {
        var MultiTextureSpriteRenderer = pixi_heaven.webgl.MultiTextureSpriteRenderer;
        var GLBuffer = PIXI.glCore.GLBuffer;
        var settings = PIXI.settings;
        var premultiplyBlendMode = PIXI.utils.premultiplyBlendMode;
        var tempArray = new Float32Array([0, 0, 0, 0]);
        var SpriteMaskedRenderer = (function (_super) {
            __extends(SpriteMaskedRenderer, _super);
            function SpriteMaskedRenderer() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.shaderVert = "precision highp float;\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aLight, aDark;\nattribute float aTextureId;\nattribute vec2 aMaskCoord;\nattribute vec4 aMaskClamp;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vLight, vDark;\nvarying float vTextureId;\nvarying vec2 vMaskCoord;\nvarying vec4 vMaskClamp;\n\nvoid main(void){\n    gl_Position.xyw = projectionMatrix * vec3(aVertexPosition, 1.0);\n    gl_Position.z = 0.0;\n    \n    vTextureCoord = aTextureCoord;\n    vLight = aLight;\n    vDark = aDark;\n    vTextureId = aTextureId;\n    vMaskCoord = aMaskCoord;\n    vMaskClamp = aMaskClamp;\n}\n";
                _this.shaderFrag = "\nvarying vec2 vTextureCoord;\nvarying vec4 vLight, vDark;\nvarying float vTextureId;\nvarying vec2 vMaskCoord;\nvarying vec4 vMaskClamp;\nuniform sampler2D uSamplers[2];\nuniform sampler2D uMask;\n\nvoid main(void) {\nvec4 texColor = texture2D(uSamplers[0], vTextureCoord);\n\nfloat clip = step(3.5,\n    step(vMaskClamp.x, vMaskCoord.x) +\n    step(vMaskClamp.y, vMaskCoord.y) +\n    step(vMaskCoord.x, vMaskClamp.z) +\n    step(vMaskCoord.y, vMaskClamp.w));\n\nvec4 maskColor = texture2D(uSamplers[1], vMaskCoord);\n\nvec2 texCoord = vTextureCoord;\nvec4 fragColor;\nfragColor.a = texColor.a * vLight.a;\nfragColor.rgb = ((texColor.a - 1.0) * vDark.a + 1.0 - texColor.rgb) * vDark.rgb + texColor.rgb * vLight.rgb;\ngl_FragColor = fragColor * (vTextureId * (maskColor.a * maskColor.r * clip) + 1.0 - vTextureId);\n}";
                return _this;
            }
            SpriteMaskedRenderer.prototype.createVao = function (vertexBuffer) {
                var attrs = this.shader.attributes;
                this.vertSize = 12;
                this.vertByteSize = this.vertSize * 4;
                var gl = this.renderer.gl;
                var vao = this.renderer.createVao()
                    .addIndex(this.indexBuffer)
                    .addAttribute(vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0)
                    .addAttribute(vertexBuffer, attrs.aTextureCoord, gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4)
                    .addAttribute(vertexBuffer, attrs.aLight, gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4)
                    .addAttribute(vertexBuffer, attrs.aDark, gl.UNSIGNED_BYTE, true, this.vertByteSize, 4 * 4)
                    .addAttribute(vertexBuffer, attrs.aTextureId, gl.FLOAT, false, this.vertByteSize, 5 * 4)
                    .addAttribute(vertexBuffer, attrs.aMaskCoord, gl.FLOAT, false, this.vertByteSize, 6 * 4)
                    .addAttribute(vertexBuffer, attrs.aMaskClamp, gl.FLOAT, false, this.vertByteSize, 8 * 4);
                return vao;
            };
            SpriteMaskedRenderer.prototype.fillVertices = function (float32View, uint32View, index, sprite, textureId) {
                var vertexData = sprite.vertexData;
                var uvs = sprite._texture._uvs.uvsUint32;
                var n = vertexData.length / 2;
                var lightRgba = sprite.color.lightRgba;
                var darkRgba = sprite.color.darkRgba;
                var stride = this.vertSize;
                var mask = sprite.maskSprite;
                var clamp = tempArray;
                var maskVertexData = tempArray;
                if (mask) {
                    sprite.calculateMaskVertices();
                    clamp = mask._texture.transform.uClampFrame;
                    maskVertexData = sprite.maskVertexData;
                }
                for (var i = 0; i < n; i++) {
                    float32View[index] = vertexData[i * 2];
                    float32View[index + 1] = vertexData[i * 2 + 1];
                    uint32View[index + 2] = uvs[i];
                    uint32View[index + 3] = lightRgba;
                    uint32View[index + 4] = darkRgba;
                    float32View[index + 5] = mask ? 1 : 0;
                    float32View[index + 6] = maskVertexData[i * 2];
                    float32View[index + 7] = maskVertexData[i * 2 + 1];
                    float32View[index + 8] = clamp[0];
                    float32View[index + 9] = clamp[1];
                    float32View[index + 10] = clamp[2];
                    float32View[index + 11] = clamp[3];
                    index += stride;
                }
            };
            SpriteMaskedRenderer.prototype.flush = function () {
                if (this.currentIndex === 0) {
                    return;
                }
                var gl = this.renderer.gl;
                var MAX_TEXTURES = this.MAX_TEXTURES;
                var np2 = pixi_heaven.utils.nextPow2(this.currentIndex);
                var log2 = pixi_heaven.utils.log2(np2);
                var buffer = this.buffers[log2];
                var sprites = this.sprites;
                var groups = this.groups;
                var float32View = buffer.float32View;
                var uint32View = buffer.uint32View;
                var index = 0;
                var nextTexture, nextMaskTexture;
                var currentTexture = null, currentMaskTexture = null;
                var currentUniforms = null;
                var groupCount = 1;
                var textureCount = 0;
                var currentGroup = groups[0];
                var blendMode = premultiplyBlendMode[sprites[0]._texture.baseTexture.premultipliedAlpha ? 1 : 0][sprites[0].blendMode];
                currentGroup.textureCount = 0;
                currentGroup.start = 0;
                currentGroup.blend = blendMode;
                var i;
                for (i = 0; i < this.currentIndex; ++i) {
                    var sprite = sprites[i];
                    nextTexture = sprite.texture.baseTexture;
                    nextMaskTexture = null;
                    if (sprite.maskSprite) {
                        sprite.calculateMaskVertices();
                        nextMaskTexture = sprite.maskSprite.texture.baseTexture;
                        if (currentMaskTexture === null) {
                            currentMaskTexture = nextMaskTexture;
                            currentGroup.textures[1] = nextMaskTexture;
                        }
                        else {
                            currentTexture = null;
                            currentMaskTexture = null;
                            textureCount = MAX_TEXTURES;
                        }
                    }
                    var spriteBlendMode = premultiplyBlendMode[Number(nextTexture.premultipliedAlpha)][sprite.blendMode];
                    if (blendMode !== spriteBlendMode) {
                        blendMode = spriteBlendMode;
                        currentTexture = null;
                        currentMaskTexture = null;
                        textureCount = MAX_TEXTURES;
                    }
                    var uniforms = this.getUniforms(sprite);
                    if (currentUniforms !== uniforms) {
                        currentUniforms = uniforms;
                        currentTexture = null;
                        currentMaskTexture = null;
                        textureCount = MAX_TEXTURES;
                    }
                    if (currentTexture !== nextTexture) {
                        currentTexture = nextTexture;
                        currentMaskTexture = nextMaskTexture;
                        if (textureCount === MAX_TEXTURES) {
                            textureCount = 0;
                            currentGroup.size = i - currentGroup.start;
                            currentGroup = groups[groupCount++];
                            currentGroup.textureCount = 0;
                            currentGroup.blend = blendMode;
                            currentGroup.start = i;
                            currentGroup.uniforms = currentUniforms;
                        }
                        nextTexture._virtalBoundId = textureCount;
                        currentGroup.textureCount = MAX_TEXTURES;
                        currentGroup.textures[0] = nextTexture;
                        currentGroup.textures[1] = nextMaskTexture || PIXI.Texture.WHITE.baseTexture;
                        textureCount = MAX_TEXTURES;
                    }
                    this.fillVertices(float32View, uint32View, index, sprite, nextTexture._virtalBoundId);
                    index += this.vertSize * 4;
                }
                currentGroup.size = i - currentGroup.start;
                if (!settings.CAN_UPLOAD_SAME_BUFFER) {
                    if (this.vaoMax <= this.vertexCount) {
                        this.vaoMax++;
                        var attrs = this.shader.attributes;
                        var vertexBuffer = this.vertexBuffers[this.vertexCount] = GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);
                        this.vaos[this.vertexCount] = this.createVao(vertexBuffer);
                    }
                    this.renderer.bindVao(this.vaos[this.vertexCount]);
                    this.vertexBuffers[this.vertexCount].upload(buffer.vertices, 0, false);
                    this.vertexCount++;
                }
                else {
                    this.vertexBuffers[this.vertexCount].upload(buffer.vertices, 0, true);
                }
                currentUniforms = null;
                for (i = 0; i < groupCount; i++) {
                    var group = groups[i];
                    var groupTextureCount = 2;
                    if (group.uniforms !== currentUniforms) {
                        this.syncUniforms(group.uniforms);
                    }
                    for (var j = 0; j < groupTextureCount; j++) {
                        this.renderer.bindTexture(group.textures[j], j, true);
                        group.textures[j]._virtalBoundId = -1;
                        var v = this.shader.uniforms.samplerSize;
                        if (v) {
                            v[0] = group.textures[j].realWidth;
                            v[1] = group.textures[j].realHeight;
                            this.shader.uniforms.samplerSize = v;
                        }
                    }
                    this.renderer.state.setBlendMode(group.blend);
                    gl.drawElements(gl.TRIANGLES, group.size * 6, gl.UNSIGNED_SHORT, group.start * 6 * 2);
                }
                this.currentIndex = 0;
            };
            SpriteMaskedRenderer.prototype.genShader = function () {
                var gl = this.renderer.gl;
                this.MAX_TEXTURES = 2;
                this.shader = webgl.generateMultiTextureShader(this.shaderVert, this.shaderFrag, gl, this.MAX_TEXTURES);
            };
            return SpriteMaskedRenderer;
        }(MultiTextureSpriteRenderer));
        PIXI.WebGLRenderer.registerPlugin('spriteMasked', SpriteMaskedRenderer);
    })(webgl = pixi_heaven.webgl || (pixi_heaven.webgl = {}));
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var SpriteModel = (function () {
        function SpriteModel() {
        }
        return SpriteModel;
    }());
    pixi_heaven.SpriteModel = SpriteModel;
})(pixi_heaven || (pixi_heaven = {}));
var pixi_heaven;
(function (pixi_heaven) {
    var spine;
    (function (spine_1) {
        var Spine = (function (_super) {
            __extends(Spine, _super);
            function Spine(spineData) {
                var _this = _super.call(this, spineData) || this;
                _this.hasSpriteMask = false;
                _this.color = new pixi_heaven.ColorTransform();
                return _this;
            }
            Spine.prototype.newSprite = function (tex) {
                return new SpineSprite(tex, this);
            };
            return Spine;
        }(PIXI.spine.Spine));
        spine_1.Spine = Spine;
        var SpineSprite = (function (_super) {
            __extends(SpineSprite, _super);
            function SpineSprite(tex, spine) {
                var _this = _super.call(this, tex) || this;
                _this.region = null;
                _this.spine = spine;
                return _this;
            }
            SpineSprite.prototype._renderWebGL = function (renderer) {
                if (this.maskSprite) {
                    this.spine.hasSpriteMask = true;
                }
                if (this.spine.hasSpriteMask) {
                    this.pluginName = 'spriteMasked';
                }
                _super.prototype._renderWebGL.call(this, renderer);
            };
            return SpineSprite;
        }(pixi_heaven.Sprite));
        spine_1.SpineSprite = SpineSprite;
    })(spine = pixi_heaven.spine || (pixi_heaven.spine = {}));
})(pixi_heaven || (pixi_heaven = {}));
//# sourceMappingURL=pixi-heaven.js.map