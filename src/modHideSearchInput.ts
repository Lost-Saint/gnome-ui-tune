import Clutter from 'gi://Clutter';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Mod } from './mod.js';

export default class HideSearchInputMod extends Mod {
    private overviewShowingId = 0;
    private searchActiveId = 0;

    private showSearch(): void {
        const searchEntry = Main.overview.searchEntry;
        const container = searchEntry?.get_parent();
        if (!searchEntry || !container) return;
        const verticalPadding =
            container instanceof St.Widget
                ? container.get_theme_node().get_vertical_padding()
                : null;
        if (verticalPadding === null) return;

        container.ease({
            height: searchEntry.height + verticalPadding,
            mode: Clutter.AnimationMode.EASE,
            duration: 10,
        });
    }

    private hideSearch(): void {
        const container = Main.overview.searchEntry?.get_parent();
        if (!container) return;
        const verticalPadding =
            container instanceof St.Widget
                ? container.get_theme_node().get_vertical_padding()
                : null;
        if (verticalPadding === null) return;

        container.ease({
            height: verticalPadding,
            mode: Clutter.AnimationMode.EASE,
            duration: 100,
        });
    }

    override enable(): void {
        this.overviewShowingId = Main.overview.connect('showing', () => {
            this.hideSearch();
        });

        this.searchActiveId = Main.overview.searchController.connect(
            'notify::search-active',
            () => this.hideSearch(),
        );

        this.hideSearch();
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
