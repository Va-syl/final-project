import { CourseAccess } from './courseAccess'
import { generateUploadUrl } from './projectUtils';
import { Course } from '../models/Course'
import { CourseUpdate } from '../models/CourseUpdate'
import { EnrollCourseRequest } from '../requests/EnrollCourseRequest'
import { UpdateCourseRequest } from '../requests/UpdateCourseRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

//businessLogic

const courseAccess = new CourseAccess()
const logger = createLogger('Courses')

export async function getCoursesForUser(  userId: string): Promise<Course[]> {
    logger.info("getCoursesForUser", userId)
    return courseAccess.getCoursesForUser(userId)
  }

export async function enrollCourse(
    enrollCourseRequest: EnrollCourseRequest,
  userId: string
): Promise<Course> {
  logger.info("enrollCourse",enrollCourseRequest)
  const itemId = uuid.v4()
  const bucketName = process.env.PROJECTS_S3_BUCKET

  return await courseAccess.enrollCourse({
    userId: userId,
    courseId: itemId,
    courseName: enrollCourseRequest.courseName,
    courseNumber: enrollCourseRequest.courseNumber,
    createdAt: new Date().toISOString(),
    completed: false,
    projectUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`,
    projectUploaded: false
  })
}

export function deenrollCourse(courseId: string, userId: string): Promise<string> {
    logger.info("deenrollCourse", courseId)
    return courseAccess.deenrollCourse(userId, courseId)
  }

export function updateCourse(
    updateCourseRequest: UpdateCourseRequest,
    courseId: string,
    userId: string
  ): Promise<CourseUpdate> {
    logger.info("updateCourse", updateCourseRequest)
    return courseAccess.updateCourse(updateCourseRequest, userId, courseId)
  }

export async function createProjectPresignedUrl(
    courseId: string,
    userId: string
): Promise<string> {
    logger.info("createProjectPresignedUrl " + courseId)
    const result = generateUploadUrl(courseId)
    await courseAccess.updateCourseProjectUpload(userId, courseId)
    return result     
} 