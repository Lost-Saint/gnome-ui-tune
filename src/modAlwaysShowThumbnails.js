import {Mod} from './mod.js'
import {InjectionManager} from 'resource:///org/gnome/shell/extensions/extension.js'

import {ThumbnailsBox} from 'resource:///org/gnome/shell/ui/workspaceThumbnail.js'

/**
 * @module src/modAlwaysShowThumbnails
 */

/**
 * Forces the workspace thumbnails strip to remain visible.
 *
 * @extends Mod
 */
export default class AlwaysShowThumbnailsMod extends Mod {
    /**
     * Override GNOME Shell's thumbnail visibility check.
     *
     * @override
     * @returns {void}
     */
    enable() {
        this.injectionManager = new InjectionManager()
        this.injectionManager.overrideMethod(ThumbnailsBox.prototype, '_updateShouldShow', () => {
            return function() {
                if (!this._shouldShow) {
                    this._shouldShow = true;
                    this.notify('should-show');
                }
            }
        })
    }

    /**
     * Remove method overrides installed by {@link AlwaysShowThumbnailsMod#enable}.
     *
     * @override
     * @returns {void}
     */
    disable() {
        this.injectionManager?.clear()
        this.injectionManager = null
    }
}
