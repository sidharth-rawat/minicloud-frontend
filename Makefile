# MiniCloud frontend — common tasks. Run `make` or `make help` to list them.

# Web root the production server serves the built files from (override if needed).
WEBROOT ?= /var/www/minicloud

.DEFAULT_GOAL := help
.PHONY: help install dev build preview publish

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Run the Vite dev server (http://localhost:5173)
	npm run dev

build: ## Type-check + production build (dist/)
	npm run build

preview: ## Preview the production build locally
	npm run preview

publish: build ## (server) Build + copy dist/ into the web root Caddy serves
	sudo cp -r dist/* $(WEBROOT)/
