.PHONY: build typecheck gettext dist help schemas update-ff-translations clean
.DEFAULT_GOAL=help
uuid:=$(shell jq -r .uuid metadata.json)
TSC:=./node_modules/.bin/tsc

help:  ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[\/a-zA-Z_-]+:.*?## / {sub("\\\\n",sprintf("\n%22c"," "), $$2);printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

node_modules: package.json bun.lock
	bun install --frozen-lockfile

build: | node_modules ## Compile TypeScript into dist/
	$(TSC)

typecheck: | node_modules ## Type-check without emitting
	$(TSC) --noEmit

gettext: ## Generate .mo translation files
	find locale -name *.po | xargs basename -s .po | xargs -I{} mkdir -p locale/{}/LC_MESSAGES || /bin/true
	find locale -name *.po | xargs basename -s .po | xargs -I{} msgfmt -D locale -o locale/{}/LC_MESSAGES/$(uuid).mo {}.po

schemas: ## Compile glib schemas
	glib-compile-schemas ./schemas/

dist: build schemas gettext ## Prepare zip file for extensions.gnome.org
	rm -rf dist/schemas dist/locale dist/metadata.json dist/LICENSE
	cp metadata.json LICENSE dist/
	cp -r schemas locale dist/
	glib-compile-schemas dist/schemas
	gnome-extensions pack --force --podir=locale --extra-source src --extra-source LICENSE dist --out-dir .

clean: ## Remove build output and the packed zip
	rm -rf dist $(uuid).shell-extension.zip

update-ff-translations: ## Updates PIP window title translations from Firefox
	./scripts/update-ff-translations.sh
