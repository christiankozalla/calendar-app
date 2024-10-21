import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
	server: {
		open: [
			"http://localhost:3000", // Caddy reverse proxy dev server
			// "http://localhost:8090/_" // PocketBase Admin Panel
		],
		port: 5173,
	},
	output: {
		cleanDistPath: true,
		distPath: {
			root: "../dist/pb_public",
		},
	},
	plugins: [pluginReact()],
	html: {
		title: "Suntimes",
		meta: {
			charset: {
				charset: "UTF-8",
			},
			viewport: "width=device-width, initial-scale=1.0, maximum-scale=1",
		},
	},
});
