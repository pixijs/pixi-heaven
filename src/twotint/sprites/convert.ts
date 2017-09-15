declare module PIXI {
    interface Sprite {
	    convertToColored(): void;
    }

    interface Mesh {
        convertToColored(): void;
    }

    interface Graphics {
        convertToColored(): void;
    }

    interface Container {
	    convertToColored(): void;
        convertSubtreeToColored(): void;
    }

    // TODO: ParticleContainer?
}

namespace pixi_color_transform {
    (PIXI as any).Container.prototype.convertTo2d = function () {
    };

    (PIXI as any).Container.prototype.convertSubtreeTo2d = function () {
        this.convertTo2d();
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].convertSubtreeTo2d();
        }
    };
}
