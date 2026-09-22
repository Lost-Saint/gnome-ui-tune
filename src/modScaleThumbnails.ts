import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { InjectionManager } from 'resource:///org/gnome/shell/extensions/extension.js';
import { SecondaryMonitorDisplay } from 'resource:///org/gnome/shell/ui/workspacesView.js';
import type { ThumbnailsBox } from 'resource:///org/gnome/shell/ui/workspaceThumbnail.js';
import { Mod } from './mod.js';
import type { ThumbnailScaleSetting } from './modsListNames.js';

type ScaleState =
    | {readonly kind: 'disabled'}
    | {
        readonly kind: 'enabled';
        readonly injectionManager: InjectionManager;
        readonly previousMaxThumbnailScale: number;
        readonly thumbnailsBox: ThumbnailsBox;
    };

export default class ScaleThumbnailsMod extends Mod {
    private readonly scaleFactor: number;
    private state: ScaleState = {kind: 'disabled'};

    constructor(settingValue: ThumbnailScaleSetting) {
        super();
        this.scaleFactor = settingValue / 100;
    }

    override enable(): void {
        const thumbnailsBox: ThumbnailsBox =
            Main.overview._overview._controls._thumbnailsBox;

        // Thumbnails on main monitor
        if (this.scaleFactor === thumbnailsBox._maxThumbnailScale) {
            return;
        }

        const previousMaxThumbnailScale = thumbnailsBox._maxThumbnailScale;
        thumbnailsBox._maxThumbnailScale = this.scaleFactor;

        const scaleFactor = this.scaleFactor;
        const injectionManager = new InjectionManager();
        injectionManager.overrideMethod(
            SecondaryMonitorDisplay.prototype,
            '_getThumbnailsHeight',
            () => {
                return function (this: SecondaryMonitorDisplay, box) {
                    if (!this._thumbnails.visible) return 0;

                    this._thumbnails._maxThumbnailScale = scaleFactor;

                    const [width, height] = box.get_size();
                    const {expandFraction} = this._thumbnails;
                    const [thumbnailsHeight] =
                        this._thumbnails.get_preferred_height(width);
                    return Math.min(
                        thumbnailsHeight * expandFraction,
                        height * this._thumbnails.maxThumbnailScale,
                    );
                };
            },
        );

        this.state = {
            kind: 'enabled',
            injectionManager,
            previousMaxThumbnailScale,
            thumbnailsBox,
        };
    }

    override disable(): void {
        const state = this.state;
        if (state.kind === 'disabled') return;
        this.state = {kind: 'disabled'};

        state.thumbnailsBox._maxThumbnailScale =
            state.previousMaxThumbnailScale;
        state.injectionManager.clear();
    }
}
