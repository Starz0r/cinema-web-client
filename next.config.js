/** @type {import('next').NextConfig} */

process.env.NEXT_PUBLIC_APP_VERSION = require("child_process").execSync("npm pkg get version").toString().trim().replace(/\"/g, "",);
//process.env.NEXT_PUBLIC_APP_COMMIT_HASH = require("child_process").execSync("git rev-parse --short HEAD").toString().trim();
		
const nextConfig = {
	output: "export",
	typescript: {
		ignoreBuildErrors: true
	},
	webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
		return config;
	}
}

module.exports = nextConfig
