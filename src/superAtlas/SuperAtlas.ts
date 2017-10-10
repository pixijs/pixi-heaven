namespace pixi_heaven {
	const RGBA = WebGLRenderingContext.RGBA;
	import BaseTexture = PIXI.BaseTexture;
	import Rectangle = PIXI.Rectangle;

	export class SuperAtlasEntry {
		baseTexture: BaseTexture;
		superAtlas: SuperAtlas;
	}

	export class AtlasTree implements IRepackResult {
		failed: Array<AtlasEntry> = [];

		root: AtlasNode<AtlasEntry>;

		good: Array<AtlasEntry> = [];

		hash: { [key: number]: AtlasNode<AtlasEntry> } = {};

		apply() {
			throw new Error("Method not implemented.");
		}
	}

	export class SuperAtlas implements ITextureResource, IAtlas {
		static MAX_SIZE = 2048;

		baseTexture: PIXI.BaseTexture = null;
		format: number = RGBA;
		width: number = 2048;
		height: number = 2048;
		options: AtlasOptions;

		all: { [key: number]: AtlasEntry } = {};

		tree: AtlasTree = null;

		onTextureNew(baseTexture: PIXI.BaseTexture) {
			this.baseTexture = baseTexture;
			baseTexture.resource = this;
			baseTexture.width = this.width;
			baseTexture.height = this.height;
			baseTexture.hasLoaded = true;
			baseTexture.height = this.height;
		}

		static create(options: IAtlasOptions) {
			let opt = options instanceof AtlasOptions ? options : new AtlasOptions(options);
			let atlas = new SuperAtlas();
			atlas.options = opt;
			atlas.width = opt.width;
			atlas.height = opt.height;
			atlas.format = opt.format;
			atlas.onTextureNew(new PIXI.BaseTexture());

			atlas.tree = new AtlasTree();
			atlas.tree.root = atlas.createAtlasRoot();

			return atlas;
		}

		destroy() {
			if (this.baseTexture) {
				this.baseTexture.destroy();
				this.baseTexture = null;
			}
		}

		add(texture: BaseTexture | PIXI.Texture, swapCache?: boolean): TextureRegion {
			let baseTexture: PIXI.BaseTexture;
			let arg: PIXI.Texture;
			if (texture instanceof BaseTexture) {
				baseTexture = texture as BaseTexture;
				arg = new PIXI.Texture(baseTexture);
			} else {
				baseTexture = texture.baseTexture;
				arg = texture;
			}

			let entry = this.all[baseTexture.uid];
			if (!entry) {
				entry = new AtlasEntry(this, baseTexture);

				// pad it
				let p1 = this.options.padding, p2 = (1 << this.options.mipLevels);
				let w1 = entry.width + p1, h1 = entry.height + p1;
				entry.width = w1 + (p2 - entry.width % p2) % p2;
				entry.height = h1 + (p2 - entry.height % p2) % p2;

				this.insert(entry);
			}

			let region = new TextureRegion(entry, arg);
			if (swapCache) {
				let ids = texture.textureCacheIds;
				for (let i = 0; i < ids.length; i++) {
					PIXI.utils.TextureCache[ids[i]] = region;
				}
			}

			entry.regions.push(region);
			return region;
		}

		addHash(textures: { [key: string]: PIXI.Texture; }, swapCache?: boolean): { [key: string]: TextureRegion; } {
			let hash: { [key: string]: TextureRegion; } = {};
			for (let key in textures) {
				hash[key] = this.add(textures[key], swapCache);
			}
			return hash;
		}

		insert(entry: AtlasEntry) {
			if (this.tryInsert(entry)) return;
			this.tree.failed.push(entry);
			this.all[entry.baseTexture.uid] = entry;
		}

		remove(entry: AtlasEntry) {
			if (entry.currentNode == null) {
				let failed = this.tree.failed;
				let ind = failed.indexOf(entry);
				if (ind >= 0) {
					failed.splice(ind, 1);
				}
			} else {
				throw new Error("Cant remove packed texture");
			}
		}

		tryInsert(entry: AtlasEntry): boolean {
			let node = this.tree.root.insert(this.width, this.height,
				entry.width, entry.height, entry);
			if (!node) {
				return false;
			}
			entry.nodeUpdateID = ++this.baseTexture._updateID;
			entry.currentNode = node;
			entry.currentAtlas = this;
			this.all[entry.baseTexture.uid] = entry;
			this.tree.hash[entry.baseTexture.uid] = node;
			this.tree.good.push(entry);
			return true;
		}

		private createAtlasRoot() {
			let res = new AtlasNode<AtlasEntry>();
			if (!this.options.algoTreeResize) {
				res.rect.width = this.width;
				res.rect.height = this.height;
			}
			return res;
		}

		repack(failOnFirst: boolean = false): IRepackResult {
			let pack = new AtlasTree();

			let all = this.tree.good.slice(0);
			let failed = this.tree.failed;
			for (let i = 0; i < failed.length; i++) {
				all.push(failed[i]);
			}

			all.sort((a: AtlasEntry, b: AtlasEntry) => {
				if (b.width == a.width) {
					return b.height - a.height;
				}
				return b.width - a.width;
			});

			let root = this.createAtlasRoot();
			pack.root = root;
			for (let obj of all) {
				let node = root.insert(
					this.width, this.height,
					obj.width, obj.height, obj);
				if (!node) {
					pack.failed.push(obj);
					if (failOnFirst) {
						return pack;
					}
				} else {
					pack.hash[obj.baseTexture.uid] = node;
				}
			}

			pack.apply = () => {
				//TODO: full copy?
				this.tree.root = pack.root;
				this.tree.failed = pack.failed.slice(0);
				this.tree.hash = pack.hash;

				for (let obj of all) {
					obj.currentNode = pack.hash[obj.baseTexture.uid] || null;
					obj.currentAtlas = obj.currentNode ? this : null;
					for (let region of obj.regions) {
						region.updateFrame();
					}
				}

				this.imageTextureRebuildUpdateID++;
			};
			return pack;
		}

		prepare(renderer: PIXI.WebGLRenderer): Promise<void> {
			//TODO: wait while everything loads

			renderer.textureManager.updateTexture(this.baseTexture);
			throw new Error("Method not implemented.");
		}

		imageTextureRebuildUpdateID: number = 0;

		onTextureUpload(renderer: PIXI.WebGLRenderer, baseTexture: PIXI.BaseTexture, tex: PIXI.glCore.GLTexture): boolean {
			tex.bind();
			const imgTexture = this.baseTexture;
			const gl = tex.gl;
			const levels = this.options.mipLevels;

			tex.mipmap = levels > 0;
			tex.premultiplyAlpha = imgTexture.premultipliedAlpha;
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, imgTexture.premultipliedAlpha);

			const uploadAll = tex._updateID < this.imageTextureRebuildUpdateID;
			if (uploadAll) {
				gl.texImage2D(
					gl.TEXTURE_2D, //GLenum target
					0, //GLint level
					gl.RGBA, //GLint internalformat
					imgTexture.width, //GLsizei width
					imgTexture.height, //GLsizei height
					0, //GLint border // should be 0, it is borderColor
					gl.RGBA, //GLenum format
					gl.UNSIGNED_BYTE,//GLenum type
					null //ArrayBufferView? pixels
				);

				if (tex.mipmap) {
					//testing
					for (let lvl = 1; (imgTexture.width >> lvl) > 0; lvl++) {
						gl.texImage2D(
							gl.TEXTURE_2D, //GLenum target
							lvl, //GLint level
							gl.RGBA, //GLint internalformat
							imgTexture.width >> lvl, //GLsizei width
							imgTexture.height >> lvl, //GLsizei height
							0, //GLint border // should be 0, it is borderColor
							gl.RGBA, //GLenum format
							gl.UNSIGNED_BYTE,//GLenum type
							null //ArrayBufferView? pixels
						);
					}
				}
			}

			for (let key in this.tree.hash) {
				let node = this.tree.hash[key];
				let entry = node.data;
				let entryTex = entry.baseTexture;
				// if (!obj.isLoaded) continue;
				if (!uploadAll && tex._updateID >= entry.nodeUpdateID) continue;

				let rect: Rectangle = node.rect;
				gl.texSubImage2D(
					gl.TEXTURE_2D, //GLenum target
					0, //GLint level
					rect.left, // GLint xoffset
					rect.top, // GLint yoffset
					gl.RGBA, //GLenum format
					gl.UNSIGNED_BYTE,//GLenum type
					entry.baseTexture.source // TexImageSource source
				);

				if (levels > 0) {
					if (!entryTex._mips || entryTex._mips.length < levels) {
						entryTex.generateMips(levels);
					}
					const mips = entryTex._mips;
					for (let lvl = 1; lvl <= levels; lvl++) {
						const mip = mips[lvl - 1];
						gl.texSubImage2D(
							gl.TEXTURE_2D, //GLenum target
							lvl, //GLint level
							rect.left >> lvl, // GLint xoffset
							rect.top >> lvl, // GLint yoffset
							mip.width,
							mip.height,
							gl.RGBA, //GLenum format
							gl.UNSIGNED_BYTE,//GLenum type
							mip.data
						);
					}
				}
			}
			return true;
		}
	}
}