import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Mod } from './mod.js';

export default class HideSearchInputMod extends Mod {
    private overviewShowingId = 0;
    private searchActiveId = 0;

    private showSearch(): void {
        Main.overview.searchEntry?.get_parent()?.ease({
            height: Main.overview.searchEntry.height,
            mode: Clutter.AnimationMode.EASE,
            duration: 10,
        });
    }

    private hideSearch(): void {
        Main.overview.searchEntry?.get_parent()?.ease({
            height: 0,
            mode: Clutter.AnimationMode.EASE,
            duration: 100,
        });
    }

    override enable(): void {
        this.overviewShowingId = Main.overview.connect('showing', () => {
            const connectId = this.overviewShowingId;
            this.overviewShowingId = 0;

            if (connectId) {
                Main.overview.disconnect(connectId);
            }

            this.hideSearch();
        });

        this.searchActiveId = Main.overview.searchController.connect(
            'notify::search-active',
            () => {
                if (Main.overview.searchController.searchActive) {
                    this.showSearch();
                } else {
                    this.hideSearch();
                }
            },
        );
    }

    override disable(): void {
        if (this.overviewShowingId) {
            Main.overview.disconnect(this.overviewShowingId);
            this.overviewShowingId = 0;
        }

        if (this.searchActiveId) {
            Main.overview.searchController.disconnect(this.searchActiveId);
            this.searchActiveId = 0;
        }

        this.showSearch();
    }
}
