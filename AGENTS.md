# Overtue

Overtue (`gnome-ui-tune@itstime.tech`) is a minimal GNOME Shell extension that tunes the overview UI to make it more usable. TypeScript sources compile with `tsc` into `dist/`, GSettings stores state, `InjectionManager` and signal connections patch Shell, and Adw builds the preferences UI.

Maintainer: `lost-saint.gg`. Supported Shell versions are listed in `metadata.json` (currently 48–50).

## What makes this extension special?

### 1. Open at the core

Fork-friendly by design. Small surface, readable mods, upstream lineage kept visible in `metadata.json`. Keep it that way.

### 2. Performance without compromise

This code runs inside the compositor. A leak, a stray signal, or a relayout loop is a dropped frame the user feels. Patches in `src/mod*.ts` must be narrow, restore everything in `disable()`, and avoid continuous repainting. The only animations are the short search-field ease in `modHideSearchInput.ts` (10ms/100ms).

### 3. Shell-version ready

Shell internals shift between versions (see the Shell 50 background-load workaround in `modRestoreThumbnailsBackground.ts`). New behavior must consider all supported versions in `metadata.json`, not just the one you run.

### 4. One surface, two entry points

There is one product surface — the overview — reached through two entry points that must stay in sync: `extension.ts` (applies mods) and `prefs.ts` (Adw switches/toggles bound to the same GSettings keys).

## A note from Lost

I like ambitious ideas, simple systems, and software that feels obvious. Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising.

Channel both "measure twice, cut once" and "yagni". Fight scope creep. Try to honor the dev's intent in both a minimal and realistic fashion.

Most contributions here are one mod or one Shell-version fix. Keep the blast radius small: one key, one mod, one override, full cleanup.

## A small glossary

- **you** means the agent reading this file and changing the extension.
- **we, us, and maintainers** mean lost-saint.gg and the people building this fork.
- **user** means the person running GNOME Shell with this extension enabled.
- **mod** means one overview modification in `src/mod*.ts`, extending `src/mod.ts` (`enable()`/`disable()`).
- **GSettings key** means one setting in `schemas/org.gnome.shell.extensions.gnome-ui-tune.gschema.xml`. It is the shared contract between `extension.ts`, `prefs.ts`, `modsList.ts`, and `modsListNames.ts`.
- **prefs** means the Extensions-app UI built in `prefs.ts` (Adw `PreferencesPage`/`SwitchRow`/toggle buttons).
- **Shell** means the running GNOME Shell the code patches via `resource:///` imports. Never bundled, never vendored.

## The three ways to hurt yourself

1. **Leaking on disable.** Every `InjectionManager.overrideMethod`, `connect`, `BackgroundManager`, and mutated Shell field in `enable()` must be undone in `disable()`. Follow the existing pattern: `injectionManager?.clear()`, `disconnect(connectId)`, `bgManager.destroy()`, restore backed-up values (see `modScaleThumbnails.ts`, `modHideSearchInput.ts`, `modRestoreThumbnailsBackground.ts`). An extension that only works until toggled is broken.
2. **Assuming Shell internals are stable.** Private paths like `main.overview._overview._controls._thumbnailsBox` and prototypes like `WorkspaceThumbnail`, `ThumbnailsBox`, `SecondaryMonitorDisplay`, `Workspace` change across versions. Guard by supported version, keep overrides minimal, and call the original method unless there is a reason not to. If the API you touch has no `@girs` coverage, extend `src/shellInternals.d.ts` / `src/workspaceThumbnail.d.ts` narrowly instead of casting at the call site.
3. **Editing generated files.** Never hand-edit `dist/`, `schemas/gschemas.compiled`, `locale/*/LC_MESSAGES/*.mo`, `*.zip`, or `src/modFirefoxPipInOverview_titles.ts`. The titles file header says `DO NOT EDIT MANUALLY` — regenerate with `make update-ff-translations`. All of these except the titles source are gitignored.

## Hit every surface

The most common defect here is wiring three of the four touchpoints and missing the last. Before calling mod work done, walk this list:

- **Schema + registry + prefs + extension.** A new or renamed key needs: `schemas/*.gschema.xml`, `src/modsList.ts` constructor entry, `src/modsListNames.ts` ordering entry, and correct handling in `extension.ts:refreshMod` (boolean vs enum) and `prefs.ts:fillPreferencesWindow` (`SwitchRow` vs toggle-button group). Miss one and the mod silently never loads or never shows.
- **Reverse states.** If you added a way in, add the way out. Enable needs disable. `showSearch` needs `hideSearch`. Background attach needs `cleanupThumbnailBackground`. A one-way door is a bug.
- **Shell versions.** Test reasoning against every version in `metadata.json`, not just yours. Note version-specific workarounds inline with the version number.
- **Monitor and workspace counts.** Thumbnail mods touch both primary (`_maxThumbnailScale`) and secondary (`SecondaryMonitorDisplay._getThumbnailsHeight`) paths, and single-workspace vs multi-workspace (`always-show-thumbnails`). Check both.
- **Locales.** User-visible strings go through `gettext` (`_(key)`) with `locale/*.po` coverage (`ar,en,fr,ja,ko,nl,ru,sk,sv`). If you add a key or label, it needs translation entries, then `make gettext`.
- **Docs.** User-facing behavior changes update `README.md` and `metadata.json:description`. Keep non-obvious code-behavior notes next to the relevant code.

