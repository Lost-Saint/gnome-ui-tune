import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import {
    ExtensionPreferences,
    gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import { getSettings as getModSettings } from './src/modsListNames.js';

function getEnumNicks(settings: Gio.Settings, key: string): string[] {
    const range = settings.settings_schema.get_key(key).get_range();
    if (range.get_type_string() !== '(sv)' || range.n_children() !== 2) {
        return [];
    }

    const values = range.get_child_value(1).get_variant();
    if (values.get_type_string() !== 'as') return [];

    return values.get_strv();
}

export default class GnomeUiTunePreferences extends ExtensionPreferences {
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

        for (const modSetting of getModSettings()) {
            switch (modSetting.kind) {
                case 'enum': {
                    const {name} = modSetting;
                    const row = new Adw.ActionRow({title: _(name)});
                    const toggle = new Gtk.Box({
                        halign: Gtk.Align.END,
                        css_classes: ['linked'],
                    });
                    const valueString = settings.get_string(name);

                    let groupButton: Gtk.ToggleButton | undefined;
                    for (const nick of getEnumNicks(settings, name)) {
                        const button = new Gtk.ToggleButton({
                            active: valueString === nick,
                            label: nick,
                        });
                        button.set_group(groupButton ?? null);
                        groupButton = button;
                        toggle.append(button);
                        button.connect('toggled', toggled => {
                            if (toggled.active) {
                                settings.set_string(name, nick);
                            }
                        });
                    }
                    row.add_suffix(toggle);
                    group.add(row);
                    break;
                }
                case 'boolean': {
                    const row = new Adw.SwitchRow({
                        title: _(modSetting.name),
                    });
                    settings.bind(
                        modSetting.name,
                        row,
                        'active',
                        Gio.SettingsBindFlags.DEFAULT,
                    );
                    group.add(row);
                    break;
                }
                default: {
                    const exhaustive: never = modSetting;
                    return exhaustive;
                }
            }
        }

        return Promise.resolve();
    }
}
