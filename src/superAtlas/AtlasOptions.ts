namespace pixi_heaven {
	export interface IAtlasOptions {
		width ?: number;
		height ?: number;
		loadFactor ?: number;
		repackBeforeResize ?: boolean;
		repackAfterResize ?: boolean;
		algoTreeResize?: boolean;
		maxSize ?: number;
		format ?: number;
		hasAllFields ?: boolean;
		mipLevels ?: number;
		padding ?: number;
	}

	export class AtlasOptions implements IAtlasOptions {
		width = 2048;
		height = 2048;
		loadFactor = 0.95;
		repackBeforeResize = true;
		repackAfterResize = true;
		algoTreeResize = false;
		maxSize = 0;
		mipLevels = 0;
		padding = 0;

		format = WebGLRenderingContext.RGBA;

		static MAX_SIZE = 0;

		constructor(src: IAtlasOptions) {
			if (src) {
				this.assign(src);
			}
		}

		assign(src: IAtlasOptions) {
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
		}
	}
}
