import { expect, test } from "@jest/globals"

import { EdgeWebstoreClient } from "~index"

import key from "../key.json"

test("test upload test.zip artifact", async () => {
  const client = new EdgeWebstoreClient(key)
  const resp = await client.submit({
    filePath: "test.zip",
    notes: "Test upload test.zip artifact"
  })

  const publishStatus = await client.getPublishStatus(resp)

  expect(publishStatus.id).toBe(resp)
})
