/**
 * Augmentations for `@girs` modules this extension needs more from.
 *
 * NOTE: this file is intentionally a module (top-level imports), so the
 * `declare module` blocks below *augment* the existing modules. Declaring
 * them from a script file would shadow the original exports instead.
 */
import type Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';

declare module 'resource:///org/gnome/shell/ui/workspacesView.js' {
    interface SecondaryMonitorThumbnails {
        visible: boolean;
        _maxThumbnailScale: number;
        maxThumbnailScale: number;
        expandFraction: number;
        get_preferred_height(forWidth: number): [number, number];
    }
    interface SecondaryMonitorDisplay {
        _thumbnails: SecondaryMonitorThumbnails;
        _getThumbnailsHeight(box: Clutter.Actor): number;
    }
    interface SecondaryMonitorDisplayConstructor {
        readonly prototype: SecondaryMonitorDisplay;
        new (...args: never[]): SecondaryMonitorDisplay;
    }
    const SecondaryMonitorDisplay: SecondaryMonitorDisplayConstructor;

    export { SecondaryMonitorDisplay };
}

declare module '@girs/gnome-shell/ui/workspace' {
    export interface Workspace {
        _isOverviewWindow(win: Meta.Window): boolean;
    }
}
