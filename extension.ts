import Gio from 'gi://Gio';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import type { Mod } from './src/mod.js';
import * as modsList from './src/modsList.js';
import type { ModRegistry } from './src/modsList.js';
import {
    getSettings as getModSettings,
    type ModName,
    type ModSetting,
} from './src/modsListNames.js';

type ExtensionState =
    | {readonly kind: 'disabled'}
    | {
        readonly kind: 'enabled';
        readonly availableMods: ModRegistry;
        readonly mods: Partial<Record<ModName, Mod>>;
        readonly settings: Gio.Settings;
        readonly settingsSignalIds: number[];
    };

export default class GnomeUiTuneExtension extends Extension {
    private state: ExtensionState = {kind: 'disabled'};

    private refreshMod(setting: ModSetting): void {
        const state = this.state;
        if (state.kind === 'disabled') return;

        const {availableMods, mods, settings} = state;
        switch (setting.kind) {
            case 'enum': {
                const {name} = setting;
                mods[name]?.disable();
                delete mods[name];

                const value = setting.parse(settings.get_enum(name));
                const mod = new availableMods[name](value);
                mod.enable();
                mods[name] = mod;
                return;
            }
            case 'boolean': {
                const {name} = setting;
                if (settings.get_boolean(name)) {
                    if (mods[name]) return;

                    const mod = new availableMods[name]();
                    mod.enable();
                    mods[name] = mod;
                } else {
                    mods[name]?.disable();
                    delete mods[name];
                }
                return;
            }
            default: {
                const exhaustive: never = setting;
                return exhaustive;
            }
        }
    }

    override enable(): void {
        const settings = this.getSettings();
        const state: ExtensionState = {
            kind: 'enabled',
            availableMods: modsList.get(),
            mods: {},
            settings,
            settingsSignalIds: [],
        };
        this.state = state;

        for (const modSetting of getModSettings()) {
            const signalId = settings.connect(
                `changed::${modSetting.name}`,
                () => this.refreshMod(modSetting),
            );
            state.settingsSignalIds.push(signalId);
            this.refreshMod(modSetting);
        }
    }

    override disable(): void {
        const state = this.state;
        if (state.kind === 'disabled') return;
        this.state = {kind: 'disabled'};

        for (const signalId of state.settingsSignalIds) {
            state.settings.disconnect(signalId);
        }

        for (const mod of Object.values(state.mods)) {
            mod?.disable();
        }
    }
}
