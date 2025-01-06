<p align="center">
  <a href="https://plasmo.com">
    <img alt="plasmo logo banner" width="75%" src="https://www.plasmo.com/assets/banner-black-on-white.png" />
  </a>
</p>

<p align="center">
  <a aria-label="License" href="./LICENSE">
    <img alt="See License" src="https://img.shields.io/npm/l/@plasmohq/edge-addons-api"/>
  </a>
  <a aria-label="NPM" href="https://www.npmjs.com/package/@plasmohq/edge-addons-api">
    <img alt="NPM Install" src="https://img.shields.io/npm/v/@plasmohq/edge-addons-api?logo=npm"/>
  </a>
  <a aria-label="Twitter" href="https://www.twitter.com/plasmohq">
    <img alt="Follow PlasmoHQ on Twitter" src="https://img.shields.io/twitter/follow/plasmohq?logo=twitter"/>
  </a>
  <a aria-label="Twitch Stream" href="https://www.twitch.tv/plasmohq">
    <img alt="Watch our Live DEMO every Friday" src="https://img.shields.io/twitch/status/plasmohq?logo=twitch&logoColor=white"/>
  </a>
  <a aria-label="Discord" href="https://www.plasmo.com/s/d">
    <img alt="Join our Discord for support and chat about our projects" src="https://img.shields.io/discord/946290204443025438?logo=discord&logoColor=white"/>
  </a>
  <a aria-label="Build status" href="https://github.com/PlasmoHQ/bpp/actions">
    <img alt="typescript-action status" src="https://github.com/PlasmoHQ/bpp/workflows/build-test/badge.svg"/>
  </a>
</p>

# Microsoft Edge Addons API for NodeJS

A tiny but powerful module from [plasmo](https://www.plasmo.com/) to publish browser add-ons to the [Microsoft Edge Web Store](https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home).

This module uses [got](https://github.com/sindresorhus/got) to upload, check status, and submit an extension to the Microsoft Edge Webstore, using the [Microsoft Edge Add-ons API](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/api/using-addons-api).

Features include:

- TypeScript API
- ESM (if you need cjs, please file an issue)
- Pinned dependencies, updated via renovatebot

## Installation

```
npm install --save-dev @plasmohq/edge-addons-api
```

## Usage

### Authentication

You'll need to get a `productId`, `clientId`, and `apiKey` for your project.

You can get these for your project by following the [Microsoft Edge Add-Ons API guide](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/api/using-addons-api).

### Node.js API

```ts
import { EdgeAddonsAPI } from "@plasmohq/edge-addons-api"

const client = new EdgeAddonsAPI({
  productId,
  clientId,
  apiKey
})

await client.submit({
  filePath: "./dist/my-extension.zip",
  notes: "Developer notes"
})
```

## License

[MIT](./license) 🖖 [Plasmo](https://www.plasmo.com)
