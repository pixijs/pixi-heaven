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
		hasNoTint: boolean;

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

		get tintRgb() {
			const light = this.light;
			return (light[0] << 16) + (light[1] << 8) + (light[2] | 0);
		}

		set tintRgb(value: number) {
			const light = this.light;

			light[0] = (value >> 16) & 0xff;
			light[1] = (value >> 8) & 0xff;
			light[2] = value & 0xff;
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
			const la = 255 * (1.0 + (light[3] - 1.0) * dark[3]);

			this.hasNoTint = dark[0] === 0.0 && dark[1] === 0.0 && dark[2] === 0.0
				&& light[0] === 1.0 && light[1] === 1.0 && light[2] === 1.0;
			this.darkArgb = (dark[0] * la | 0) + ((dark[1] * la) << 8)
				+ ((dark[2] * la) << 16) + ((dark[3] * 255) << 24);
			this.lightArgb = (light[0] * la | 0) + ((light[1] * la) << 8)
				+ ((light[2] * la) << 16) + ((light[3] * 255) << 24);
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
