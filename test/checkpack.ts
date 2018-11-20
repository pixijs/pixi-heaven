import 'pixi.js';
import 'pixi-spine';
import '../dist/pixi-heaven.js';

//@../node_modules/pixi.js/dist/pixi.min.js
//@../dist/pixi-heaven.js

let app = new PIXI.Application(800, 600, {backgroundColor: 0x103322});
document.body.appendChild(app.view);

let loader = new PIXI.loaders.Loader("https://pixijs.github.io/examples/required/assets/");

loader.add('background', 'bkg.jpg');
loader.add('dude', 'flowerTop.png');

loader.load(() => {
	let dude = new PIXI.Sprite(loader.resources['dude'].texture).convertToHeaven();
	//set the tint
	dude.color.setLight(0.8, 1.0, 1.0);
	//invert colors!
	dude.color.dark[0] = 1.0 - dude.color.light[0];
	dude.color.dark[1] = 1.0 - dude.color.light[1];
	dude.color.dark[2] = 1.0 - dude.color.light[2];
	//we've changed dark directly, lets invalidate the color
	dude.color.invalidate();
	dude.position.set(app.screen.width / 2, app.screen.height / 2);
	dude.anchor.set(0.5);

	app.stage.addChild(dude);
});
