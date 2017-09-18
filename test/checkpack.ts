import 'pixi.js';
import '../dist/pixi-heaven.js';

//@../node_modules/pixi.js/dist/pixi.min.js
//@../dist/pixi-heaven.js

let app = new PIXI.Application(800, 600, {backgroundColor: 0x103322});
document.body.appendChild(app.view);

let loader = new PIXI.loaders.Loader("https://pixijs.github.io/examples/required/assets/");

loader.add('background', 'bkg.jpg');
loader.add('bunny', 'flowerTop.png');

loader.load(() => {

});
