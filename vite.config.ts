import {defineConfig} from 'vitest/config';
import solidPlugin from 'vite-plugin-solid';
import handlebars from 'vite-plugin-handlebars';
import basicSsl from '@vitejs/plugin-basic-ssl';
import {visualizer} from 'rollup-plugin-visualizer';
import checker from 'vite-plugin-checker';
// import devtools from 'solid-devtools/vite'
import autoprefixer from 'autoprefixer';
import {resolve} from 'path';
import {existsSync} from 'fs';
import {ServerOptions} from 'vite';

const rootDir = resolve(__dirname);

const handlebarsPlugin = handlebars({
  context: {
    title: 'Telegram Web',
    description: 'Telegram is a cloud-based mobile and desktop messaging app with a focus on security and speed.',
    url: 'https://yomi-web.github.io/',
    origin: 'https://yomi-web.github.io/'
  }
});

const serverOptions: ServerOptions = {
  // host: '192.168.95.17',
  port: 8080,
  sourcemapIgnoreList(sourcePath, sourcemapPath) {
    return sourcePath.includes('node_modules') || sourcePath.includes('logger');
  }
};

const USE_SSL = false;
const NO_MINIFY = false;
const HAS_SOLID = existsSync(resolve(rootDir, 'src/vendor/solid'));
const SSL_CONFIG: any = undefined && USE_SSL && {
  name: '192.168.95.17',
  certDir: './certs/'
};

const ADDITIONAL_ALIASES = {
  'solid-transition-group': resolve(rootDir, 'src/vendor/solid-transition-group')
};

console.log('has built solid', HAS_SOLID);

export default defineConfig({
  plugins: [
    // devtools({
    //   /* features options - all disabled by default */
    //   autoname: true // e.g. enable autoname
    // }),
    process.env.VITEST ? undefined : checker({
      typescript: true,
      eslint: {
        // for example, lint .ts and .tsx
        lintCommand: 'eslint "./src/**/*.{ts,tsx}" --ignore-pattern "/src/solid/*"'
      }
    }),
    solidPlugin(),
    handlebarsPlugin as any,
    USE_SSL ? (basicSsl as any)(SSL_CONFIG) : undefined,
    visualizer({
      gzipSize: true,
      template: 'treemap'
    })
  ].filter(Boolean),
  test: {
    // include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/solid/**'
    ],
    // coverage: {
    //   provider: 'v8',
    //   reporter: ['text', 'lcov'],
    //   include: ['src/**/*.ts', 'store/src/**/*.ts', 'web/src/**/*.ts'],
    //   exclude: ['**/*.d.ts', 'src/server/*.ts', 'store/src/**/server.ts']
    // },
    environment: 'jsdom',
    testTransformMode: {web: ['.[jt]sx?$']},
    // otherwise, solid would be loaded twice:
    // deps: {registerNodeLoader: true},
    // if you have few tests, try commenting one
    // or both out to improve performance:
    threads: false,
    isolate: false,
    globals: true,
    setupFiles: ['./src/tests/setup.ts']
  },
  server: serverOptions,
  base: '',
  build: {
    target: 'es2020',
    sourcemap: true,
    assetsDir: '',
    copyPublicDir: false,
    emptyOutDir: true,
    minify: NO_MINIFY ? false : undefined,
    rollupOptions: {
      output: {
        sourcemapIgnoreList: serverOptions.sourcemapIgnoreList
      }
      // input: {
      //   main: './index.html',
      //   sw: './src/index.service.ts'
      // }
    }
    // cssCodeSplit: true
  },
  worker: {
    format: 'es'
  },
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [
        autoprefixer({}) // add options if needed
      ]
    }
  },
  resolve: {
    // conditions: ['development', 'browser'],
    alias: HAS_SOLID ? {
      'rxcore': resolve(rootDir, 'src/vendor/solid/web/core'),
      'solid-js/jsx-runtime': resolve(rootDir, 'src/vendor/solid/jsx'),
      'solid-js/web': resolve(rootDir, 'src/vendor/solid/web'),
      'solid-js/store': resolve(rootDir, 'src/vendor/solid/store'),
      'solid-js': resolve(rootDir, 'src/vendor/solid'),
      ...ADDITIONAL_ALIASES
    } : ADDITIONAL_ALIASES
  }
});
