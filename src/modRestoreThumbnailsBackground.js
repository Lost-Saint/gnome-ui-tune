import { Mod } from "./mod.js";

import { WorkspaceThumbnail } from "resource:///org/gnome/shell/ui/workspaceThumbnail.js";
import { BackgroundManager } from "resource:///org/gnome/shell/ui/background.js";
import { InjectionManager } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

function cleanupThumbnailBackground(thumbnail) {
  if (!thumbnail?._bgManager) {
    return;
  }

  if (thumbnail._bgManagerLoadedId) {
    thumbnail._bgManager.disconnect(thumbnail._bgManagerLoadedId);
    thumbnail._bgManagerLoadedId = 0;
  }

  if (thumbnail._bgManagerChangedId) {
    thumbnail._bgManager.disconnect(thumbnail._bgManagerChangedId);
    thumbnail._bgManagerChangedId = 0;
  }

  thumbnail._bgManager.destroy();
  thumbnail._bgManager = null;
}

export default class extends Mod {
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
        originalMethod.call(this);
        cleanupThumbnailBackground(this);
        mod._thumbnails.delete(this);
      };
    });
  }

  disable() {
    this._cleanupCurrentThumbnails();

    this._injectionManager?.clear();
    this._injectionManager = null;
    this._thumbnails = null;
  }

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

  _cleanupThumbnailsBox(thumbnailsBox) {
    for (const thumbnail of thumbnailsBox?._thumbnails ?? []) {
      cleanupThumbnailBackground(thumbnail);
      this._thumbnails?.delete(thumbnail);
    }
  }
}
