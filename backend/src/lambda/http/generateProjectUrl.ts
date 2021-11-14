import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import {createLogger} from '../../utils/logger'
import { createProjectPresignedUrl } from '../../helpers/courses'
import { getUserId } from '../utils';

const logger = createLogger('generateProjectUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const courseId = event.pathParameters.courseId
    const userId = getUserId(event)
    logger.info('generateProjectUrl request', event)
    const uploadUrl = await createProjectPresignedUrl(courseId, userId)
    logger.info('generateProjectUrl uploadUrl ' + uploadUrl)
    const response = JSON.stringify({
        uploadUrl
      })
    logger.info("url response " + response);

    return {
      statusCode: 200,
      body: response
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
