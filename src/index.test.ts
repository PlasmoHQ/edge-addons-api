import { expect, test } from "@jest/globals"
import { execFileSync } from "child_process"
import { join } from "path"
import { cwd, execPath } from "process"

import { life } from "~index"

const indexScript = join(cwd(), "dist", "index.js")

test("life is good", async () => {
  expect(life).toBe(42)
})

test("snapshot corrects", async () => {
  const output = execFileSync(execPath, [indexScript]).toString("utf-8")
  expect(output).toMatchSnapshot()
})
