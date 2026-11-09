import webpack from 'webpack';

export default function runWebpack(config: webpack.Configuration[], statsInfo: webpack.Configuration['stats']) {
    return new Promise<void>((resolve, reject) => {
        webpack(config).run((err, stats) => {
            if (err) {
                reject(err);
                return;
            }

            console.info(stats!.toString(statsInfo));
            if (stats!.hasErrors()) {
                reject(new Error('Webpack compilation errors'));
                return;
            }

            resolve();
        });
    });
}
