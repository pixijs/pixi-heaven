namespace pixi_heaven {
	export enum CLAMP_OPTIONS {
		NEVER = 0,
		AUTO = 1,
		ALWAYS = 2
	}

	export let settings = {
		MESH_PLUGIN: 'meshHeaven',
		SPINE_MESH_PLUGIN: 'batchHeaven',
		TEXTURE_MANAGER: true,
		MESH_CLAMP: CLAMP_OPTIONS.AUTO,
	}
}
