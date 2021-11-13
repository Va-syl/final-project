import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { EnrollCourseRequest } from '../../requests/EnrollCourseRequest'
import { getUserId } from '../utils';
import { enrollCourse } from '../../helpers/courses'
import { createLogger } from '../../utils/logger'

const logger = createLogger('enrollCourse')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('enrollCourse request', event)
    const newCourse: EnrollCourseRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    logger.info('enrollCourse userId', userId)

    const newItem = await enrollCourse(newCourse, userId)
    logger.info('enrollCourse result', newItem)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newCourse
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
