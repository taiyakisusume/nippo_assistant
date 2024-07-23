import {defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react";
import {crx, defineManifest} from "@crxjs/vite-plugin";

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd());
    const matcher = new URL(env.VITE_CONTENT_URL).origin + "/*";

    const manifest = defineManifest({
        manifest_version: 3,
        name: "Nippo Assistant",
        description: "日報申請を少しだけ楽にするChrome拡張機能",
        version: "1.0.0",
        background: {
            service_worker: "src/background.ts",
            type: "module",
        },
        action: {
            default_title: "クリックでパネルを開く",
        },
        side_panel: {
            default_path: "src/static/index.html",
        },
        content_scripts: [
            {
                matches: [matcher],
                js: ["src/content.ts"],
            },
        ],
        permissions: ["sidePanel", "tabs", "storage"],
    });

    return {
        plugins: [react(), crx({manifest})],
        server: {
            port: 5173,
            strictPort: true,
            hmr: {
                port: 5173,
            },
        },
    };
});
