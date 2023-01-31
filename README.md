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

## Server configuration
To configure the server you just need to create a file called michi.config.ts at the root of your project. This file would look like this:

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
      <td></td>
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

## License
 - [MIT](https://github.com/michijs/dev-server/blob/master/LICENSE.md)

[repo-size]: https://img.shields.io/github/repo-size/michijs/dev-server
[npm-downloads]: https://img.shields.io/npm/dt/@michijs/dev-server
[version]: https://img.shields.io/npm/v/@michijs/dev-server
[github-license]: https://img.shields.io/github/license/michijs/dev-server
[github-license-url]: https://github.com/michijs/dev-server/blob/master/LICENSE.md
