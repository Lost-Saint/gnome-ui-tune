
/**
 * Base class for overview UI modifications.
 *
 * Mods are enabled and disabled by the extension when their matching setting
 * changes. Subclasses should undo all signal connections, overrides, and state
 * changes from {@link Mod#enable} in {@link Mod#disable}.
 */
export class Mod {
    /**
     * Apply the modification.
     *
     * @returns {void}
     */
    enable() {}

    /**
     * Undo the modification.
     *
     * @returns {void}
     */
    disable() {}
}
