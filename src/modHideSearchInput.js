import {Mod} from './mod.js'

import Clutter from 'gi://Clutter'
import * as Main from 'resource:///org/gnome/shell/ui/main.js'

/**
 * @module src/modHideSearchInput
 */

/**
 * Hides the overview search entry until search becomes active.
 *
 * @extends Mod
 */
export default class HideSearchInputMod extends Mod {
    /**
     * Expand the search entry container.
     *
     * @returns {void}
     */
    show_search() {
        // Main.overview.searchEntry.show();
        Main.overview.searchEntry?.get_parent()?.ease({
            height  : Main.overview.searchEntry.height,
            mode    : Clutter.AnimationMode.EASE,
            duration: 10,
        })
    }

    /**
     * Collapse the search entry container.
     *
     * @returns {void}
     */
    hide_search() {
        // Main.overview.searchEntry.hide();
        Main.overview.searchEntry?.get_parent()?.ease({
            height  : 0,
            mode    : Clutter.AnimationMode.EASE,
            duration: 100,
        })
    }

    /**
     * Connect overview signals and hide the search entry when appropriate.
     *
     * @override
     * @returns {void}
     */
    enable() {
        this.onceConnectId = Main.overview.connect('showing', () => {
            const connectId = this.onceConnectId
            this.onceConnectId = 0

            if (connectId) {
                Main.overview.disconnect(connectId)
            }

            this.hide_search()
        })

        this.connectedId = Main.overview.searchController.connect('notify::search-active', () => {
            if (Main.overview.searchController.searchActive) {
                this.show_search()
            } else {
                this.hide_search()
            }
        })
    }

    /**
     * Disconnect overview signals and restore the search entry.
     *
     * @override
     * @returns {void}
     */
    disable() {
        if (this.onceConnectId) {
            Main.overview.disconnect(this.onceConnectId)
            this.onceConnectId = 0
        }

        if (this.connectedId) {
            Main.overview.searchController.disconnect(this.connectedId)
            this.connectedId = 0
        }

        this.show_search()
    }
}
