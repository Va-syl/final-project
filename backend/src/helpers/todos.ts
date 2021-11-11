import { TodosAccess } from './todosAcess'
import { generateUploadUrl } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

//businessLogic

const todoAccess = new TodosAccess()
const logger = createLogger('Todos')

export async function getTodosForUser(  userId: string): Promise<TodoItem[]> {
    logger.info("getTodosForUser", userId)
    return todoAccess.getTodosForUser(userId)
  }

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info("createTodo",createTodoRequest)
  const itemId = uuid.v4()
  const bucketName = process.env.ATTACHMENT_S3_BUCKET

  return await todoAccess.createTodo({
    userId: userId,
    todoId: itemId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
  })
}

export function deleteTodo(todoId: string, userId: string): Promise<string> {
    logger.info("deleteTodo", todoId)
    return todoAccess.deleteTodo(userId, todoId)
  }

export function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    todoId: string,
    userId: string
  ): Promise<TodoUpdate> {
    logger.info("updateTodo", updateTodoRequest)
    return todoAccess.updateTodo(updateTodoRequest, userId, todoId)
  }

export function createAttachmentPresignedUrl(
    todoId: string
): Promise<string> {
    logger.info("generateUploadUrl", todoId)
    return generateUploadUrl(todoId)
} 