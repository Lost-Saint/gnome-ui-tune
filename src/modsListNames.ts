type ModSettingShape =
    | {
        readonly kind: 'enum';
        readonly name: string;
        readonly parse: (value: number) => number;
    }
    | {
        readonly kind: 'boolean';
        readonly name: string;
    };

export type ThumbnailScaleSetting = 5 | 10 | 15 | 20 | 25;

function parseThumbnailScaleSetting(value: number): ThumbnailScaleSetting {
    switch (value) {
        case 5:
        case 10:
        case 15:
        case 20:
        case 25:
            return value;
        default:
            return 10;
    }
}

function defineModSettings<
    const Settings extends readonly ModSettingShape[],
>(settings: Settings): Settings {
    return settings;
}

const MOD_SETTINGS = defineModSettings([
    {
        kind: 'enum',
        name: 'increase-thumbnails-size',
        parse: parseThumbnailScaleSetting,
    },
    {kind: 'boolean', name: 'hide-search'},
    {kind: 'boolean', name: 'restore-thumbnails-background'},
    {kind: 'boolean', name: 'always-show-thumbnails'},
    {kind: 'boolean', name: 'overview-firefox-pip'},
]);

export type ModSetting = (typeof MOD_SETTINGS)[number];
export type ModName = ModSetting['name'];
export type BooleanModName = Extract<
    ModSetting,
    {kind: 'boolean'}
>['name'];
export type EnumModSetting = Extract<ModSetting, {kind: 'enum'}>;

export function getSettings(): readonly ModSetting[] {
    return MOD_SETTINGS;
}
