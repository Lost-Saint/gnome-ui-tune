import { Mod } from './mod.js';
import { InjectionManager } from 'resource:///org/gnome/shell/extensions/extension.js';
import { ThumbnailsBox } from 'resource:///org/gnome/shell/ui/workspaceThumbnail.js';

/** Forces the workspace thumbnails strip to remain visible. */
export default class AlwaysShowThumbnailsMod extends Mod {
    private injectionManager?: InjectionManager;

    /** Override GNOME Shell's thumbnail visibility check. */
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

    /** Remove method overrides installed by {@link AlwaysShowThumbnailsMod.enable}. */
    override disable(): void {
        this.injectionManager?.clear();
        this.injectionManager = undefined;
    }
}
