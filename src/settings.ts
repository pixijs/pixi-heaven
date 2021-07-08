export enum CLAMP_OPTIONS {
    NEVER = 0,
    AUTO = 1,
    ALWAYS = 2
}

export interface ISettings {
    MESH_CLAMP: CLAMP_OPTIONS;
    BLEND_ADD_UNITY: boolean;
}

export const settings: ISettings = {
    MESH_CLAMP: CLAMP_OPTIONS.AUTO,
    BLEND_ADD_UNITY: false,
}
