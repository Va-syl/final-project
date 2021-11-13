import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import {createLogger} from '../../utils/logger'
import { createProjectPresignedUrl } from '../../helpers/courses'

const logger = createLogger('generateProjectUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const courseId = event.pathParameters.courseId
    logger.info('generateProjectUrl request', event)
    const uploadUrl = await createProjectPresignedUrl(courseId)
    logger.info('generateProjectUrl uploadUrl', uploadUrl)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
