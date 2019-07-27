declare module PIXI {
	interface BaseTexture {
		uid: number;
		_updateID: number;
		_mips: Array<ImageData>;
		resource: pixi_heaven.ITextureResource
		forceUploadStyle: boolean;

		generateMips(levels: number): void;
	}

	interface BaseRenderTexture {
		uid: number;

		generateMips(levels: number): void;
	}
}

module pixi_heaven {
	PIXI.BaseTexture.prototype._updateID = 0;
	PIXI.BaseTexture.prototype.resource = null;
	PIXI.BaseTexture.prototype.forceUploadStyle = true;

	let tmpCanvas: HTMLCanvasElement;

	PIXI.BaseTexture.prototype.generateMips = function (levels: number) {
		if (!levels) return;
		let src = this.source;

		if (!tmpCanvas) tmpCanvas = document.createElement("canvas");

		let sw = ((src.width + 1) >> 1) << 1;
		let h = src.height;
		let sh = 0;
		for (let i = 1; i <= levels; i++) {
			sh += h;
			h = (h + 1) >> 1;
		}

		if (tmpCanvas.width < sw) {
			tmpCanvas.width = sw;
		}
		if (tmpCanvas.height < sh) {
			tmpCanvas.height = sh;
		}
		let context = tmpCanvas.getContext("2d");
		context.clearRect(0, 0, sw, sh);

		this._mips = [];

		let w = src.width;
		h = src.height;
		context.drawImage(src, 0, 0, w, h, 0, 0, w / 2, h / 2);
		let h1 = 0;
		for (let i = 1; i <= levels; i++) {
			w = (w + 1) >> 1;
			h = (h + 1) >> 1;
			let data = context.getImageData(0, h1, w, h);
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
	}
}