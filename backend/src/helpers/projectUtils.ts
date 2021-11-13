import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('projectUtils')
const XAWS = AWSXRay.captureAWS(AWS)

//fileStorage
export async function generateUploadUrl(courseId: string): Promise<string> {
    logger.info("generateUploadUrl")
    const s3 = new XAWS.S3({
        signatureVersion: 'v4'
    })
    logger.info("getting presignedUrl for ID" + courseId)
    const presignedUrl  = s3.getSignedUrl('putObject', {
      Bucket: process.env.PROJECTS_S3_BUCKET,
      Key: courseId,
      Expires: 5000
    })
    logger.info("retrieved presignedUrl", presignedUrl)
    return presignedUrl as string
  }
