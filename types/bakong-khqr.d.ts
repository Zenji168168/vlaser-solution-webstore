declare module 'bakong-khqr' {
  export const khqrData: {
    currency: {
      khr: 116
      usd: 840
    }
  }

  export class IndividualInfo {
    constructor(
      bakongAccountID: string,
      merchantName: string,
      merchantCity: string,
      optional?: Record<string, unknown>
    )
  }

  export class BakongKHQR {
    generateIndividual(info: IndividualInfo): {
      status: {
        code: number
        errorCode: number | null
        message: string | null
      }
      data: {
        qr: string
        md5: string
      } | null
    }

    static verify(qr: string): {
      isValid: boolean
    }
  }
}
