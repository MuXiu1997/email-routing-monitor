import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  outExtensions: () => {
    return { js: '.mjs' }
  },
  format: ['esm'],
  target: 'esnext',
  platform: 'browser',
  clean: true,
  minify: true,
  dts: false,
  noExternal: [/.*/],
  external: [/node:.*/],
  env: {
    'import.meta.env.PROD': true,
  },
  outputOptions: {
    inlineDynamicImports: true,
  },
})
