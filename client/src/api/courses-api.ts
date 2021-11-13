import { apiEndpoint } from '../config'
import { Course } from '../types/Course';
import { EnrollCourseRequest } from '../types/EnrollCourseRequest';
import Axios from 'axios'
import { UpdateCourseRequest } from '../types/UpdateCourseRequest';

export async function getCourses(idToken: string): Promise<Course[]> {
  console.log('Fetching courses')

  const response = await Axios.get(`${apiEndpoint}/courses`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Courses:', response.data)
  return response.data.items
}

export async function enrollCourse(
  idToken: string,
  newCourse: EnrollCourseRequest
): Promise<Course> {
  const response = await Axios.post(`${apiEndpoint}/Courses`,  JSON.stringify(newCourse), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchCourse(
  idToken: string,
  courseId: string,
  updatedCourse: UpdateCourseRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/courses/${courseId}`, JSON.stringify(updatedCourse), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deenrollCourse(
  idToken: string,
  courseId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/courses/${courseId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getProjectUrl(
  idToken: string,
  courseId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/courses/${courseId}/project`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.projectUrl
}

export async function uploadFile(projectUrl: string, file: Buffer): Promise<void> {
  await Axios.put(projectUrl, file)
}
