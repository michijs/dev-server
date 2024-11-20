# Michijs Dev Server
Development server built on top of esbuild.
<!-- TODO: To generate feature-image require to install roboto -->

![npm][version] [![license][github-license]][github-license-url] ![npm][npm-downloads] ![npm][repo-size]
  [![Tests](https://github.com/michijs/dev-server/actions/workflows/tests.yml/badge.svg)](https://github.com/michijs/dev-server/actions/workflows/tests.yml)

## Main features
- Configure esbuild options with Typescript
- First-class PWA support
- Custom environments
- Packages distribution

## Getting started

You can use the following [test project](https://github.com/michijs/michijs-template) or setup a project from scratch:

    npm install -D @michijs/dev-server

## CLI commands
You have the following CLI commands:
<table>
  <thead>
    <tr>
      <th>CLI command</th>
      <th>Default environment</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>start</td>
      <td>DEVELOPMENT</td>
      <td>Allows to start a dev server as a webpage.</td>
    </tr>
    <tr>
      <td>build</td>
      <td>PRODUCTION</td>
      <td>Allows to build the src code as a webpage.</td>
    </tr>
    <tr>
      <td>dist</td>
      <td>DISTRIBUTION</td>
      <td>Allows to distribute the src code as a package. At the moment ESBuild does not support .d.ts files so we still use the Typescript compiler with the tsconfig provided by esbuildOptions field.</td>
    </tr>
    <tr>
      <td>generate-icons</td>
      <td>-</td>
      <td>Allows to generate a full set of icons from a src icon.</td>
    </tr>
  </tbody>
</table>


## Configure the server
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
      <th colspan="4">ServerConfig</th>
      <th>Default value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>env</td>
      <td colspan="3">Allows to add environment variables</td>
      <td></td>
    </tr>
    <tr>
      <td>esbuildOptions</td>
      <td colspan="3">All the options available at <a href="https://esbuild.github.io/plugins/#build-options">esbuild documentation</a></td>
      <td>Can be chequed <a href="#esbuild-default-options">here</a></td>
    </tr>
    <tr>
      <td>openBrowser</td>
      <td colspan="3">If the browser should open at localhost url when server starts</td>
      <td>"true"</td>
    </tr>
    <tr>
      <td>watch</td>
      <td colspan="3">If the server should watch for changes on the folders</td>
      <td>"true"</td>
    </tr>
    <tr>
      <td>port</td>
      <td colspan="3">Port to run dev server on</td>
      <td>"3000"</td>
    </tr>
    <tr>
      <td rowspan="14">public</td>
      <td rowspan="14">Public folder - will be copied at server start</td>
      <tr>
        <td rowspan="4">assets</td>
        <tr>
          <td>path</td>
          <td>"assets"</td>
        </tr>
        <tr>
          <td>screenshots</td>
          <td></td>
        </tr>
        <tr>
          <td>featureImage</td>
          <td></td>
        </tr>
      </tr>
      <tr>
        <td colspan="2">indexName</td>
        <td>"index.html"</td>
      </tr>
      <tr>
        <td colspan="2">minify</td>
        <td>"true" if environment is PRODUCTION</td>
      </tr>
      <tr>
        <td colspan="2">path</td>
        <td>"public"</td>
      </tr>
      <tr>
        <td rowspan="3">manifest <br/><small>(A JSON document that contains startup parameters and application defaults for when a web application is launched.)</small></td>
        <tr>
          <td>name</td>
          <td>"manifest.json"</td>
        </tr>
        <tr>
          <td>options</td>
          <td></td>
        </tr>
      </tr>
      <tr>
        <td rowspan="3">wellKnown <br/><small>(A URI with the path component /.well-known/assetlinks.json is used by the AssetLinks protocol to identify one or more digital assets (such as web sites or mobile apps) that are related to the hosting web site in some fashion.)</small></td>
        <tr>
          <td>relation</td>
          <td></td>
        </tr>
        <tr>
          <td>target</td>
          <td></td>
        </tr>
      </tr>
    </tr>
  </tbody>
</table>

## Esbuild default options

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Default value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>bundle</td>
      <td>"true"</td>
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
      <td>keepNames</td>
      <td>"true" if environment is PRODUCTION</td>
    </tr>
    <tr>
      <td>logLevel</td>
      <td>"error"</td>
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
      <td>outdir</td>
      <td>"build"</td>
    </tr>
    <tr>
      <td>sourcemap</td>
      <td>"true" if environment is <b>NOT</b> PRODUCTION</td>
    </tr>
    <tr>
      <td>splitting</td>
      <td>"true"</td>
    </tr>
    <tr>
      <td>target</td>
      <td>"esnext"</td>
    </tr>
    <tr>
      <td>tsconfig</td>
      <td>"tsconfig.json"</td>
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
