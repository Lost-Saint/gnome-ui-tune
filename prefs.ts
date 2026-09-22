import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import {
    ExtensionPreferences,
    gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import * as modsListNames from './src/modsListNames.js';

/**
 * Read the nick list of an enum GSettings key.
 *
 * The `(sv)` tuple shape comes from our own schema (validated by
 * `glib-compile-schemas` at build time), so only the inner string array is
 * validated here.
 */
function getEnumNicks(settings: Gio.Settings, key: string): string[] {
    const range = settings.get_range(key).deep_unpack() as [
        string,
        GLib.Variant,
    ];
    const nicks: unknown = range[1].deep_unpack();
    if (
        !Array.isArray(nicks) ||
        !nicks.every((nick): nick is string => typeof nick === 'string')
    ) {
        return [];
    }
    return nicks;
}

/**
 * Preferences entry point for the extension.
 *
 * Builds one preferences row per registered mod and binds each row to its
 * corresponding GSettings key.
 */
export default class GnomeUiTunePreferences extends ExtensionPreferences {
    /** Populate the GNOME Extensions preferences window. */
    override fillPreferencesWindow(
        window: Adw.PreferencesWindow,
    ): Promise<void> {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('settings-mods-list'),
        });
        page.add(group);

        for (const key of modsListNames.getNames()) {
            if (settings.get_value(key).get_type_string() === 's') {
                const row = new Adw.ActionRow({
                    title: _(key),
                });
                const toggle = new Gtk.Box({
                    halign: Gtk.Align.END,
                    css_classes: ['linked'],
                });
                const valueString = settings.get_string(key);

                let groupButton: Gtk.ToggleButton | undefined;
                for (const nick of getEnumNicks(settings, key)) {
                    const button = new Gtk.ToggleButton({
                        active: valueString === nick,
                        label: nick,
                        group: groupButton,
                    });
                    groupButton = button;
                    toggle.append(button);
                    button.connect('toggled', toggled => {
                        if (toggled.active) settings.set_string(key, nick);
                    });
                }
                row.add_suffix(toggle);
                group.add(row);
            } else {
                const row = new Adw.SwitchRow({
                    title: _(key),
                });
                settings.bind(
                    key,
                    row,
                    'active',
                    Gio.SettingsBindFlags.DEFAULT,
                );
                group.add(row);
            }
        }

        return Promise.resolve();
    }
}
