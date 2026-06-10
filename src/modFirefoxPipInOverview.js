import {Mod} from './mod.js'
import {titles} from './modFirefoxPipInOverview_titles.js'
import {InjectionManager} from 'resource:///org/gnome/shell/extensions/extension.js'

import {Workspace} from  'resource:///org/gnome/shell/ui/workspace.js'

/**
 * @module src/modFirefoxPipInOverview
 */

/**
 * Treats Firefox picture-in-picture windows as overview-visible windows.
 *
 * @extends Mod
 */
export default class FirefoxPipInOverviewMod extends Mod {
    /**
     * Override GNOME Shell's overview window filter for Firefox PIP windows.
     *
     * @override
     * @returns {void}
     */
    enable() {
        this.injectionManager = new InjectionManager()
        this.injectionManager.overrideMethod(Workspace.prototype, '_isOverviewWindow', originalMethod => {
            return function(win) {
                const wmClass = win.get_wm_class?.()?.toLowerCase()
                if (win.title && titles[win.title] && wmClass?.includes("firefox")) {
                    return true;
                }
                return originalMethod.call(this, win);
            }
        })
    }

    /**
     * Remove method overrides installed by {@link FirefoxPipInOverviewMod#enable}.
     *
     * @override
     * @returns {void}
     */
    disable() {
        this.injectionManager?.clear()
        this.injectionManager = null
    }
}
