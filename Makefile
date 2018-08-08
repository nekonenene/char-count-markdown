.PHONY: init
init:
	# nodejs はインストール済みとする
	rm -rf node_modules
	npm install

.PHONY: run
run:
	npm run start

.PHONY: build
	npm run build:prod

.PHONY: build-dev
	npm run build:dev

.PHONY: lint
	npm run eslint
