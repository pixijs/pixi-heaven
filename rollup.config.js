import { main } from '@pixi-build-tools/rollup-configurator/main';

const config = main({
    external: ['@pixi/text-bitmap'],
    globals: {
        '@pixi/text-bitmap': 'PIXI',
    },
});

export default config;
