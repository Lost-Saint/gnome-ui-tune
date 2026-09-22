import type Meta from 'gi://Meta';
import { InjectionManager } from 'resource:///org/gnome/shell/extensions/extension.js';
import { Workspace } from 'resource:///org/gnome/shell/ui/workspace.js';
import { Mod } from './mod.js';
import { titles } from './modFirefoxPipInOverview_titles.js';

export default class FirefoxPipInOverviewMod extends Mod {
    private injectionManager: InjectionManager | null = null;

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

    override disable(): void {
        this.injectionManager?.clear();
        this.injectionManager = null;
    }
}
