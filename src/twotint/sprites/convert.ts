import {Container} from "@pixi/display";
import {Sprite} from "@pixi/sprite";
import {SpriteH} from "./SpriteH";
import {ColorTransform} from "../ColorTransform";

export function applyConvertMixins() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Container.prototype.convertToHeaven = function () {
    };

    function tintGet() {
        return this.color.tintBGR;
    }

    function tintSet(value: number) {
        this.color.tintBGR = value;
    }

    function tintRGBGet() {
        this.color.updateTransform();
        return this.color.lightRgba & 0xffffff;
    }

    const SpriteProto = SpriteH.prototype as any;

    Sprite.prototype.convertToHeaven = function () {
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
        this._onTextureUpdate = SpriteProto._onTextureUpdate;
        this._render = SpriteProto._render;
        this._calculateBounds = SpriteProto._calculateBounds;
        this.calculateVertices = SpriteProto.calculateVertices;
        this._onTextureUpdate = SpriteProto._onTextureUpdate;
        this.calculateMaskVertices = SpriteProto.calculateMaskVertices;
        this.destroy = SpriteH.prototype.destroy;
        this.color = new ColorTransform();
        this.pluginName = 'batchHeaven';

        if (this._texture.valid) {
            this._onTextureUpdate();
        } else {
            this._texture.off('update', this._onTextureUpdate);
            this._texture.on('update', this._onTextureUpdate, this);
        }
        return this;
    };

    Container.prototype.convertSubtreeToHeaven = function () {
        if (this.convertToHeaven) {
            this.convertToHeaven();
        }
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].convertSubtreeToHeaven();
        }
    };
}
