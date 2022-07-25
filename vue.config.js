const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '/vue-uploader-solutions/' : '/',
  outputDir: 'docs',
  transpileDependencies: true,
  lintOnSave: false,
  productionSourceMap: false,
});
