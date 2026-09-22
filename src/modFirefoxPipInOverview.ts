import { Mod } from './mod.js';
import { titles } from './modFirefoxPipInOverview_titles.js';
import { InjectionManager } from 'resource:///org/gnome/shell/extensions/extension.js';
import { Workspace } from 'resource:///org/gnome/shell/ui/workspace.js';
import type Meta from 'gi://Meta';

/** Treats Firefox picture-in-picture windows as overview-visible windows. */
export default class FirefoxPipInOverviewMod extends Mod {
    private injectionManager?: InjectionManager;

    /** Override GNOME Shell's overview window filter for Firefox PIP windows. */
    override enable(): void {
        const injectionManager = new InjectionManager();
        this.injectionManager = injectionManager;
        injectionManager.overrideMethod(
            Workspace.prototype,
            '_isOverviewWindow',
            originalMethod => {
                return function (this: Workspace, win: Meta.Window): boolean {
                    const wmClass = win.get_wm_class()?.toLowerCase();
                    if (
                        win.title &&
                        titles[win.title] &&
                        wmClass?.includes('firefox')
                    ) {
                        return true;
                    }
                    return originalMethod.call(this, win);
                };
            },
        );
    }

    /** Remove method overrides installed by {@link FirefoxPipInOverviewMod.enable}. */
    override disable(): void {
        this.injectionManager?.clear();
        this.injectionManager = undefined;
    }
}
