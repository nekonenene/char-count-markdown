# 文字数カウント for Markdown

マークダウンでレンダリング後の文字数を計算

**ここでさわれます！: [https://nekonenene.github.io/char-count-markdown](https://nekonenene.github.io/char-count-markdown)**


## Require

* Node.js: v10.15.2 (v10.x LTS)
* npm: v6.4.1 or above


## 開発するには……

このリポジトリをクローンしたのち、

```
make init
```

で依存ライブラリのダウンロード。

```
make run
```

で開発用サーバーが起動し、 http://localhost:8013 にアクセス可能。


## ビルドするには……

* 本番環境用
  ```
  make build
  ```

* 開発環境用
  ```
  make build-dev
  ```


## linter

* lint チェック!!
  ```
  make lint
  ```

* lint fix!!
  ```
  make lint-fix
  ```
