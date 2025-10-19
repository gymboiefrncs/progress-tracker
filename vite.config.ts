import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  base: "./",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        js: "js/index.html",
        ts: "ts/index.html",
        nodejs: "nodejs/index.html",
        react: "react/index.html",
      },
    },
  },
});
