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
    var webgl;
    (function (webgl) {
        var ObjectRenderer = PIXI.ObjectRenderer;
        var settings = PIXI.settings;
        var GLBuffer = PIXI.glCore.GLBuffer;
        var premultiplyBlendMode = PIXI.utils.premultiplyBlendMode;
        var TICK = 0;
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
            MultiTextureSpriteRenderer.prototype.onContextChange = function () {
                var gl = this.renderer.gl;
                this.MAX_TEXTURES = Math.min(this.MAX_TEXTURES_LOCAL, this.renderer.plugins['sprite'].MAX_TEXTURES);
                this.shader = webgl.generateMultiTextureShader(this.shaderVert, this.shaderFrag, gl, this.MAX_TEXTURES);
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
                var vertexData;
                var uvs;
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
                return (light[0] << 16) + (light[1] << 8) + (light[2] | 0);
            },
            set: function (value) {
                var light = this.light;
                light[0] = ((value >> 16) & 0xff) / 255.0;
                light[1] = ((value >> 8) & 0xff) / 255.0;
                light[2] = (value & 0xff) / 255.0;
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
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite(texture) {
            var _this = _super.call(this, texture) || this;
            _this.color = new pixi_heaven.ColorTransform();
            _this.pluginName = 'spriteHeaven';
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
            this.color.pma = this._texture.baseTexture.premultipliedAlpha;
            if (this._width) {
                this.scale.x = sign(this.scale.x) * this._width / this._texture.orig.width;
            }
            if (this._height) {
                this.scale.y = sign(this.scale.y) * this._height / this._texture.orig.height;
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
            for (var i = 0; i < n; i++) {
                float32View[index] = vertexData[i * 2];
                float32View[index + 1] = vertexData[i * 2 + 1];
                uint32View[index + 2] = uvs[i];
                uint32View[index + 3] = lightRgba;
                uint32View[index + 4] = darkRgba;
                index += stride;
            }
            if (stride === 6) {
                for (var i = 0; i < n; i++) {
                    float32View[index + 5] = textureId;
                }
            }
        };
        return SpriteHeavenRenderer;
    }(MultiTextureSpriteRenderer));
    PIXI.WebGLRenderer.registerPlugin('spriteHeaven', SpriteHeavenRenderer);
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
//# sourceMappingURL=pixi-heaven.js.map