# Microsoft Edge Webstore Upload

A tiny but powerful module to publish browser extensions to the Microsoft Edge Web Store.


This module uses [got](https://github.com/sindresorhus/got) to upload, check status, and submit an extension to the Microsoft Edge Webstore, using the [Microsoft Edge Add-ons API](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/api/using-addons-api).

Features include:

- TypeScript API
- ESM (if you need cjs, please file an issue)
- Frozen dependencies, updated via renovatebot

## Installation

```
npm install --save-dev @plasmo-corp/ewu
```

## Usage

### Authentication
You'll need to get a `productId`, `clientId`, `clientSecret`, and `accessTokenUrl` for your project.

 You can get these for your project by following the  [Microsoft Edge Add-Ons API guide](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/api/using-addons-api).

### Node.js API

```ts
import { EdgeWebstoreClient } from "@plasmo-corp/ewu"

const client = new EdgeWebstoreClient({
  productId,
  clientId,
  clientSecret,
  accessTokenUrl
})

await client.submit({
  filePath: "./dist/my-extension.zip",
  notes: "Developer notes"
})
```

## License

[MIT](./license) ⭐ 


## Acknowledgments
[Made by Plasmo](https://plasmo.com)
