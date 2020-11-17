import cssesc from 'cssesc';
import { loader } from 'webpack';
import { interpolateName } from 'loader-utils';

// eslint-disable-next-line no-control-regex
const filenameReservedRegex = /[<>:"/\\|?*\x00-\x1F]/g;
// eslint-disable-next-line no-control-regex
const reControlChars = /[\u0000-\u001f\u0080-\u009f]/g;
const reRelativePath = /^\.+/;

// eslint-disable-next-line import/prefer-default-export
export function getLocalIdent(
    loaderContext: loader.LoaderContext,
    localIdentName: string,
    localName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: any,
) {
    // eslint-disable-next-line no-param-reassign
    options.content = unescape(localName);

    // Using `[path]` placeholder outputs `/` we need escape their
    // Also directories can contains invalid characters for css we need escape their too
    return cssesc(
        interpolateName(loaderContext, localIdentName, options)
            // For `[hash]` placeholder
            .replace(/^((-?[0-9])|--)/, '_$1')
            .replace(filenameReservedRegex, '-')
            .replace(reControlChars, '-')
            .replace(reRelativePath, '-')
            .replace(/\./g, '-'),
        { isIdentifier: true },
    ).replace(/\\\[local\\]/gi, localName);
}
