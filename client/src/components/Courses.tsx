
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

import { enrollCourse, deenrollCourse, getCourses, patchCourse, getCatalog } from '../api/courses-api'
import Auth from '../auth/Auth'
import { Course } from '../types/Course'

interface CoursesProps {
  auth: Auth
  history: History
}

interface CoursesState {
  courses: Course[],
  catalog: Course[],
  newCourseName: string
  loadingCourses: boolean
}

export class Courses extends React.PureComponent<CoursesProps, CoursesState> {
  state: CoursesState = {
    courses: [],
    catalog: [],
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
    if (!this.state.newCourseName)
    {
      alert('Enter an available course number')
      return
    }
    try {
      var course = this.state.catalog.find((element) => {
        return element.courseNumber.toUpperCase() === this.state.newCourseName.toUpperCase();
      })

      if (!course)
      {
        alert('Enter an available course number')
        return
      }

      const newCourse = await enrollCourse(this.props.auth.getIdToken(), {
        courseName: course?.courseName ?? "Trainacity Course",
        courseNumber: this.state.newCourseName.toUpperCase()
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
      if (!course.completed)
      {
        alert("Thanks for completing the course.  Now please upload your project screenshot so it can be reviewed")
      }
    } catch {
      alert('course check failed')
    }
  }

  async componentDidMount() {
    try {
        const catalog = await getCatalog(this.props.auth.getIdToken())
        this.setState({
            catalog
          })
    }
    catch(e: any){
        alert(`Failed to fetch catalog: ${e.message}`)
    }

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
        {this.renderCatalog()}
        
        {this.renderCreateCourseInput()}

        {this.renderCourses()}
      </div>
    )
  }

  renderCatalog() {
    return (
        
        <Grid padded>
          <Header as="h3">Current Course Catalog</Header>
          <Grid.Row>
              <Grid.Column width={2} verticalAlign="middle">
                <Header as="h4">Course Number</Header>
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="middle">
              <Header as="h4">Course Name</Header>
                </Grid.Column>
          </Grid.Row>
          {this.state.catalog.map((course, pos) => {
            return (
              <Grid.Row>
                <Grid.Column width={2} verticalAlign="middle">
                  {course.courseNumber}
                </Grid.Column>
                <Grid.Column width={6} verticalAlign="middle">
                  {course.courseName}
                </Grid.Column>
              </Grid.Row>
            )
          })}
        </Grid>
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
            placeholder="Enter Course Number..."
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
        <Header as="h2">Transcript</Header>
        <Grid.Row>
            <Grid.Column width={2} verticalAlign="middle">
                Completed
            </Grid.Column>
            <Grid.Column width={6} verticalAlign="middle">
                Name
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                Number
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                  Deenroll
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                Upload Screenshot
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                  Project Screenshot
              </Grid.Column>
        </Grid.Row>
        {this.state.courses.map((course, pos) => {
          return (
            <Grid.Row key={course.courseId}>
              <Grid.Column width={2} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onCourseCheck(pos)}
                  checked={course.completed}
                />
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="middle">
                {course.courseName}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                {course.courseNumber}
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
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(course.courseId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={2} floated="right">
              {course.projectUploaded && (
                <Image src={course.projectUrl} size="small" wrapped />
              )}
              {course.projectUploaded && (
              <a href={course.projectUrl}> Screenshot</a>              
              )}
              </Grid.Column>   
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
