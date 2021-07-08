import {MaskedPluginFactory} from "./sprites/MaskedBatchRenderer";

export * from './mesh/MeshH';
export * from './mesh/DoubleTintMeshMaterial';

export * from './sprites/convert';
export * from './sprites/HeavenBatchRenderer';
export * from './sprites/LoopShaderGenerator';
export * from './sprites/MaskedBatchRenderer';
export * from './sprites/SpriteH';

export * from './BitmapTextH';
export * from './ColorTransform';

import {Renderer} from "@pixi/core";
import {DarkLightPluginFactory} from "./sprites/HeavenBatchRenderer";
import {applyConvertMixins} from "./sprites/convert";

Renderer.registerPlugin('batchHeaven', DarkLightPluginFactory.create({}));
Renderer.registerPlugin('batchMasked', MaskedPluginFactory.create({}));

applyConvertMixins();
