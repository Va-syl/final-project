import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
//datalayer
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly index = process.env.TODOS_CREATED_AT_INDEX,
    ) {
  }

  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('getTodosForUser ' + userId)
    logger.info('todoTable name ' + this.todoTable)
    logger.info('index name ' + this.index)

    const result = await this.docClient.query({
        TableName: this.todoTable,
        IndexName: this.index,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
          }
        }).promise()

    logger.info('getTodosForUser result', result)
    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating todo item ', todo)

    const result = await this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise()
    logger.info('createTodo result', result)
    return todo
  }

  async updateTodo(todo: TodoUpdate, userId: string, todoId: string): Promise<TodoUpdate> {
    logger.info('Updating todo item ' + todoId + " for user " + userId, todo)

    const updateParams = {
        TableName: this.todoTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        ExpressionAttributeNames: {
          '#name': 'name',
          '#dueDate': 'dueDate',
          '#done': 'done'
        },
        ExpressionAttributeValues: {
          ':name': todo.name,
          ':dueDate': todo.dueDate,
          ':done': todo.done,
        },
        UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
        ReturnValues: 'ALL_NEW',
      };

    const result = await this.docClient.update(updateParams).promise()
    logger.info('Updated todo item ' + todoId + " for user " + userId, result)
    return result.Attributes as TodoUpdate;
  }

  async deleteTodo(userId: string, todoId: string): Promise<string> {
    logger.info('Deleting todo item ' + todoId + " for user " + userId)

    const result = await this.docClient.delete({
        TableName: this.todoTable,
        Key: {
          userId,
          todoId
        }
      }).promise()
      logger.info('Deleted todo item ' + todoId + " for user " + userId, result)

    return '' 
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
