import {Mod} from './mod.js'
import {titles} from './modFirefoxPipInOverview_titles.js'
import {InjectionManager} from 'resource:///org/gnome/shell/extensions/extension.js'

import {Workspace} from  'resource:///org/gnome/shell/ui/workspace.js'

export default class extends Mod {
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

    disable() {
        this.injectionManager?.clear()
        this.injectionManager = null
    }
}
