namespace pixi_heaven {
	export interface IFrameObject {
		texture: PIXI.Texture;
		time: number;
	}

	export interface ITextureAnimationTarget {
		texture: PIXI.Texture;
		animState: AnimationState;
	}

	export class AnimationState {
		texture: PIXI.Texture;

		_textures: Array<PIXI.Texture> = null;
		_durations: Array<number> = null;
		_autoUpdate: boolean;
		animationSpeed: number = 1;
		_target: ITextureAnimationTarget;
		loop = true;
		onComplete: Function = null;
		onFrameChange: Function = null;
		onLoop: Function = null;
		_currentTime: number = 0;
		playing: boolean = false;

		constructor(textures: Array<PIXI.Texture> | Array<IFrameObject>, autoUpdate?: boolean) {
			this.texture = textures[0] instanceof PIXI.Texture ? textures[0] as PIXI.Texture : (textures[0] as IFrameObject).texture;

			this.textures = textures as Array<PIXI.Texture>;

			this._autoUpdate = autoUpdate !== false;
		}

		/**
		 * Stops the AnimatedSprite
		 *
		 */
		stop() {
			if (!this.playing) {
				return;
			}

			this.playing = false;
			if (this._autoUpdate) {
				PIXI.Ticker.shared.remove(this.update, this);
			}
		}

		/**
		 * Plays the AnimatedSprite
		 *
		 */
		play() {
			if (this.playing) {
				return;
			}

			this.playing = true;
			if (this._autoUpdate) {
				PIXI.Ticker.shared.add(this.update, this, PIXI.UPDATE_PRIORITY.HIGH);
			}
		}

		/**
		 * Stops the AnimatedSprite and goes to a specific frame
		 *
		 * @param {number} frameNumber - frame index to stop at
		 */
		gotoAndStop(frameNumber: number) {
			this.stop();

			const previousFrame = this.currentFrame;

			this._currentTime = frameNumber;

			if (previousFrame !== this.currentFrame) {
				this.updateTexture();
			}
		}

		/**
		 * Goes to a specific frame and begins playing the AnimatedSprite
		 *
		 * @param {number} frameNumber - frame index to start at
		 */
		gotoAndPlay(frameNumber: number) {
			const previousFrame = this.currentFrame;

			this._currentTime = frameNumber;

			if (previousFrame !== this.currentFrame) {
				this.updateTexture();
			}

			this.play();
		}

		/**
		 * Updates the object transform for rendering.
		 *
		 * @private
		 * @param {number} deltaTime - Time since last tick.
		 */
		update(deltaTime: number) {
			const elapsed = this.animationSpeed * deltaTime;
			const previousFrame = this.currentFrame;

			if (this._durations !== null) {
				let lag = this._currentTime % 1 * this._durations[this.currentFrame];

				lag += elapsed / 60 * 1000;

				while (lag < 0) {
					this._currentTime--;
					lag += this._durations[this.currentFrame];
				}

				let sign = this.animationSpeed * deltaTime;

				if (sign < 0) sign = -1;
				else if (sign > 0) sign = 1;

				this._currentTime = Math.floor(this._currentTime);

				while (lag >= this._durations[this.currentFrame]) {
					lag -= this._durations[this.currentFrame] * sign;
					this._currentTime += sign;
				}

				this._currentTime += lag / this._durations[this.currentFrame];
			}
			else {
				this._currentTime += elapsed;
			}

			if (this._currentTime < 0 && !this.loop) {
				this.gotoAndStop(0);

				if (this.onComplete) {
					this.onComplete();
				}
			}
			else if (this._currentTime >= this._textures.length && !this.loop) {
				this.gotoAndStop(this._textures.length - 1);

				if (this.onComplete) {
					this.onComplete();
				}
			}
			else if (previousFrame !== this.currentFrame) {
				if (this.loop && this.onLoop) {
					if (this.animationSpeed > 0 && this.currentFrame < previousFrame) {
						this.onLoop();
					}
					else if (this.animationSpeed < 0 && this.currentFrame > previousFrame) {
						this.onLoop();
					}
				}

				this.updateTexture();
			}
		}

		/**
		 * Updates the displayed texture to match the current frame index
		 *
		 * @private
		 */
		updateTexture() {
			this.texture = this._textures[this.currentFrame];
			if (this._target) {
				this._target.texture = this.texture;
			}
			if (this.onFrameChange) {
				this.onFrameChange(this.currentFrame);
			}
		}

		bind(target: ITextureAnimationTarget) {
			this._target = target;
			target.animState = this;
		}

		/**
		 * A short hand way of creating a movieclip from an array of frame ids
		 *
		 * @static
		 * @param {string[]} frames - The array of frames ids the movieclip will use as its texture frames
		 * @return {AnimatedSprite} The new animated sprite with the specified frames.
		 */
		static fromFrames(frames: Array<string>) {
			const textures = [];

			for (let i = 0; i < frames.length; ++i) {
				textures.push(PIXI.Texture.from(frames[i]));
			}

			return new AnimationState(textures);
		}

		/**
		 * A short hand way of creating a movieclip from an array of image ids
		 *
		 * @static
		 * @param {string[]} images - the array of image urls the movieclip will use as its texture frames
		 * @return {AnimatedSprite} The new animate sprite with the specified images as frames.
		 */
		static fromImages(images: Array<string>) {
			const textures = [];

			for (let i = 0; i < images.length; ++i) {
				textures.push(PIXI.Texture.from(images[i]));
			}

			return new AnimationState(textures);
		}

		/**
		 * totalFrames is the total number of frames in the AnimatedSprite. This is the same as number of textures
		 * assigned to the AnimatedSprite.
		 *
		 * @readonly
		 * @member {number}
		 * @default 0
		 */
		get totalFrames() {
			return this._textures.length;
		}

		/**
		 * The array of textures used for this AnimatedSprite
		 *
		 * @member {PIXI.Texture[]}
		 */
		get textures() {
			return this._textures;
		}

		set textures(value) {
			if (value[0] instanceof PIXI.Texture) {
				this._textures = value;
				this._durations = null;
			}
			else {
				this._textures = [];
				this._durations = [];

				for (let i = 0; i < value.length; i++) {
					const val = (value as any)[i];
					this._textures.push(val.texture);
					this._durations.push(val.time);
				}
			}
			this.gotoAndStop(0);
			this.updateTexture();
		}

		get currentFrame()
		{
			let currentFrame = Math.floor(this._currentTime) % this._textures.length;

			if (currentFrame < 0)
			{
				currentFrame += this._textures.length;
			}

			return currentFrame;
		}
	}
}
