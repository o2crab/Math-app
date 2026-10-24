# backend/app.py
import os
from flask import Flask, jsonify, send_from_directory, request

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

# 試し割りで十分高速に終わる範囲に制限する(sqrt(10^12) = 10^6 回程度)
MAX_N = 10**12


def factorize(n: int) -> list[tuple[int, int]]:
    """n を素因数分解し、(素数, 指数) のリストを返す。"""
    factors = []
    p = 2
    while p * p <= n:
        exponent = 0
        while n % p == 0:
            n //= p
            exponent += 1
        if exponent:
            factors.append((p, exponent))
        p += 1 if p == 2 else 2
    if n > 1:
        factors.append((n, 1))
    return factors


app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="")


@app.route("/api/health")
def health():
    return jsonify(status="ok")


@app.get("/api/factorize")
def api_factorize():
    raw = request.args.get("n", "").strip()
    try:
        n = int(raw)
    except ValueError:
        return jsonify(error="整数を入力してください"), 400
    if n < 2 or n > MAX_N:
        return jsonify(error=f"2 以上 {MAX_N} 以下の整数を入力してください"), 400

    factors = [{"prime": p, "exponent": e} for p, e in factorize(n)]
    return jsonify(n=n, factors=factors)

# React のルーティング(SPA)用:API 以外は index.html を返す


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def spa(path):
    file_path = os.path.join(STATIC_DIR, path)
    if path and os.path.isfile(file_path):
        return send_from_directory(STATIC_DIR, path)
    return send_from_directory(STATIC_DIR, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
