import { Mod } from "./mod.js";

import { WorkspaceThumbnail } from "resource:///org/gnome/shell/ui/workspaceThumbnail.js";
import { BackgroundManager } from "resource:///org/gnome/shell/ui/background.js";
import { InjectionManager } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

/**
 * @module src/modRestoreThumbnailsBackground
 */

/**
 * Workspace thumbnail fields managed by this mod.
 *
 * GNOME Shell owns the object. The mod adds these fields while enabled so it
 * can disconnect signals and destroy the background manager later.
 *
 * @typedef {Object} ThumbnailWithBackground
 * @property {?BackgroundManager} [_bgManager] Background manager attached to the thumbnail.
 * @property {number} [_bgManagerLoadedId] Signal id for the background loaded handler.
 * @property {number} [_bgManagerChangedId] Signal id for the background changed handler.
 */

/**
 * Remove the background manager and signal handlers from a thumbnail.
 *
 * @param {ThumbnailWithBackground} thumbnail Thumbnail patched by this mod.
 * @returns {void}
 */
function cleanupThumbnailBackground(thumbnail) {
  if (!thumbnail?._bgManager) {
    return;
  }

  const bgManager = thumbnail._bgManager;
  thumbnail._bgManager = null;

  if (thumbnail._bgManagerLoadedId) {
    bgManager.disconnect(thumbnail._bgManagerLoadedId);
    thumbnail._bgManagerLoadedId = 0;
  }

  if (thumbnail._bgManagerChangedId) {
    bgManager.disconnect(thumbnail._bgManagerChangedId);
    thumbnail._bgManagerChangedId = 0;
  }

  bgManager.destroy();
}

/**
 * Restores wallpaper backgrounds inside workspace thumbnails.
 *
 * @extends Mod
 */
export default class RestoreThumbnailsBackgroundMod extends Mod {
  /**
   * Attach background managers to newly created workspace thumbnails.
   *
   * @override
   * @returns {void}
   */
  enable() {
    this._thumbnails = new Set();
    this._injectionManager = new InjectionManager();

    // Thumbnails on main monitor
    this._injectionManager.overrideMethod(WorkspaceThumbnail.prototype, "_init", originalMethod => {
      const mod = this;
      return function (
        metaWorkspace,
        monitorIndex,
      ) {
        originalMethod.call(this, metaWorkspace, monitorIndex);
        mod._thumbnails.add(this);
        this._bgManager = new BackgroundManager({
          monitorIndex: monitorIndex,
          container: this._contents,
          vignette: false,
        });

        // Shell 50: when the wallpaper image finishes loading after the
        // thumbnail is built (cold cache on cold boot, or after resume
        // invalidates the cache), the Meta.BackgroundActor's preferred
        // size update no longer always propagates to its parent's
        // allocation, leaving the thumbnail blank until something else
        // (e.g. switching workspaces) forces a relayout. Force one
        // ourselves on every load and on every actor swap.
        const requeue = () => this._bgManager?.backgroundActor?.queue_relayout();
        this._bgManagerLoadedId = this._bgManager.connect("loaded", requeue);
        this._bgManagerChangedId = this._bgManager.connect("changed", requeue);
      };
    });

    this._injectionManager.overrideMethod(WorkspaceThumbnail.prototype, "_onDestroy", originalMethod => {
      const mod = this;
      return function () {
        cleanupThumbnailBackground(this);
        mod._thumbnails.delete(this);
        originalMethod.call(this);
      };
    });
  }

  /**
   * Clean up background managers and remove method overrides.
   *
   * @override
   * @returns {void}
   */
  disable() {
    this._cleanupCurrentThumbnails();

    this._injectionManager?.clear();
    this._injectionManager = null;
    this._thumbnails = null;
  }

  /**
   * Remove backgrounds from all thumbnails that currently exist.
   *
   * @private
   * @returns {void}
   */
  _cleanupCurrentThumbnails() {
    for (const thumbnail of this._thumbnails ?? []) {
      cleanupThumbnailBackground(thumbnail);
    }

    const controls = Main.overview?._overview?.controls;
    this._cleanupThumbnailsBox(controls?._thumbnailsBox);

    for (const view of controls?._workspacesDisplay?._workspacesViews ?? []) {
      this._cleanupThumbnailsBox(view?._thumbnails);
    }
  }

  /**
   * Remove backgrounds from every thumbnail in a thumbnails box.
   *
   * @private
   * @param {?Object} thumbnailsBox GNOME Shell thumbnails box.
   * @returns {void}
   */
  _cleanupThumbnailsBox(thumbnailsBox) {
    for (const thumbnail of thumbnailsBox?._thumbnails ?? []) {
      cleanupThumbnailBackground(thumbnail);
      this._thumbnails?.delete(thumbnail);
    }
  }
}
