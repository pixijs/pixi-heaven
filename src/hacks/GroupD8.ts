declare module PIXI {
    namespace GroupD8 {
        export function isVertical(rotation: number): boolean;
    }
}

if (!PIXI.GroupD8.isVertical) {
    PIXI.GroupD8.isVertical = function(rotation: number) {
        return (rotation & 3) === 2;
    }
}
