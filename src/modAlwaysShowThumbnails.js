import {Mod} from './mod.js'
import {InjectionManager} from 'resource:///org/gnome/shell/extensions/extension.js'

import {ThumbnailsBox} from 'resource:///org/gnome/shell/ui/workspaceThumbnail.js'

export default class extends Mod {
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

    disable() {
        this.injectionManager?.clear()
        this.injectionManager = null
    }
}
