import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deenrollCourse } from '../../helpers/courses'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deenrollCourse')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const courseId = event.pathParameters.courseId
    logger.info('deenrollCourse request', event)
    const userId = getUserId(event)
    logger.info('deenrollCourse userId', userId)

    await deenrollCourse(courseId, userId)
    logger.info('Finished deenrollCourse')

    return {
      statusCode: 200,
      body: ''
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
