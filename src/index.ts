import { createReadStream, ReadStream } from "fs"
import got, { OptionsOfTextResponseBody } from "got"

export type Options = {
  productId: string

  clientId: string
  clientSecret: string

  accessTokenUrl: string
}

type AuthTokenResponse = {
  access_token: string
  expires_in: number
  token_type: string
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
  clientSecret:
    "Client Secret is required. To get one: https://partner.microsoft.com/en-us/dashboard/microsoftedge/publishapi",
  accessTokenUrl:
    "Access token URL is required. To get one: https://partner.microsoft.com/en-us/dashboard/microsoftedge/publishapi"
}

export const requiredFields = Object.keys(errorMap) as Array<
  keyof typeof errorMap
>

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const baseApiUrl = "https://api.addons.microsoftedge.microsoft.com/"
export class EdgeWebstoreClient {
  options = {} as Options

  constructor(options: Options) {
    for (const field of requiredFields) {
      if (!options[field]) {
        throw new Error(errorMap[field])
      }

      this.options[field] = options[field]
    }
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
    const accessToken = await this.getAccessToken()

    const uploadResp = await this.upload(
      createReadStream(filePath),
      accessToken
    )

    await this.waitForUpload(uploadResp, accessToken)

    return this.publish(notes, accessToken)
  }

  async publish(notes = "", _accessToken = null as string) {
    const accessToken = _accessToken || (await this.getAccessToken())

    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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

  async upload(readStream = null as ReadStream, _accessToken = null as string) {
    const accessToken = _accessToken || (await this.getAccessToken())

    const uploadResp = await got.post(this.uploadEndpoint, {
      body: readStream,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/zip"
      }
    })

    this.handleTempStatus(uploadResp.statusCode, "Upload")

    return uploadResp.headers.location
  }

  async getPublishStatus(operationId: string, _accessToken = null as string) {
    const accessToken = _accessToken || (await this.getAccessToken())
    const statusEndpoint = `${this.publishEndpoint}/operations/${operationId}`

    return got
      .get(statusEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .json<OperationResponse>()
  }

  async waitForUpload(
    operationId: string,
    _accessToken = null as string,
    retryCount = 5,
    pollTime = 3000
  ) {
    const accessToken = _accessToken || (await this.getAccessToken())
    const statusEndpoint = `${this.uploadEndpoint}/operations/${operationId}`

    let successMessage: string
    let uploadStatus: OperationResponse["status"]

    let attempts = 0

    while (uploadStatus !== "Succeeded" && attempts < retryCount) {
      const statusResp = await got
        .get(statusEndpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`
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

  getAccessToken = async () => {
    const data = await got
      .post(`${this.options.accessTokenUrl}`, {
        body: `client_id=${this.options.clientId}&scope=${baseApiUrl}.default&client_secret=${this.options.clientSecret}&grant_type=client_credentials`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      .json<AuthTokenResponse>()

    return data.access_token
  }
}