## Dev workflow

- `make help` lists targets. Useful targets: `make build`, `make typecheck`, `make schemas`, `make gettext`, `make dist`, `make update-ff-translations`.
- `make build` / `bun run build` compiles `extension.ts`, `prefs.ts`, `src/*.ts` with `tsc` into `dist/`, preserving `gi://`, `resource:///`, and relative `.js` specifiers for GJS. Types come from `@girs/gjs` + `@girs/gnome-shell` (see `ambient.d.ts`); Shell privates without `@girs` coverage live in `src/shellInternals.d.ts` / `src/workspaceThumbnail.d.ts`.
- `make schemas` compiles GSettings: `glib-compile-schemas ./schemas/`. Run after schema edits.
- `make gettext` builds `.mo` files from `locale/*.po` via `msgfmt`. Run after translation edits.
- `make dist` stages the compiled output plus `metadata.json`, `LICENSE`, schemas, and `locale/` into `dist/` and packs it: `gnome-extensions pack --force --podir=locale --extra-source src --extra-source LICENSE dist --out-dir .`. Output is `gnome-ui-tune@itstime.tech.shell-extension.zip` (gitignored). Never hand-edit `dist/`; it is rebuilt from sources.
- Install / enable the built zip:
  ```sh
  gnome-extensions install --force gnome-ui-tune@itstime.tech.shell-extension.zip
  gnome-extensions enable gnome-ui-tune@itstime.tech
  ```
- After update, Shell restart is required: X11 `Alt+F2` → `r`; Wayland logout → login.
- Build deps: `gnome-extensions`, `glib-compile-schemas`, `msgfmt`, `jq`, and Bun for TypeScript dependencies.
- Release CI (`.github/workflows/release.yml`): push tag `v*.*.*` → container `ghcr.io/axxapy/gnome-extensions-docker` → `make dist` → attach `*.zip` via `softprops/action-gh-release`.

## Test data

There is no database and no test suite. Test in a live Shell session:

- One workspace vs several (covers `always-show-thumbnails`).
- Thumbnail scale through every enum value (`100%`–`500%`, default `200%`) on primary and secondary monitors.
- Wallpaper vs solid background (covers `restore-thumbnails-background`), including cold-boot/cold-cache and resume paths.
- Type-to-search open/close (covers `hide-search`).
- Firefox Picture-in-Picture with a localized player title (covers `overview-firefox-pip` + generated titles list).
- Toggle each key off and back on from prefs, then disable/re-enable the whole extension — everything must restore.

## Verifying

- Smallest proof that the change works: exercise the mod in a real Shell + prefs, including the disable path. There is no unit suite (`package.json` has no test script); do not invent static-markup or callback-wiring tests.
- After schema work: `make schemas` must succeed and the key must appear in prefs and take effect.
- After locale work: `make gettext` must succeed with no `msgfmt` errors.
- After packaging work: `make dist` must produce an installable zip; CI owns the tag-release path.
- **Do not run repo-wide checks.** No full-suite equivalent exists; CI only builds the zip on tags. Keep verification scoped to what you touched.
- Do not verify with browsers or computer use unless explicitly requested.

## Pull requests

- Never make a PR unless explicitly asked.
- Conventional titles, plain language (repo history: `fix: signal error`, `chore: migrate to bun`): e.g. `fix(pip): match localized Firefox titles on Shell 50`.
- Body: the problem in a sentence or two, then how you fixed it, including Shell versions tested and restart path used.
- UI/overview changes need before/after screenshots. Timing/animation needs a short video.
- Upload PR evidence to GitHub. Never commit PR-only assets, zips, `.mo` files, or compiled schemas.
- One concern per PR. If the description says "also", split it.

## Documentation

Most changes need no new doc page. Agents can read the code.

- User-facing behavior (new mod, changed default, new Shell version, new setting) updates `README.md` (Changes list, supported versions pointer, Development/Build/Install as needed) and `metadata.json:description` where shown in the Extensions app.
- Keep code reasoning beside the implementation as short comments. Reserve comments for Shell-version differences and other behavior the types and code do not explain.
- `locale/*.po` `msgid`s are user docs of a sort: keep `settings-mods-list` and key labels accurate (`locale/en.po` is the reference).
- Do not enumerate fields, narrate control flow, maintain file catalogs, or append PR summaries. Types, schema descriptions, and code already record the implementation.

