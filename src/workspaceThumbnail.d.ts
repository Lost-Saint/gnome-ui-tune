/**
 * Minimal typings for `workspaceThumbnail.js`, which `@girs/gnome-shell`
 * does not cover at all.
 *
 * Mirrors `js/ui/workspaceThumbnail.js` for Shell 48-50 and covers only
 * what the mods touch. Extend narrowly, and drop this file once `@girs`
 * provides the module.
 *
 * NOTE: this file is intentionally a script (no top-level imports), so the
 * `declare module` block below registers a new ambient module. See
 * `shellInternals.d.ts` for augmentations of existing modules.
 */
type ClutterActor = import('gi://Clutter').default.Actor;
type MetaWorkspace = import('gi://Meta').default.Workspace;
type ShellBackgroundManager = import(
    'resource:///org/gnome/shell/ui/background.js'
).BackgroundManager;

declare module 'resource:///org/gnome/shell/ui/workspaceThumbnail.js' {
    interface WorkspaceThumbnail {
        _contents: ClutterActor;
        /** Attached by modRestoreThumbnailsBackground; absent when the mod is off. */
        _bgManager?: ShellBackgroundManager | null;
        _bgManagerLoadedId?: number;
        _bgManagerChangedId?: number;
        _init(metaWorkspace: MetaWorkspace, monitorIndex: number): void;
        _onDestroy(): void;
    }
    interface WorkspaceThumbnailConstructor {
        readonly prototype: WorkspaceThumbnail;
        new (...args: never[]): WorkspaceThumbnail;
    }
    const WorkspaceThumbnail: WorkspaceThumbnailConstructor;

    interface ThumbnailsBox {
        _maxThumbnailScale: number;
        _shouldShow: boolean;
        _thumbnails: WorkspaceThumbnail[];
        _updateShouldShow(): void;
        /** GObject notify; untyped in `@girs`, present at runtime. */
        notify(property: string): void;
    }
    interface ThumbnailsBoxConstructor {
        readonly prototype: ThumbnailsBox;
        new (...args: never[]): ThumbnailsBox;
    }
    const ThumbnailsBox: ThumbnailsBoxConstructor;

    export { WorkspaceThumbnail, ThumbnailsBox };
}
