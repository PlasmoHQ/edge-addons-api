import { expect, test } from "@jest/globals"
import { readFile } from "fs/promises"

import { EdgeAddonsAPI, type Options } from "~index"

test("test upload test.zip artifact", async () => {
  const key = JSON.parse(await readFile("key.json", "utf8")) as Options

  const client = new EdgeAddonsAPI(key)
  const operationId = await client.submit({
    filePath: "test.zip",
    notes: "Test upload test.zip artifact"
  })

  const publishStatus = await client.getPublishStatus(operationId)

  expect(publishStatus.id).toBe(operationId)
  expect(publishStatus.status).toBe("Succeeded")
})
