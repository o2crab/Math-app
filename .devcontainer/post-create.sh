#!/usr/bin/env bash
# コンテナ作成後に1回実行される初期セットアップ。
# 何度実行しても結果が変わらない(冪等な)書き方にしてある。
set -euo pipefail

# --- bash エイリアスと PATH(既定) -----------------------------------------
# ~/.bashrc に目印付きのブロックとして追記する。再実行しても二重に増えない。
BASHRC="${HOME}/.bashrc"
MARKER="# >>> devcontainer aliases >>>"
if ! grep -qF "${MARKER}" "${BASHRC}" 2>/dev/null; then
  cat >> "${BASHRC}" <<'ALIASES'
# >>> devcontainer aliases >>>
alias l='ls --color=auto'
alias la='ls -la --color=auto'
# uv は ~/.local/bin に入る
export PATH="${HOME}/.local/bin:${PATH}"
# <<< devcontainer aliases <<<
ALIASES
fi

# --- uv のインストール ------------------------------------------------------
# 公式インストーラを使う。~/.local/bin に入る。
# PATH は上のブロックで通すため、インストーラによる rc ファイルの書き換えは止める。
export PATH="${HOME}/.local/bin:${PATH}"
if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | UV_NO_MODIFY_PATH=1 sh
fi
uv --version

# --- プロジェクト固有のセットアップ ----------------------------------------
# バックエンド(Flask): pyproject.toml があれば uv で依存を同期する
if [ -f backend/pyproject.toml ]; then
  (cd backend && uv sync)
fi

# フロントエンド(React): package.json があれば依存をインストールする
if [ -f frontend/package.json ]; then
  (cd frontend && npm install)
fi