import fs from 'fs';
import { config } from '../config/config';
import { convertCssStringIntoJsModule } from '@lsegurado/ls-convert-css-to-js-module';

export default {
    name: 'resolve-css-ls-element-plugin',
    setup(build) {
        build.onLoad({ filter: /\.css$/ }, args => {
            const text = fs.readFileSync(args.path, 'utf8');

            return {
                contents: convertCssStringIntoJsModule(text, config.importCssAsCSSStyleSheet)
            }
        })
    },
}