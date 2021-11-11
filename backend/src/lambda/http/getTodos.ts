import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';
import {createLogger} from '../../utils/logger'

const logger = createLogger('getTodos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('getTodos request', event)
    const userId = getUserId(event)
    logger.info('getTodos userId', userId)

    const result = await getTodosForUser(userId)
    logger.info('getTodos result', result)

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
