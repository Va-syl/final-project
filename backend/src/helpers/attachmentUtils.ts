import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('attachmentUtils')
const XAWS = AWSXRay.captureAWS(AWS)

//fileStogare
export async function generateUploadUrl(todoId: string): Promise<string> {
    logger.info("generateUploadUrl")
    const s3 = new XAWS.S3({
        signatureVersion: 'v4'
    })
    logger.info("getting presignedUrl")
    const presignedUrl  = s3.getSignedUrl('putObject', {
      Bucket: process.env.ATTACHMENT_S3_BUCKET,
      Key: todoId,
      Expires: 5000
    })
    logger.info("retrieved presignedUrl", presignedUrl)
    return presignedUrl as string
  }
