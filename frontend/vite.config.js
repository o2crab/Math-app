import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // /api へのリクエストを Flask(同じコンテナ内の 5000 番)に中継する
    // ブラウザからは同一オリジンに見えるので CORS の設定が不要になる
    proxy: {
      "/api": "http://localhost:5000",
    },
    strictPort: true
  },
});
