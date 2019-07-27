namespace pixi_heaven {
    if (!(PIXI as any).spine) {
        (PIXI as any).spine = {
            Spine: function () {}
        }
    }
}
