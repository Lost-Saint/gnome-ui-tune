// This file has top-level imports so its declarations augment @girs modules.
// Without an import, the declarations would replace the original exports.
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