## Plans and work artifacts

- Do not commit implementation plans, research notes, or agent scratch files. Keep temporary material outside the worktree.
- Gitignored safety net (`.gitignore`): `node_modules/`, `dist/`, `schemas/gschemas.compiled`, `*.mo`, `*.zip`, plus IDE files. Generated output stays local.
- A merged PR is the implementation record. Do not preserve a second checklist in the repo.

## How it works

`extension.ts:GnomeUiTuneExtension.enable()` loads the registry from `src/modsList.ts:get()` (constructors keyed by GSettings name), connects `changed::<key>` for each, and calls `refreshMod`. Boolean keys enable/disable directly; the enum key (`increase-thumbnails-size`) is treated as enabled and its enum value is passed to the constructor. `disable()` disconnects and tears down every active mod.

Each mod extends `src/mod.ts:Mod` with `enable()`/`disable()`. Implementations patch Shell via `InjectionManager.overrideMethod` on `WorkspaceThumbnail` / `ThumbnailsBox` / `SecondaryMonitorDisplay` / `Workspace`, or via overview signal connections, or via per-thumbnail `BackgroundManager`. Every patch tracks what it changed so `disable()` fully restores it.

`prefs.ts:fillPreferencesWindow` builds one Adw row per definition in `src/modsListNames.ts:getSettings()` order: `SwitchRow` bound via `settings.bind` for booleans, grouped `ToggleButton`s via `get_range`/`set_string` for the enum. `src/modFirefoxPipInOverview_titles.ts` is generated from Mozilla `l10n-central` by `scripts/update-ff-translations.sh` and maps localized PiP window titles for the `_isOverviewWindow` override.

## Where code lives

- `extension.ts` — extension entry point, settings wiring, per-mod refresh.
- `prefs.ts` — Adw preferences window, one row per mod key.
- `src/mod.ts` — abstract `Mod` base (`enable`/`disable` contract).
- `src/modsList.ts` — mod constructors keyed by GSettings name (prefs cannot use this; importing loads mods).
- `src/modsListNames.ts` — ordered, discriminated setting definitions shared by the extension and prefs.
- `src/modScaleThumbnails.ts` — primary `_maxThumbnailScale` + secondary `_getThumbnailsHeight` override; takes enum-derived scale factor.
- `src/modHideSearchInput.ts` — collapses/expands search entry on `showing` / `notify::search-active`.
- `src/modRestoreThumbnailsBackground.ts` — per-thumbnail `BackgroundManager` via `_init`/`_onDestroy` overrides + orphan cleanup across thumbnail boxes.
- `src/modAlwaysShowThumbnails.ts` — forces `ThumbnailsBox._updateShouldShow`.
- `src/modFirefoxPipInOverview.ts` + `src/modFirefoxPipInOverview_titles.ts` (generated) — treats Firefox PiP windows as overview windows.
- `schemas/org.gnome.shell.extensions.gnome-ui-tune.gschema.xml` — 5 keys, defaults (`hide-search`, `restore-thumbnails-background`, `always-show-thumbnails`, `overview-firefox-pip` default `true`; `increase-thumbnails-size` default `'200%'`).
- `metadata.json` — UUID, display name, `settings-schema`, supported Shell versions.
- `locale/*.po` + `Makefile:gettext` — translations; `scripts/update-ff-translations.sh` — PiP title regeneration.
- `Makefile`, `package.json`, `tsconfig.json` — build tooling. `.github/workflows/release.yml` — tag-triggered zip release.

## Taste

- Complexity belongs at the adapter boundary. Orchestration stays pure, UI stays dumb.
- One key, one mod, one responsibility. If a mod needs a second override for secondary monitors or cleanup sweeps, that is the exception — comment why.
- `disable()` mirrors `enable()` line for line. Back up what you overwrite (`bkp_MAX_THUMBNAIL_SCALE`), track connections/actors in fields or sets, and null them after teardown.
- Inferred types over annotations. any is the enemy.
- Prefer `InjectionManager` + original-method delegation over copying Shell logic. Prefer signal `disconnect` over leaving handlers.
- Comments describe how a thing is used, and move when the code moves. To be used mostly to describe functions, not to annotate every line of behavior.
- If a rule here fights the task in front of you, say so loudly and get a human sign-off before breaking it.

## Additional tips

- Wayland needs logout/login to pick up changes; X11 can `Alt+F2` → `r`. Say which path you tested.
- Shell version matrix matters more than distro matrix. When Shell 46 and Shell 50 disagree, the code must handle both or say so.
- Security is important but should not be over-indexed.
