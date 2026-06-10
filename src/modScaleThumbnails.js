import {Mod} from './mod.js'
import * as main from 'resource:///org/gnome/shell/ui/main.js'
import {InjectionManager} from 'resource:///org/gnome/shell/extensions/extension.js'

import {SecondaryMonitorDisplay} from 'resource:///org/gnome/shell/ui/workspacesView.js'

/**
 * @module src/modScaleThumbnails
 */

/**
 * Scales workspace thumbnails on primary and secondary monitors.
 *
 * @extends Mod
 */
export default class ScaleThumbnailsMod extends Mod {
    /**
     * Create the mod.
     *
     * @param {number} scaleFactor Scale percentage from settings.
     */
    constructor(scaleFactor) {
        super()
        this.scaleFactor = scaleFactor / 100
    }

    /**
     * Override thumbnail scale values in GNOME Shell.
     *
     * @override
     * @returns {void}
     */
    enable() {
        let _thumbnailsBox = main.overview._overview._controls._thumbnailsBox;

        // Thumbnails on main monitor
        if (this.scaleFactor === _thumbnailsBox._maxThumbnailScale) {
            return
        }

        this.bkp_MAX_THUMBNAIL_SCALE = _thumbnailsBox._maxThumbnailScale
        _thumbnailsBox._maxThumbnailScale = this.scaleFactor

        const __scaleFactor = this.scaleFactor
        this.injectionManager = new InjectionManager()
        this.injectionManager.overrideMethod(SecondaryMonitorDisplay.prototype, '_getThumbnailsHeight', () => {
            return function(box) {
                if (!this || !this._thumbnails.visible)
                    return 0;

                this._thumbnails._maxThumbnailScale = __scaleFactor

                const [width, height] = box.get_size();
                const {expandFraction} = this._thumbnails;
                const [thumbnailsHeight] = this._thumbnails.get_preferred_height(width);
                return Math.min(
                    thumbnailsHeight * expandFraction,
                    height * this._thumbnails.maxThumbnailScale);
            }
        })
    }

    /**
     * Restore the previous thumbnail scale and remove overrides.
     *
     * @override
     * @returns {void}
     */
    disable() {
        if (this.bkp_MAX_THUMBNAIL_SCALE) {
            let _thumbnailsBox = main.overview._overview._controls._thumbnailsBox;
            _thumbnailsBox._maxThumbnailScale = this.bkp_MAX_THUMBNAIL_SCALE
        }

        this.injectionManager?.clear()
        this.injectionManager = null
    }
}
