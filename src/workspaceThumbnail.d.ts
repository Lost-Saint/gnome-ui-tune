// @girs does not declare workspaceThumbnail.js. These are the parts used by
// this extension in Shell 48-50. This file has no top-level imports so it
// registers a new ambient module instead of augmenting a missing module.
type ClutterActor = import('gi://Clutter').default.Actor;
type MetaWorkspace = import('gi://Meta').default.Workspace;
type ShellBackgroundManager = import(
    'resource:///org/gnome/shell/ui/background.js'
).BackgroundManager;

declare module 'resource:///org/gnome/shell/ui/workspaceThumbnail.js' {
    interface WorkspaceThumbnail {
        _contents: ClutterActor;
        // Attached by modRestoreThumbnailsBackground while the mod is enabled.
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
        // GObject method omitted by the upstream module typings.
        notify(property: string): void;
    }
    interface ThumbnailsBoxConstructor {
        readonly prototype: ThumbnailsBox;
        new (...args: never[]): ThumbnailsBox;
    }
    const ThumbnailsBox: ThumbnailsBoxConstructor;

    export { WorkspaceThumbnail, ThumbnailsBox };
}
