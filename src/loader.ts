declare module PIXI.loaders {
	interface Resource {
		spritesheet?: PIXI.Spritesheet;
	}
}

namespace pixi_heaven {
	import Resource = PIXI.loaders.Resource;

	export function atlasChecker() {
		return function (resource: PIXI.loaders.Resource, next: () => any) {
			let atlas = resource.metadata.runtimeAtlas as IAtlas;
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

			//TODO: something about spine

			next();
		};
	}

	PIXI.loaders.Loader.addPixiMiddleware(atlasChecker);
	PIXI.loader.use(atlasChecker());
}