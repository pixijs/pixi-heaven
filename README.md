# pixi-heaven

This is heaven for sprites. Want to color them better? Wanna use advanced colors? Its all here!

**REQUIRES** [pixi-spine](https://github.com/pixijs/pixi-spine). That means you have to include spine before heaven.

Done:

* Advanced color modes

TO-DO:

* Polygon packing

### Be careful!

It can affect performance. 
Though what is performance, when you game looks like s@#$? 
Spawn fewer objects but make it prettier!

### How to use

Just add ".js" file in your build and start using

```js
var sprite = new PIXI.heaven.Sprite();
// good old sprite tint
sprite.color.setLight(0.5, 1.0, 0.5);

// dark tint - new feature
sprite.color.setDark(0.2, 0.2, 0.2);

// change single component, useful for tweening
sprite.color.darkG = 0.1;
```

Or convert PIXI sprite

```js
var sprite = new PIXI.Sprite(someTexture);

// pixi vanilla way, optional
sprite.tint = 0x80ff80;

// activate the plugin!
sprite.convertToHeaven();
```

Note that if you are using TS, sprite type will be changed

```ts
let coloredSprite : PIXI.heaven.Sprite = sprite.convertColors();
```

Useful example: invert the colors

```js
sprite.color.setLight(0, 0, 0);
sprite.color.setDark(1, 1, 1);
```

Make whole sprite of one color:

```js
sprite.tint = 0xffaacc;
sprite.color.dark[0] = sprite.color.light[0];
sprite.color.dark[1] = sprite.color.light[1];
sprite.color.dark[2] = sprite.color.light[2];
//dont forget to invalidate, after you changed dark DIRECTLY
sprite.color.invalidate();
```

### Meshes

Heaven meshes can be batched with heaven sprites, 
and that significantly reduces number of Draw Calls but it eats CPU resources and doesn't work 
with advanced modes like `uploadUvTransform`

```js
// Default, PixiJS vanilla mode
PIXI.heaven.settings.MESH_PLUGIN = 'meshHeaven';

// New mode, meshes batched as sprites
PIXI.heaven.settings.SPINE_MESH_PLUGIN = 'spriteHeaven';

// manually set one mesh to be batched with sprites
mesh.plugin = 'spriteHeaven';
```

### How to use with spine

This plugin enables light-dark tint of spine 3.6.

Dark-light tint works like in sprites.

```js
spine = new PIXI.heaven.spine.Spine();
spine.color.setLight(0.5, 1.0, 0.5);
spine.color.setDark(0.2, 0.2, 0.2);
```

### How to mask sprites with sprites

Plugin adds special renderer that has faster masks than just `sprite.mask`. It also works on heaven meshes.

```js
sprite = new PIXI.heaven.Sprite();
sprite.maskSprite = sprite2; //set it
sprite.pluginName = 'spriteMasked'; //enable special plugin rendering
sprite2.renderable = false; //turn off rendering
```

Batching works with spine, just enable maskSprite in any sprite of spine instance.

The best practice for spine meshes is to batch them with sprites. It eats some CPU resources.

```js
// Default mode, meshes are rendered as sprites
PIXI.heaven.settings.SPINE_MESH_PLUGIN = 'spriteHeaven';

// PixiJS vanilla mode
PIXI.heaven.settings.SPINE_MESH_PLUGIN = 'meshHeaven';
```

Look at [Spine file](https://github.com/gameofbombs/pixi-heaven/blob/master/src/z_spine/Spine.ts) to see 
how it actually works. 

### How to use colored meshes

Please make sure everything is initialized, i didnt hook it up in refresh!!!
see errors in console? make sure texture is initialized

Look in [the code](https://github.com/gameofbombs/pixi-heaven/blob/master/src/mesh/00_Mesh.ts#L342) for details.

```js
var strip = new PIXI.heaven.mesh.Rope(PIXI.Texture.fromImage('required/assets/snake.png'), 25, 2, 0);
strip.enableColors();

//lets make it randomy!
var len = strip.vertices.length / 2;
var rgb = new Float32Array(len*3);
//set light
for (var i=0;i<len*3;i++) rgb[i] = 0.5 + Math.random() * 0.5;
strip.setRGB(rgb);
//set dark
for (var i=0;i<len*3;i++) rgb[i] = Math.random() * 0.5;
strip.setRGB(rgb, true);
```

## Building

You will need to have [node][node] setup on your machine.

Make sure you have [yarn][yarn] installed:

    npm install -g yarn

Then you can install dependencies and build:

```bash
yarn
yarn build
```

That will output the built distributables to `./dist`.

[node]:             https://nodejs.org/
[typescript]:       https://www.typescriptlang.org/
[yarn]:             https://yarnpkg.com
