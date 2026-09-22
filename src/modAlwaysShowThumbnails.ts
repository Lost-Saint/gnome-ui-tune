import { InjectionManager } from 'resource:///org/gnome/shell/extensions/extension.js';
import { ThumbnailsBox } from 'resource:///org/gnome/shell/ui/workspaceThumbnail.js';
import { Mod } from './mod.js';

export default class AlwaysShowThumbnailsMod extends Mod {
    private injectionManager: InjectionManager | null = null;

    override enable(): void {
        const injectionManager = new InjectionManager();
        this.injectionManager = injectionManager;
        injectionManager.overrideMethod(
            ThumbnailsBox.prototype,
            '_updateShouldShow',
            () => {
                return function (this: ThumbnailsBox): void {
                    if (!this._shouldShow) {
                        this._shouldShow = true;
                        this.notify('should-show');
                    }
                };
            },
        );
    }

    override disable(): void {
        this.injectionManager?.clear();
        this.injectionManager = null;
    }
}
