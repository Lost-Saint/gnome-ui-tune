import type { Mod } from './mod.js';
import type {
    BooleanModName,
    EnumModSetting,
} from './modsListNames.js';
import ScaleThumbnailsMod from './modScaleThumbnails.js';
import HideSearchInputMod from './modHideSearchInput.js';
import RestoreThumbnailsBackgroundMod from './modRestoreThumbnailsBackground.js';
import AlwaysShowThumbnailsMod from './modAlwaysShowThumbnails.js';
import FirefoxPipInOverviewMod from './modFirefoxPipInOverview.js';

type BooleanModConstructor = new () => Mod;
type EnumModRegistry = {
    [Setting in EnumModSetting as Setting['name']]: new (
        settingValue: ReturnType<Setting['parse']>,
    ) => Mod;
};

export type ModRegistry =
    Record<BooleanModName, BooleanModConstructor> & EnumModRegistry;

// Preferences import only modsListNames.ts so opening the preferences process
// does not load Shell-only mod modules.
export function get(): ModRegistry {
    return {
        'increase-thumbnails-size': ScaleThumbnailsMod,
        'hide-search': HideSearchInputMod,
        'restore-thumbnails-background': RestoreThumbnailsBackgroundMod,
        'always-show-thumbnails': AlwaysShowThumbnailsMod,
        'overview-firefox-pip': FirefoxPipInOverviewMod,
    } satisfies ModRegistry;
}
