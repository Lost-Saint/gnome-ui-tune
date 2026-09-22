import { BackgroundManager } from 'resource:///org/gnome/shell/ui/background.js';
import { InjectionManager } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {
    WorkspaceThumbnail,
    type ThumbnailsBox,
} from 'resource:///org/gnome/shell/ui/workspaceThumbnail.js';
import { Mod } from './mod.js';

type RestoreState =
    | {readonly kind: 'disabled'}
    | {
        readonly kind: 'enabled';
        readonly injectionManager: InjectionManager;
        readonly thumbnails: Set<WorkspaceThumbnail>;
    };

function cleanupThumbnailBackground(thumbnail: WorkspaceThumbnail): void {
    const bgManager = thumbnail._bgManager;
    if (!bgManager) {
        return;
    }
    thumbnail._bgManager = null;

    if (thumbnail._bgManagerLoadedId) {
        bgManager.disconnect(thumbnail._bgManagerLoadedId);
        thumbnail._bgManagerLoadedId = 0;
    }

    if (thumbnail._bgManagerChangedId) {
        bgManager.disconnect(thumbnail._bgManagerChangedId);
        thumbnail._bgManagerChangedId = 0;
    }

    bgManager.destroy();
}

export default class RestoreThumbnailsBackgroundMod extends Mod {
    private state: RestoreState = {kind: 'disabled'};

    override enable(): void {
        const thumbnails = new Set<WorkspaceThumbnail>();
        const injectionManager = new InjectionManager();

        // Thumbnails on main monitor
        injectionManager.overrideMethod(
            WorkspaceThumbnail.prototype,
            '_init',
            originalMethod => {
                return function (
                    this: WorkspaceThumbnail,
                    metaWorkspace,
                    monitorIndex,
                ): void {
                    originalMethod.call(this, metaWorkspace, monitorIndex);
                    thumbnails.add(this);
                    const bgManager = new BackgroundManager({
                        monitorIndex,
                        container: this._contents,
                        vignette: false,
                    });
                    this._bgManager = bgManager;

                    // Shell 50: when the wallpaper image finishes loading after the
                    // thumbnail is built (cold cache on cold boot, or after resume
                    // invalidates the cache), the Meta.BackgroundActor's preferred
                    // size update no longer always propagates to its parent's
                    // allocation, leaving the thumbnail blank until something else
                    // (e.g. switching workspaces) forces a relayout. Force one
                    // ourselves on every load and on every actor swap.
                    const requeue = (): undefined => {
                        this._bgManager?.backgroundActor?.queue_relayout();
                    };
                    this._bgManagerLoadedId = bgManager.connect(
                        'loaded',
                        requeue,
                    );
                    this._bgManagerChangedId = bgManager.connect(
                        'changed',
                        requeue,
                    );
                };
            },
        );

        injectionManager.overrideMethod(
            WorkspaceThumbnail.prototype,
            '_onDestroy',
            originalMethod => {
                return function (this: WorkspaceThumbnail): void {
                    cleanupThumbnailBackground(this);
                    thumbnails.delete(this);
                    originalMethod.call(this);
                };
            },
        );

        this.state = {kind: 'enabled', injectionManager, thumbnails};
    }

    override disable(): void {
        const state = this.state;
        if (state.kind === 'disabled') return;
        this.state = {kind: 'disabled'};

        this.cleanupCurrentThumbnails(state.thumbnails);
        state.injectionManager.clear();
    }

    private cleanupCurrentThumbnails(
        thumbnails: Set<WorkspaceThumbnail>,
    ): void {
        for (const thumbnail of thumbnails) {
            cleanupThumbnailBackground(thumbnail);
        }

        const controls = Main.overview?._overview?.controls;
        this.cleanupThumbnailsBox(controls?._thumbnailsBox, thumbnails);

        for (const view of controls?._workspacesDisplay?._workspacesViews ??
            []) {
            this.cleanupThumbnailsBox(view?._thumbnails, thumbnails);
        }
    }

    private cleanupThumbnailsBox(
        thumbnailsBox: ThumbnailsBox | null | undefined,
        trackedThumbnails: Set<WorkspaceThumbnail>,
    ): void {
        for (const thumbnail of thumbnailsBox?._thumbnails ?? []) {
            cleanupThumbnailBackground(thumbnail);
            trackedThumbnails.delete(thumbnail);
        }
    }
}
