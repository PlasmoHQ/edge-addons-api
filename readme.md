# Microsoft Edge Webstore Upload

This module uses [got](https://github.com/sindresorhus/got) to upload, check status, and submit an extension to the Microsoft Edge Webstore, using the [Microsoft Edge Add-ons API](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/api/using-addons-api).

Feature includes:

- TypeScript API
- ESM (if you need cjs, file an issue)
- Frozen dependencies, updated via renovatebot

## Usage

### nodejs API

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

# License

[MIT](./license) ⭐ [Plasmo Corp.](https://plasmo.com)
