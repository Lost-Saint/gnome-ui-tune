import * as modScaleThumbnails from './modScaleThumbnails.js'
import * as modHideSearchInput from './modHideSearchInput.js'
import * as modRestoreThumbnailsBackground from './modRestoreThumbnailsBackground.js'
import * as modAlwaysShowThumbnails from './modAlwaysShowThumbnails.js'
import * as modFirefoxPipInOverview from './modFirefoxPipInOverview.js'

/**
 * @module src/modsList
 */

/**
 * Constructor for a mod implementation.
 *
 * Some mods accept a setting-derived constructor argument, such as a thumbnail
 * scale percentage. Most mods ignore it.
 *
 * @typedef {Function} ModConstructor
 * @param {(number|boolean|string)} [settings] Setting value passed by the extension.
 * @returns {module:src/mod.Mod}
 */

/**
 * Mods keyed by their matching GSettings names.
 *
 * @typedef {Object<string, ModConstructor>} ModRegistry
 */

// This func can not be used from prefs.js due to mods being actually loaded when they're imported
/**
 * Return the mod constructors keyed by their GSettings names.
 *
 * @returns {ModRegistry} Available mod constructors.
 */
export function get() {
    return {
        'increase-thumbnails-size': modScaleThumbnails.default,
        'hide-search': modHideSearchInput.default,
        'restore-thumbnails-background': modRestoreThumbnailsBackground.default,
        'always-show-thumbnails': modAlwaysShowThumbnails.default,
        'overview-firefox-pip': modFirefoxPipInOverview.default,
    }
}
