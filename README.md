# Overtue

[<img src="https://github.com/andyholmes/gnome-shell-extensions-badge/raw/master/get-it-on-ego.svg" width=120px>](https://extensions.gnome.org/extension/4158/gnome-40-ui-improvements/)

Simple [gnome-shell](https://wiki.gnome.org/Projects/GnomeShell) extension that tunes the overview UI to make it more usable.

The project is named Overtue. The extension UUID and settings schema keep their
existing `overtue` IDs so upgrades preserve installed settings.

Supported GNOME Shell versions are listed in `metadata.json`.

## Changes

- Search textbox is hidden by default and shown only when user begins to type-to-search
- Scale of workspaces thumbnails increased 2x
- Restores background image for workspace thumbnails
- Show workspaces' thumbnails even when there is only one workspace
- Firefox's PIP (picture in picture) window is now displayed on the overview screen

All modifications can be disabled in the extension's settings.

## Development

The project is managed with the included `Makefile`.

```sh
make help
```

Useful targets:

- `make build` compiles TypeScript sources into `dist/`.
- `make typecheck` type-checks without emitting.
- `make schemas` compiles the GSettings schema.
- `make gettext` generates compiled translation files.
- `make dist` builds the extension zip for extensions.gnome.org.
- `make update-ff-translations` updates Firefox PIP title translations.

Build dependencies:

- `gnome-extensions`
- `glib-compile-schemas`
- `msgfmt`
- `jq`
- Bun (installs TypeScript and `@girs` type definitions)

## TypeScript

Sources are TypeScript (`extension.ts`, `prefs.ts`, `src/*.ts`) typed with
`@girs/gjs` and `@girs/gnome-shell`. Shell private APIs without `@girs`
coverage are modeled minimally in `src/shellInternals.d.ts` and
`src/workspaceThumbnail.d.ts`.

Install dependencies once:

```sh
bun install
```

Compile with either command:

```sh
make build
bun run build
```

`tsc` emits plain GJS JavaScript into `dist/`, preserving `gi://`,
`resource:///`, and relative `.js` import specifiers.

## Build

Create a distributable extension zip:

```sh
make dist
```

This type-checks and compiles TypeScript into `dist/`, stages `metadata.json`,
`LICENSE`, schemas, and translations there, and runs `gnome-extensions pack`
on it.
The output is a zip file named after the extension UUID, for example:

```sh
overtue@lost-saint.gg.shell-extension.zip
```

Generated files such as `dist/`, compiled schemas, `.mo` files, and zip files are ignored by git.

## Install

Install the built zip:

```sh
gnome-extensions install --force overtue@lost-saint.gg.shell-extension.zip
```

Enable the extension by UUID:

```sh
gnome-extensions enable overtue@lost-saint.gg
```

## Screenshot

![image](https://user-images.githubusercontent.com/3088476/114587629-daae3280-9c53-11eb-9c70-3fb40fbb3d42.png)
