
/**
 * @module src/modsListNames
 */

/**
 * Return the ordered list of mod GSettings keys shown in preferences.
 *
 * @returns {string[]} Mod setting names.
 */
export function getNames() {
    return [
        'increase-thumbnails-size',
        'hide-search',
        'restore-thumbnails-background',
        'always-show-thumbnails',
        'overview-firefox-pip',
    ];
}
