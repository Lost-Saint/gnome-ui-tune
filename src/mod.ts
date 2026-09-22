/**
 * Base class for overview UI modifications.
 *
 * Mods are enabled and disabled by the extension when their matching setting
 * changes. Subclasses must undo all signal connections, overrides, and state
 * changes from {@link Mod.enable} in {@link Mod.disable}.
 */
export abstract class Mod {
    /** Apply the modification. */
    abstract enable(): void;

    /** Undo the modification. */
    abstract disable(): void;
}
