import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const projectRoot = dirname(fileURLToPath(import.meta.url))

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: projectRoot,
  images: {
    formats: ['image/avif'],
    qualities: [65, 75],
  },
  turbopack: {
    root: projectRoot
  }
}

export default nextConfig
