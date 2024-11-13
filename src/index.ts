import { ReadStream, createReadStream } from "fs"
import got, { type OptionsOfTextResponseBody } from "got"

export type Options = {
  productId: string

  clientId: string
  apiKey: string

  uploadOnly?: boolean
}

type OperationResponse = {
  id: string
  createdTime: string
  lastUpdatedTime: string
} & (
  | {
      status: "InProgress"
    }
  | {
      status: "Succeeded"
      message: string
    }
  | {
      status: "Failed"
      message?: string
      errorCode: string
      errors: Array<string>
    }
)

export const errorMap = {
  productId:
    "Product ID is required. To get one, go to: https://partner.microsoft.com/en-us/dashboard/microsoftedge/{product-id}/package/dashboard",
  clientId:
    "Client ID is required. To get one: https://partner.microsoft.com/en-us/dashboard/microsoftedge/publishapi",
  apiKey:
    "API Key is required. To get one: https://partner.microsoft.com/en-us/dashboard/microsoftedge/publishapi"
}

export const requiredFields = Object.keys(errorMap) as Array<
  keyof typeof errorMap
>

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const baseApiUrl = "https://api.addons.microsoftedge.microsoft.com"
export class EdgeAddonsAPI {
  options = {} as Options

  constructor(options: Options) {
    for (const field of requiredFields) {
      if (!options[field]) {
        throw new Error(errorMap[field])
      }
    }
    this.options = { ...options }
  }

  get productEndpoint() {
    return `${baseApiUrl}/v1/products/${this.options.productId}`
  }

  get publishEndpoint() {
    return `${this.productEndpoint}/submissions`
  }

  get uploadEndpoint() {
    return `${this.publishEndpoint}/draft/package`
  }

  /**
   * @returns the publish operation id
   */
  async submit({ filePath = "", notes = "" }) {

    const uploadResp = await this.upload(
      createReadStream(filePath)
    )

    await this.waitForUpload(uploadResp)

    if (this.options.uploadOnly) {
      return
    }

    return this.publish(notes)
  }

  async publish(notes = "") {

    const options = {
      headers: {
        Authorization: `ApiKey ${this.options.apiKey}`,
        "X-ClientID": this.options.clientId,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    } as OptionsOfTextResponseBody

    if (notes.length > 0) {
      options.body = `{ "notes"="${notes}" }`
    }

    const publishResp = await got.post(this.publishEndpoint, options)

    this.handleTempStatus(publishResp.statusCode, "Submit")

    return publishResp.headers.location
  }

  async upload(readStream = null as ReadStream) {

    const uploadResp = await got.post(this.uploadEndpoint, {
      body: readStream,
      headers: {
        Authorization: `ApiKey ${this.options.apiKey}`,
        "X-ClientID": this.options.clientId,
        "Content-Type": "application/zip"
      }
    })

    this.handleTempStatus(uploadResp.statusCode, "Upload")

    return uploadResp.headers.location
  }

  async getPublishStatus(operationId: string) {
    const statusEndpoint = `${this.publishEndpoint}/operations/${operationId}`

    return got
      .get(statusEndpoint, {
        headers: {
          Authorization: `ApiKey ${this.options.apiKey}`,
          "X-ClientID": this.options.clientId,
        }
      })
      .json<OperationResponse>()
  }

  async waitForUpload(
    operationId: string,
    retryCount = 5,
    pollTime = 3000
  ) {
    const statusEndpoint = `${this.uploadEndpoint}/operations/${operationId}`

    let successMessage: string
    let uploadStatus: OperationResponse["status"]

    let attempts = 0

    while (uploadStatus !== "Succeeded" && attempts < retryCount) {
      const statusResp = await got
        .get(statusEndpoint, {
          headers: {
            Authorization: `ApiKey ${this.options.apiKey}`,
            "X-ClientID": this.options.clientId,
          }
        })
        .json<OperationResponse>()

      if (statusResp.status === "Failed") {
        throw new Error(
          statusResp.message ||
            statusResp.errorCode + ":" + (statusResp.errors || []).join(",")
        )
      } else if (statusResp.status === "InProgress") {
        await wait(pollTime)
      } else if (statusResp.status === "Succeeded") {
        successMessage = statusResp.message
      }

      uploadStatus = statusResp.status
      attempts++
    }

    return successMessage
  }

  // https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/api/addons-api-reference#status-codes
  handleTempStatus = (statusCode: number, action: "Submit" | "Upload") => {
    if (statusCode !== 202) {
      if (statusCode >= 500) {
        throw new Error("Edge server error, please try again later")
      } else {
        throw new Error(`${action} failed, double check your api credentials`)
      }
    }
  }
}
