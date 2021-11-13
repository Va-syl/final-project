import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getCoursesForUser } from '../../helpers/courses'
import { getUserId } from '../utils';
import {createLogger} from '../../utils/logger'

const logger = createLogger('getCoursesForUser')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('getCoursesForUser request', event)
    const userId = getUserId(event)
    logger.info('getCoursesForUser userId', userId)

    const result = await getCoursesForUser(userId)
    logger.info('getCoursesForUser result', result)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: result
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
