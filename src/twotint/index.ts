export * from './mesh/MeshH';
export * from './mesh/DoubleTintMeshMaterial';

export * from './sprites/convert';
export * from './sprites/HeavenBatchRenderer';
export * from './sprites/LoopShaderGenerator';
export * from './sprites/MaskedBatchRenderer';
export * from './sprites/SpriteH';

export * from './BitmapTextH';
export * from './ColorTransform';

import { extensions } from '@pixi/core';
import { HeavenBatchRenderer } from './sprites/HeavenBatchRenderer';
import { MaskedBatchRenderer } from './sprites/MaskedBatchRenderer';
import { applyConvertMixins } from './sprites/convert';

extensions.add(HeavenBatchRenderer);
extensions.add(MaskedBatchRenderer);
applyConvertMixins();
