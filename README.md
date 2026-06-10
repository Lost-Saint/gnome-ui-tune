# Gnome 4x Overview UI Tune

[<img src="https://github.com/andyholmes/gnome-shell-extensions-badge/raw/master/get-it-on-ego.svg" width=120px>](https://extensions.gnome.org/extension/4158/gnome-40-ui-improvements/)

Simple [gnome-shell](https://wiki.gnome.org/Projects/GnomeShell) (v4x) extension that tunes overview UI to make it more usable.

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

- `make docs` generates JSDoc API documentation.
- `make schemas` compiles the GSettings schema.
- `make gettext` generates compiled translation files.
- `make dist` builds the extension zip for extensions.gnome.org.
- `make update-ff-translations` updates Firefox PIP title translations.

Build dependencies:

- `gnome-extensions`
- `glib-compile-schemas`
- `msgfmt`
- `jq`
- Node.js and pnpm, for JSDoc only

## Documentation

Install the local Node.js tooling once:

```sh
pnpm install
```

Generate API documentation with either command:

```sh
make docs
pnpm run docs
```

The generated JSDoc site is written to `docs/`. Open it locally with:

```sh
xdg-open docs/index.html
```

## Build

Create a distributable extension zip:

```sh
make dist
```

This compiles schemas, builds translation files, and runs `gnome-extensions pack`.
The output is a zip file named after the extension UUID, for example:

```sh
gnome-ui-tune@itstime.tech.shell-extension.zip
```

Generated files such as `docs/`, compiled schemas, `.mo` files, and zip files are ignored by git.

## Screenshot

![image](https://user-images.githubusercontent.com/3088476/114587629-daae3280-9c53-11eb-9c70-3fb40fbb3d42.png)
