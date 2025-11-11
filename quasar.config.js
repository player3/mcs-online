const { configure } = require('quasar/wrappers');

module.exports = configure(function (ctx) {
  return {
    eslint: {
      warnings: true,
      errors: true
    },

    boot: [
      'axios',
    ],

    css: [
      'app.scss'
    ],

    extras: [
      'roboto-font',
      'material-icons',
    ],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node16'
      },

      vueRouterMode: 'hash',
      publicPath: './', // 使用相对路径访问静态文件，支持部署在非根路径
      vitePlugins: [],
      
      extendViteConf(viteConf) {
        // 设置 Vite base 为相对路径
        viteConf.base = './'
      }
    },

    devServer: {
      open: true,
      port: 9000,
      proxy: {
        '/api': {
          target: 'https://iccad2025.mymova.com',
          changeOrigin: true,
          secure: true,
          ws: true,
          // rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },

    framework: {
      config: {},

      plugins: [
        'Notify',
        'Dialog',
        'Loading'
      ]
    },

    animations: [],

    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: [
        'render'
      ]
    },

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
    },

    cordova: {},

    capacitor: {
      hideSplashscreen: true
    },

    electron: {
      inspectPort: 5858,

      bundler: 'packager',

      packager: {},

      builder: {
        appId: 'mcs-online'
      }
    },

    bex: {
      contentScripts: [
        'my-content-script'
      ],
    }
  }
});

