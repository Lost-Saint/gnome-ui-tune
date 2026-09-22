import { Mod } from './mod.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { InjectionManager } from 'resource:///org/gnome/shell/extensions/extension.js';
import { SecondaryMonitorDisplay } from 'resource:///org/gnome/shell/ui/workspacesView.js';
import type { ThumbnailsBox } from 'resource:///org/gnome/shell/ui/workspaceThumbnail.js';

/** Scales workspace thumbnails on primary and secondary monitors. */
export default class ScaleThumbnailsMod extends Mod {
    private readonly scaleFactor: number;
    private backupMaxThumbnailScale?: number;
    private injectionManager?: InjectionManager;

    /** @param scaleFactor GSettings enum value (5 = 100% … 25 = 500%); defaults to 10 (200%). */
    constructor(scaleFactor?: number | boolean) {
        super();
        const value = typeof scaleFactor === 'number' ? scaleFactor : 10;
        this.scaleFactor = value / 100;
    }

    /** Override thumbnail scale values in GNOME Shell. */
    override enable(): void {
        const thumbnailsBox: ThumbnailsBox =
            Main.overview._overview._controls._thumbnailsBox;

        // Thumbnails on main monitor
        if (this.scaleFactor === thumbnailsBox._maxThumbnailScale) {
            return;
        }

        this.backupMaxThumbnailScale = thumbnailsBox._maxThumbnailScale;
        thumbnailsBox._maxThumbnailScale = this.scaleFactor;

        const scaleFactor = this.scaleFactor;
        const injectionManager = new InjectionManager();
        this.injectionManager = injectionManager;
        injectionManager.overrideMethod(
            SecondaryMonitorDisplay.prototype,
            '_getThumbnailsHeight',
            () => {
                return function (this: SecondaryMonitorDisplay, box) {
                    if (!this._thumbnails.visible) return 0;

                    this._thumbnails._maxThumbnailScale = scaleFactor;

                    const [width, height] = box.get_size();
                    const { expandFraction } = this._thumbnails;
                    const [thumbnailsHeight] =
                        this._thumbnails.get_preferred_height(width);
                    return Math.min(
                        thumbnailsHeight * expandFraction,
                        height * this._thumbnails.maxThumbnailScale,
                    );
                };
            },
        );
    }

    /** Restore the previous thumbnail scale and remove overrides. */
    override disable(): void {
        if (this.backupMaxThumbnailScale !== undefined) {
            const thumbnailsBox: ThumbnailsBox =
                Main.overview._overview._controls._thumbnailsBox;
            thumbnailsBox._maxThumbnailScale = this.backupMaxThumbnailScale;
            this.backupMaxThumbnailScale = undefined;
        }

        this.injectionManager?.clear();
        this.injectionManager = undefined;
    }
}
