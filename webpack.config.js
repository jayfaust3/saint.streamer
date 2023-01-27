const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

function getMode(){
    return process.env.STAGE === 'offline' ? 'development' : 'production'
}

const loaders = [
    {
        loader: 'ts-loader',
        options: {
            transpileOnly: true
        }
    }
]

module.exports = {
    entry: slsw.lib.entries,
    target: 'node',
    mode: getMode(),
    /*
     * The following packages are marked as externals because:
     * aws-sdk and newrelic are already provided by the lambda and its layers
    */
    output: {
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '.webpack'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                // Add instrumentation for test coverage on development builds
                use: getMode() === 'development' ? loaders : loaders.slice(1, 2)
            }
        ]
    },
    ...(getMode() === 'development'
        ? {
              plugins: [new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false })]
          }
        : {})
};
