import * as modsList from './src/modsList.js';
import type { ModRegistry } from './src/modsList.js';
import type { Mod } from './src/mod.js';
import type Gio from 'gi://Gio';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * Gio.Settings plus GJS's lifetime-bound signal helpers.
 *
 * `connectObject`/`disconnectObject` exist on every GObject at runtime but
 * are untyped in `@girs`. The single assertion in {@link withObjectSignals}
 * is the boundary for that host guarantee; everything downstream trusts
 * this type.
 */
interface SettingsWithObjectSignals extends Gio.Settings {
    connectObject(
        signal: string,
        callback: (...args: unknown[]) => void,
        obj: object,
    ): number;
    disconnectObject(obj: object): void;
}

/** Assert the GJS signal helpers onto a settings object (see above). */
function withObjectSignals(
    settings: Gio.Settings,
): SettingsWithObjectSignals {
    return settings as SettingsWithObjectSignals;
}

/**
 * GNOME Shell extension entry point.
 *
 * Loads all available overview UI mods, watches their GSettings keys, and
 * enables or disables each mod when its setting changes.
 */
export default class GnomeUiTuneExtension extends Extension {
    private availableMods?: ModRegistry;
    private mods: Record<string, Mod> = {};
    private settings?: SettingsWithObjectSignals;

    /**
     * Refresh a single mod according to its current GSettings value.
     *
     * Boolean settings enable or disable a mod directly. Enum settings are
     * treated as enabled and passed to the mod constructor.
     *
     * @param name GSettings key and mod identifier.
     */
    private refreshMod(name: string): void {
        const availableMods = this.availableMods;
        const settings = this.settings;
        if (!availableMods || !settings) return;

        const ModCtor = availableMods[name];
        if (!ModCtor) return;

        if (settings.get_value(name).get_type_string() === 's') {
            this.mods[name]?.disable();
            delete this.mods[name];

            const mod = new ModCtor(settings.get_enum(name));
            mod.enable();
            this.mods[name] = mod;
            return;
        }

        if (settings.get_boolean(name)) {
            if (this.mods[name]) return;

            const mod = new ModCtor(false);
            mod.enable();
            this.mods[name] = mod;
        } else {
            this.mods[name]?.disable();
            delete this.mods[name];
        }
    }

    /** Initialize settings, connect change handlers, and enable active mods. */
    override enable(): void {
        const availableMods = modsList.get();
        this.availableMods = availableMods;
        this.mods = {};

        const settings = withObjectSignals(this.getSettings());
        this.settings = settings;

        for (const name of Object.keys(availableMods)) {
            settings.connectObject(`changed::${name}`, () => {
                this.refreshMod(name);
            }, this);
            this.refreshMod(name);
        }
    }

    /** Disconnect settings handlers and disable all active mods. */
    override disable(): void {
        this.settings?.disconnectObject(this);

        for (const key of Object.keys(this.mods)) {
            this.mods[key]?.disable();
        }

        this.availableMods = undefined;
        this.mods = {};
        this.settings = undefined;
    }
}
