import type { Mod } from './mod.js';
import ScaleThumbnailsMod from './modScaleThumbnails.js';
import HideSearchInputMod from './modHideSearchInput.js';
import RestoreThumbnailsBackgroundMod from './modRestoreThumbnailsBackground.js';
import AlwaysShowThumbnailsMod from './modAlwaysShowThumbnails.js';
import FirefoxPipInOverviewMod from './modFirefoxPipInOverview.js';

/**
 * Constructor for a mod implementation.
 *
 * The extension always passes its setting value: the enum number for
 * `increase-thumbnails-size`, `false` for boolean keys. Boolean mods ignore
 * the argument.
 */
export type ModConstructor = new (settings?: number | boolean) => Mod;

/** Mods keyed by their matching GSettings names. */
export type ModRegistry = Record<string, ModConstructor>;

// This func can not be used from prefs.js due to mods being actually loaded when they're imported
/** Return the mod constructors keyed by their GSettings names. */
export function get(): ModRegistry {
    return {
        'increase-thumbnails-size': ScaleThumbnailsMod,
        'hide-search': HideSearchInputMod,
        'restore-thumbnails-background': RestoreThumbnailsBackgroundMod,
        'always-show-thumbnails': AlwaysShowThumbnailsMod,
        'overview-firefox-pip': FirefoxPipInOverviewMod,
    } satisfies ModRegistry;
}
