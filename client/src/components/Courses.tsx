import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { enrollCourse, deenrollCourse, getCourses, patchCourse } from '../api/courses-api'
import Auth from '../auth/Auth'
import { Course } from '../types/Course'

interface CoursesProps {
  auth: Auth
  history: History
}

interface CoursesState {
  courses: Course[]
  newCourseName: string
  loadingCourses: boolean
}

export class Courses extends React.PureComponent<CoursesProps, CoursesState> {
  state: CoursesState = {
    courses: [],
    newCourseName: '',
    loadingCourses: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newCourseName: event.target.value })
  }

  onEditButtonClick = (courseId: string) => {
    this.props.history.push(`/courses/${courseId}/update`)
  }

  onCourseEnroll = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
        alert("add course number input, and validate against a list")
      const courseNumber = "1234"
      const newCourse = await enrollCourse(this.props.auth.getIdToken(), {
        courseName: this.state.newCourseName,
        courseNumber
      })
      this.setState({
        courses: [...this.state.courses, newCourse],
        newCourseName: ''
      })
    } catch {
      alert('Course creation failed')
    }
  }

  onCourseDeenroll = async (courseId: string) => {
    try {
      await deenrollCourse(this.props.auth.getIdToken(), courseId)
      this.setState({
        courses: this.state.courses.filter(course => course.courseId !== courseId)
      })
    } catch {
      alert('course deletion failed')
    }
  }

  onCourseCheck = async (pos: number) => {
    try {
      const course = this.state.courses[pos]
      await patchCourse(this.props.auth.getIdToken(), course.courseId, {
        courseName: course.courseName,
        courseNumber: course.courseNumber,
        courseId: course.courseId,
        completed: !course.completed
      })
      this.setState({
        courses: update(this.state.courses, {
          [pos]: { completed: { $set: !course.completed } }
        })
      })
    } catch {
      alert('course check failed')
    }
  }

  async componentDidMount() {
    try {
      const courses = await getCourses(this.props.auth.getIdToken())
      this.setState({
        courses,
        loadingCourses: false
      })
    } catch (e: any) {
      alert(`Failed to fetch courses: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Courses</Header>

        {this.renderCreateCourseInput()}

        {this.renderCourses()}
      </div>
    )
  }

  renderCreateCourseInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Enroll',
              onClick: this.onCourseEnroll
            }}
            fluid
            actionPosition="left"
            placeholder="Enter Course Name..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderCourses() {
    if (this.state.loadingCourses) {
      return this.renderLoading()
    }

    return this.renderCoursesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Courses
        </Loader>
      </Grid.Row>
    )
  }

  renderCoursesList() {
    return (
      <Grid padded>
        {this.state.courses.map((course, pos) => {
          return (
            <Grid.Row key={course.courseId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onCourseCheck(pos)}
                  checked={course.completed}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {course.courseName}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {course.courseNumber}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(course.courseId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onCourseDeenroll(course.courseId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {course.projectUrl && (
                <Image src={course.projectUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
