import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getCatalog } from '../../helpers/courses'
import { getUserId } from '../utils';
import {createLogger} from '../../utils/logger'

const logger = createLogger('getCatalog')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('getCatalog request', event)
    const userId = getUserId(event)
    logger.info('getCatalog userId', userId)

    const result = await getCatalog()
    logger.info('getCatalog result ' + result)

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
