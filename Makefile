# MiniCloud frontend — common tasks. Run `make` or `make help` to list them.

.DEFAULT_GOAL := help
.PHONY: help install dev build preview

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
