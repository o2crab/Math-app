import { useState } from "react";

// 結果を「2^3 × 3^2 × 5」の形に整形する
function formatFactors(factors) {
  return factors
    .map(({ prime, exponent }) => (exponent > 1 ? `${prime}^${exponent}` : `${prime}`))
    .join(" × ");
}

export default function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/factorize?n=${encodeURIComponent(input)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
      } else {
        setResult(data);
      }
    } catch {
      setError("サーバーに接続できませんでした");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "4rem auto", fontFamily: "sans-serif" }}>
      <h1>素因数分解</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例: 360"
          aria-label="素因数分解する数"
        />
        <button type="submit" disabled={loading || input.trim() === ""}>
          {loading ? "計算中…" : "分解する"}
        </button>
      </form>

      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
      {result && (
        <p>
          {result.n} = <strong>{formatFactors(result.factors)}</strong>
        </p>
      )}
    </main>
  );
}
