import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { Course } from '../models/Course'
import { CourseUpdate } from '../models/CourseUpdate';
//datalayer
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('CourseAccess')

export class CourseAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly coursesTable = process.env.COURSES_TABLE,
    private readonly index = process.env.COURSES_CREATED_AT_INDEX,
    ) {
  }

  async getCoursesForUser(userId: string): Promise<Course[]> {
    logger.info('getCoursesForUser ' + userId)
    logger.info('coursesTable name ' + this.coursesTable)
    logger.info('index name ' + this.index)

    const result = await this.docClient.query({
        TableName: this.coursesTable,
        IndexName: this.index,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
          }
        }).promise()

    logger.info('getCoursesForUser result', result)
    const items = result.Items
    return items as Course[]
  }

  async enrollCourse(course: Course): Promise<Course> {
    logger.info('Enrolling in course ', course)

    const result = await this.docClient.put({
      TableName: this.coursesTable,
      Item: course
    }).promise()
    logger.info('enrollCourse result', result)
    return course
  }

  async updateCourse(course: CourseUpdate, userId: string, courseId: string): Promise<CourseUpdate> {
    logger.info('Updating course ' + courseId + " for user " + userId, course)

    const updateParams = {
        TableName: this.coursesTable,
        Key: {
          userId: userId,
          courseId: courseId
        },
        ExpressionAttributeNames: {
          '#courseName': 'courseName',
          '#courseNumber': 'courseNumber',
          '#completed': 'completed'
        },
        ExpressionAttributeValues: {
          ':courseName': course.courseName,
          ':courseNumber': course.courseNumber,
          ':completed': course.completed,
        },
        UpdateExpression: 'set #courseName = :courseName, #courseNumber = :courseNumber, #completed = :completed',
        ReturnValues: 'ALL_NEW',
      };

    const result = await this.docClient.update(updateParams).promise()
    logger.info('Updated course item ' + courseId + " for user " + userId, result)
    return result.Attributes as CourseUpdate;
  }

  async updateCourseProjectUpload(userId: string, courseId: string): Promise<string> {
    logger.info('Updating course project upload ' + courseId + " for user " + userId)

    const updateParams = {
        TableName: this.coursesTable,
        Key: {
          userId: userId,
          courseId: courseId
        },
        ExpressionAttributeNames: {
          '#projectUploaded': 'projectUploaded'
        },
        ExpressionAttributeValues: {
          ':projectUploaded': true
        },
        UpdateExpression: 'set #projectUploaded = :projectUploaded',
        ReturnValues: 'ALL_NEW',
      };

    const result = await this.docClient.update(updateParams).promise()
    logger.info('Updated course project upload ' + courseId + " for user " + userId, result)
    return "";
  }

  async deenrollCourse(userId: string, courseId: string): Promise<string> {
    logger.info('Deenrolling from course ' + courseId + " for user " + userId)

    const result = await this.docClient.delete({
        TableName: this.coursesTable,
        Key: {
          userId,
          courseId
        }
      }).promise()
      logger.info('Deenrolled from course ' + courseId + " for user " + userId, result)

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
