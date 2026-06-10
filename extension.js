import * as modsList from './src/modsList.js'
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @module extension
 */

/**
 * GNOME Shell extension entry point.
 *
 * Loads all available overview UI mods, watches their GSettings keys, and
 * enables or disables each mod when its setting changes.
 *
 * @extends Extension
 */
export default class GnomeUiTuneExtension extends Extension {
    /**
     * Refresh a single mod according to its current GSettings value.
     *
     * Boolean settings enable or disable a mod directly. Enum settings are
     * treated as enabled and passed to the mod constructor.
     *
     * @param {string} name GSettings key and mod identifier.
     * @returns {void}
     */
    _refresh_mod(name) {
        if (!this.available_mods[name]) return

        let enabled, settings = false
        const value = this.settings.get_value(name)
        switch (value.get_type_string()) {
            case "s":
                if (this.mods[name]) { //disable
                    this.mods[name].disable()
                    delete this.mods[name]
                }
                settings = this.settings.get_enum(name)
                enabled = true
                break

            default:
                enabled = this.settings.get_boolean(name)
        }

        if (enabled) { // enable
            if (this.mods[name]) return

            const mod = new this.available_mods[name](settings)
            mod.enable()
            this.mods[name] = mod
        } else if (this.mods[name]) { //disable
            this.mods[name].disable()
            delete this.mods[name]
        }
    }

    /**
     * Initialize settings, connect change handlers, and enable active mods.
     *
     * @returns {void}
     */
    enable() {
        /** @type {module:src/modsList.ModRegistry} */
        this.available_mods = modsList.get()
        /** @type {Object<string, module:src/mod.Mod>} */
        this.mods = {}

        this.settings = this.getSettings()

        Object.keys(this.available_mods).forEach(name => {
            this.settings.connectObject('changed::' + name, () => {
                this._refresh_mod(name)
            }, this);
            this._refresh_mod(name)
        })
    }

    /**
     * Disconnect settings handlers and disable all active mods.
     *
     * @returns {void}
     */
    disable() {
        this.settings?.disconnectObject(this)

        for (const key in this.mods) {
            if (!this.mods.hasOwnProperty(key)) continue;
            this.mods[key].disable()
        }

        delete this.available_mods
        delete this.mods
        delete this.settings
    }
}
