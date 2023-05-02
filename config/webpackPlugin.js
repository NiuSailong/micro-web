export const webpackPlugin = (config)=> {
  config.module.rule('mjs-rule').test(/.m?js/).resolve.set('fullySpecified', false);
  config.module
    .rule('otf')
    .test(/.otf$/)
    .use('file-loader')
    .loader('file-loader');
  config.plugin("replace").use(require("webpack").ContextReplacementPlugin).tap(()=>{
    return [/moment[/\\]locale$/,/zh-cn/]
  });
  config.merge({
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 10000,
        minChunks: 1,
        maxAsyncRequests: 10,
        maxInitialRequests: 5,
        automaticNameDelimiter: '.',
        cacheGroups: {
          vendor: {
            name: 'vendors',
            test({ resource }) {
              return /[\\/]node_modules[\\/]/.test(resource);
            },
            priority: 10,
          },
        },
      },
    },
  });
};
