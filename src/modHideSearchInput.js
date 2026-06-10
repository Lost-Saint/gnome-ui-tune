import {Mod} from './mod.js'

import Clutter from 'gi://Clutter'
import * as Main from 'resource:///org/gnome/shell/ui/main.js'

export default class extends Mod {
    show_search() {
        // Main.overview.searchEntry.show();
        Main.overview.searchEntry?.get_parent()?.ease({
            height  : Main.overview.searchEntry.height,
            mode    : Clutter.AnimationMode.EASE,
            duration: 10,
        })
    }

    hide_search() {
        // Main.overview.searchEntry.hide();
        Main.overview.searchEntry?.get_parent()?.ease({
            height  : 0,
            mode    : Clutter.AnimationMode.EASE,
            duration: 100,
        })
    }

    enable() {
        this.onceConnectId = Main.overview.connect('showing', () => {
            this.hide_search()
            Main.overview.disconnect(this.onceConnectId)
            this.onceConnectId = 0
        })

        this.connectedId = Main.overview.searchController.connect('notify::search-active', () => {
            if (Main.overview.searchController.searchActive) {
                this.show_search()
            } else {
                this.hide_search()
            }
        })
    }

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
