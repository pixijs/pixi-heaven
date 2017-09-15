namespace pixi_color_transform {
	import PointLike = PIXI.PointLike;

	const whiteRgba = [1.0, 1.0, 1.0, 1.0];
	const blackRgba = [0.0, 0.0, 0.0, 1.0];

	export class ColorTransform {
		dark = new Float32Array(blackRgba);
		light = new Float32Array(whiteRgba);

		_updateID = 0;
		_currentUpdateID = -1;

		darkArgb: number;
		lightArgb: number;

		get darkR() {
			return this.dark[0];
		}

		set darkR(value: number) {
			if (this.dark[0] === value) return;
			this.dark[0] = value;
			this._updateID++;
		}

		get darkG() {
			return this.dark[1];
		}

		set darkG(value: number) {
			if (this.dark[1] === value) return;
			this.dark[1] = value;
			this._updateID++;
		}

		get darkB() {
			return this.dark[2];
		}

		set darkB(value: number) {
			if (this.dark[2] === value) return;
			this.dark[2] = value;
			this._updateID++;
		}

		get lightR() {
			return this.light[0];
		}

		set lightR(value: number) {
			if (this.light[0] === value) return;
			this.light[0] = value;
			this._updateID++;
		}

		get lightG() {
			return this.light[1];
		}

		set lightG(value: number) {
			if (this.light[1] === value) return;
			this.light[1] = value;
			this._updateID++;
		}

		get lightB() {
			return this.light[2];
		}

		set lightB(value: number) {
			if (this.light[2] === value) return;
			this.light[2] = value;
			this._updateID++;
		}

		get alpha() {
			return this.light[3];
		}

		set alpha(value: number) {
			if (this.light[3] === value) return;
			this.light[3] = value;
			this._updateID++;
		}

		get pma() {
			return this.dark[3] !== 0.0;
		}

		set pma(value: boolean) {
			if ((this.dark[3] !== 0.0) !== value) return;
			this.dark[3] = value ? 1.0 : 0.0;
			this._updateID++;
		}

		clear() {
			this.dark[0] = 0.0;
			this.dark[1] = 0.0;
			this.dark[2] = 0.0;
			this.light[0] = 1.0;
			this.light[1] = 1.0;
			this.light[2] = 1.0;
		}

		updateTransformLocal() {
			const dark = this.dark, light = this.light;
			this.darkArgb = (dark[0] * 255) + ((dark[1] * 255) << 8)
				+ ((dark[2] * 255) << 16) + ((dark[3] * 255) << 24);
			this.lightArgb = (light[0] * 255) + ((light[1] * 255) << 8)
				+ ((light[2] * 255) << 16) + ((light[3] * 255) << 24);
			this._currentUpdateID = this._updateID;
		}

		updateTransform() {
			if (this._currentUpdateID === this._updateID) {
				return;
			}
			this.updateTransformLocal();
		}
	}
}
