# Michi Dev Server
Development server built with ESBuild.

![npm][version] [![license][github-license]][github-license-url] ![npm][npm-downloads] ![npm][repo-size]
  [![CodeQL](https://github.com/michijs/dev-server/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/michijs/dev-server/actions/workflows/codeql-analysis.yml)
  [![Tests](https://github.com/michijs/dev-server/actions/workflows/tests.yml/badge.svg)](https://github.com/michijs/dev-server/actions/workflows/tests.yml)

## Main features
- Configure esbuild options with Typescript
- First-class PWA support
- Custom environments
- Packages distribution

## Getting started

You can use the following [test project](https://github.com/michijs/michijs-template) or setup a project from scratch:

    npm install -D @michijs/dev-server


To configure the server you just need to create an optional file called michi.config.ts at the root of your project. This file would look like this:

```ts
import { ServerConfig, ServerConfigFactory, DefaultEnvironment } from '@michijs/server';

export const config: ServerConfigFactory = (environment) => {
  const defaultConfig: ServerConfig = {
    // Your custom configuration
  }
  return defaultConfig;
};

export default config;
```

<table>
  <thead>
    <tr>
      <th colspan="3">ServerConfig</th>
      <th>Default value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>env</td>
      <td colspan="2">Allows to add environment variables</td>
      <td></td>
    </tr>
    <tr>
      <td>esbuildOptions</td>
      <td colspan="2">All the options available at <a href="https://esbuild.github.io/plugins/#build-options">esbuild documentation</a></td>
      <td>Can be chequed <a href="#esbuild-default-options">here</a></td>
    </tr>
    <tr>
      <td>openBrowser</td>
      <td colspan="2">If the browser should open at localhost url when server starts</td>
      <td>true</td>
    </tr>
    <tr>
      <td>port</td>
      <td colspan="2">Port to run dev server on</td>
      <td>3000</td>
    </tr>
    <tr>
      <td rowspan="5">public</td>
      <td rowspan="5">Public folder - will be copied at server start</td>
      <tr>
        <td>path</td>
        <td>public</td>
      </tr>
      <tr>
        <td>indexName</td>
        <td>index.html</td>
      </tr>
      <tr>
        <td>minifyIndex</td>
        <td>true if environment is PRODUCTION</td>
      </tr>
      <tr>
        <td>serviceWorkerName</td>
        <td></td>
      </tr>
    </tr>
  </tbody>
</table>

## ESBuild default options

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Default value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>outdir</td>
      <td>"build"</td>
    </tr>
    <tr>
      <td>tsconfig</td>
      <td>"tsconfig.json"</td>
    </tr>
    <tr>
      <td>minifySyntax</td>
      <td>"true" if environment is PRODUCTION</td>
    </tr>
    <tr>
      <td>minifyWhitespace</td>
      <td>"true" if environment is PRODUCTION</td>
    </tr>
    <tr>
      <td>sourcemap</td>
      <td>"true" if environment is <b>NOT</b> PRODUCTION</td>
    </tr>
    <tr>
      <td>bundle</td>
      <td>"true"</td>
    </tr>
    <tr>
      <td>keepNames</td>
      <td>"true" if environment is PRODUCTION</td>
    </tr>
    <tr>
      <td>entryPoints</td>
      <td>['src/index.ts']</td>
    </tr>
    <tr>
      <td>format</td>
      <td>"esm"</td>
    </tr>
    <tr>
      <td>target</td>
      <td>"esnext"</td>
    </tr>
  </tbody>
</table>

## Distribution
At the moment ESBuild does not support .d.ts files so we still use the Typescript compiler with the tsconfig provided by esbuildOptions field.

## License
 - [MIT](https://github.com/michijs/dev-server/blob/master/LICENSE.md)

[repo-size]: https://img.shields.io/github/repo-size/michijs/dev-server
[npm-downloads]: https://img.shields.io/npm/dt/@michijs/dev-server
[version]: https://img.shields.io/npm/v/@michijs/dev-server
[github-license]: https://img.shields.io/github/license/michijs/dev-server
[github-license-url]: https://github.com/michijs/dev-server/blob/master/LICENSE.md
