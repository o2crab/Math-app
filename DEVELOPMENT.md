# webapp 開発マニュアル

## 1. プロジェクト概要

React(フロントエンド)と Flask(バックエンド)で作る Web アプリを、チーム全員が同じ環境で開発するための Dev Container 環境です。

サンプルとして、ユーザーが入力した整数を素因数分解するアプリが入っています(例: `360` → `2^3 × 3^2 × 5`)。

### システム構成

- フロントエンド: React(Vite) — 数字の入力フォームと結果の表示。`/api` へのリクエストは Vite が Flask に中継する(CORS の設定は不要)
- バックエンド: Flask(Python 3.13、パッケージ管理は uv) — `GET /api/factorize?n=<整数>` で素因数分解の結果を JSON で返す。入力は 2 以上 10^12 以下の整数(それ以外は 400 とエラーメッセージを返す)
- データベース: なし(この環境では起動しません)

### ディレクトリ構成

```text
webapp/
├── .devcontainer/
│   ├── devcontainer.json     # Dev Container の設定
│   └── post-create.sh        # 作成後の初期セットアップ(エイリアス、uv の導入、依存のインストール)
├── backend/
│   ├── app.py                # Flask アプリ(素因数分解 API)
│   ├── pyproject.toml        # 依存の定義(uv)
│   └── uv.lock               # 解決済みのバージョン(コミットする)
├── frontend/
│   ├── index.html
│   ├── package.json / package-lock.json
│   ├── vite.config.js        # 開発サーバーの設定(/api を Flask に中継)
│   └── src/
│       ├── main.jsx          # エントリポイント
│       └── App.jsx           # 入力フォームと結果表示
├── .gitattributes            # シェルスクリプトを LF 改行にする設定
├── .gitignore                # .venv/、node_modules/ などを除外
└── DEVELOPMENT.md            # このマニュアル
```

## 2. 開発環境の概要

| 項目 | 内容 |
|---|---|
| 言語 / ランタイム | Python 3.13、Node.js(LTS) |
| ベースイメージ | `mcr.microsoft.com/devcontainers/python:1-3.13-bookworm` |
| コンテナ内ユーザー | `vscode`(非 root) |
| 転送ポート | 5173(Vite / React)、5000(Flask) |
| Python パッケージ管理 | uv(`backend/pyproject.toml` と `uv.lock`) |
| 主な拡張機能 | Python、Pylance、Ruff、ESLint、Prettier、Markdown All in One、markdownlint |
| 初期セットアップ | `.devcontainer/post-create.sh`(bash エイリアスの設定、uv の導入、`uv sync` と `npm install`) |
| AI 開発支援 | Claude Code(Features で導入済み) |
| bash エイリアス | `l`(`ls --color=auto`)、`la`(`ls -la --color=auto`) |

## 3. 環境の起動手順

### 事前準備(初回のみ)

1. Docker をインストールして起動する(Windows / macOS: Docker Desktop(Windows は WSL2 を有効に)、Linux: Docker Engine)。`docker ps` がエラーなく動くことを確認する
2. VS Code をインストールする
3. 拡張機能「Dev Containers」(`ms-vscode-remote.remote-containers`)を入れる

### コンテナで開く

1. このリポジトリを clone し、フォルダを VS Code で開く(`.devcontainer` がある**フォルダ自体**を開く)
2. 右下の「Reopen in Container」をクリックする。出ない場合は、コマンドパレット(`Ctrl+Shift+P` / `Cmd+Shift+P`)で `Dev Containers: Reopen in Container` を実行する
3. 初回はイメージ取得と初期セットアップで数分かかる。進捗は「Show Log」で確認できる。uv のインストールにインターネット接続が必要

### 動作確認

コンテナ内のターミナル(`` Ctrl+` ``)で実行する。

```bash
python --version
node -v
uv --version
git --version
```

### バックエンド(Flask / uv)

コンテナを作ると、`post-create.sh` が `uv sync` を実行済みなので、すぐ起動できる。

```bash
cd backend
uv run python app.py          # http://localhost:5000 で起動(debug モード)
```

API の確認:

```bash
curl "http://localhost:5000/api/factorize?n=360"
```

その他の操作:

```bash
uv sync                       # 依存を pyproject.toml / uv.lock どおりに再現する
uv add <パッケージ名>           # 依存を追加する
```

### フロントエンド(React / Vite)

`post-create.sh` が `npm install` を実行済み。バックエンドを起動した状態で、別のターミナルで次を実行する。

```bash
cd frontend
npm run dev -- --host
```

ブラウザで `http://localhost:5173` を開き、数字を入力して「分解する」を押す。`/api` へのリクエストは Vite が `localhost:5000` の Flask に中継する(`frontend/vite.config.js`)。

### Claude Code

コンテナ内のターミナルで `claude` を実行し、初回のみ表示される案内に従ってログインする(コンテナを作り直すとログインが必要になることがある)。

### Git

git はコンテナ内で使える。VS Code は通常、ホストの Git 設定と認証情報(HTTPS / SSH エージェント)をコンテナに引き継ぐ。ホスト側で事前に設定しておくこと。確認コマンド:

```bash
git config user.name
git config user.email
```

## 4. 日常の操作

| やりたいこと | 操作 |
|---|---|
| `.devcontainer/` の設定変更を反映する | `Dev Containers: Rebuild Container` |
| キャッシュを使わずやり直す | `Dev Containers: Rebuild Container Without Cache` |
| コンテナを出てローカルで開く | `Dev Containers: Reopen Folder Locally` |
| ログを見る | `Dev Containers: Show Container Log` |

## 5. トラブルシューティング

| 症状 | 対処 |
|---|---|
| `Cannot connect to the Docker daemon` | Docker Desktop を起動する。Linux は `docker` グループに自分を追加する |
| `bad interpreter: /bin/bash^M` | シェルスクリプトを LF 改行にする(`.gitattributes` に `*.sh text eol=lf` を設定済み。既に CRLF で取得した場合は、ファイルを LF で保存し直す) |
| `uv: command not found` | 新しいターミナルを開く。直らなければ `export PATH="$HOME/.local/bin:$PATH"` を実行し、それでも無ければ `bash .devcontainer/post-create.sh` を再実行する |
| ブラウザから Vite / Flask に繋がらない | `npm run dev -- --host` や `--host 0.0.0.0` で待ち受けさせる。VS Code の「ポート」タブで 5173 / 5000 が転送されているか確認する |
| Git の認証が通らない | ホストで `ssh-add -l` が鍵を返すか確認する。Windows ではホストの SSH エージェントサービスの起動が必要なことがある |
| `postCreateCommand` が失敗する | コンテナ内のターミナルで `bash .devcontainer/post-create.sh` を手動実行して、エラーを直接見る |
