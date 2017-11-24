namespace pixi_heaven {
	import Rectangle = PIXI.Rectangle;

	const INF = 1 << 20;
	
	//TODO: add some padding

	export class AtlasNode<T> {
		public childs: Array<AtlasNode<T>> = [];
		public rect = new Rectangle(0, 0, INF, INF);
		public data: T = null;

		public insert(atlasWidth: number, atlasHeight: number,
		              width: number, height: number, data: T): AtlasNode<T> {
			if (this.childs.length > 0) {
				const newNode: AtlasNode<T> = this.childs[0].insert(
					atlasWidth, atlasHeight,
					width, height, data);
				if (newNode != null) {
					return newNode;
				}
				return this.childs[1].insert(atlasWidth, atlasHeight, width, height, data);
			} else {
				let rect: Rectangle = this.rect;
				if (this.data != null) return null;

				const w = Math.min(rect.width, atlasWidth - rect.x);

				if (width > rect.width ||
					width > atlasWidth - rect.x ||
					height > rect.height ||
					height > atlasHeight - rect.y) return null;

				if (width == rect.width && height == rect.height) {
					this.data = data;
					return this;
				}

				this.childs.push(new AtlasNode<T>());
				this.childs.push(new AtlasNode<T>());

				const dw: Number = rect.width - width;
				const dh: Number = rect.height - height;

				if (dw > dh) {
					this.childs[0].rect = new Rectangle(rect.x, rect.y, width, rect.height);
					this.childs[1].rect = new Rectangle(rect.x + width, rect.y, rect.width - width, rect.height);
				} else {
					this.childs[0].rect = new Rectangle(rect.x, rect.y, rect.width, height);
					this.childs[1].rect = new Rectangle(rect.x, rect.y + height, rect.width, rect.height - height);
				}

				return this.childs[0].insert(atlasWidth, atlasHeight, width, height, data);
			}
		}
	}
}
