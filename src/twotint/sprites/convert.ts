declare module PIXI {
    interface Sprite {
	    convertToHeaven(): void;
    }

    interface Mesh {
	    convertToHeaven(): void;
    }

    interface Graphics {
	    convertToHeaven(): void;
    }

    interface Container {
	    convertToHeaven(): void;
        convertSubtreeToHeaven(): void;
    }

    // TODO: ParticleContainer?
}

namespace pixi_heaven {
    (PIXI as any).Container.prototype.convertToHeaven = function () {
    };

    (PIXI as any).Container.prototype.convertSubtreeToHeaven = function () {
        this.convertToHeaven();
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].convertSubtreeToHeaven();
        }
    };
}
