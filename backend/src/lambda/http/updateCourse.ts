import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateCourse } from '../../helpers/courses'
import { UpdateCourseRequest } from '../../requests/UpdateCourseRequest'
import { getUserId } from '../utils'
import {createLogger} from '../../utils/logger'


const logger = createLogger('updateCourse')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const courseId = event.pathParameters.courseId
    const updatedCourse: UpdateCourseRequest = JSON.parse(event.body)
    logger.info('updateCourse request', event)
    const userId = getUserId(event)
    logger.info('updateCourse userId', userId)

    await updateCourse(updatedCourse, courseId, userId)
    logger.info('Finished updateCourse')

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
