# Final Project: Serverless Trainacity

# Functionality of the Trainacity application

Trainacity application will allow students to enroll in the currently available Trainacity Cloud-related training courses. Each student only has access to his/her courses.  Students cannot enroll in courses that are not offered.  Students can mark their courses as completed, and can upload project screenshots for review when completed.  Enroll creates items, deenroll deletes items, completing course updates items.  Project screenshots can be uploaded.  Authentication is enforced with Auth0.  

Project was deployed using command: sls deploy --verbose.  All resources are defined in the serverless.yml.  Permissions are defined per function in the file.  Application has logging and tracing.  Functions are validated using request schemas in serverless.yml.  Courses table has a composite key.  Scan is not used to read data from either table.  Promises are used throughout, instead of callbacks.  Business logic is separated into different layers: lambda, courseAccess helper (datalayer) course helper (business logic) and projectUtils helper (file storage).

# Application components
API Gateway

Two DynamoDB tables: Catalog and Courses.  Catalog stores the available courses, and Courses (with localsecondaryindex) stores the courses that each student is enrolled in.

S3 bucket for project screenshots, access with signed urls. 

Seven lambdas: 
  Auth - uses auth0 
  
  GetCatalog - gets all courses currently being offered by querying available courses from overall course catalog dynamodb table.  DOES NOT USE SCAN
  
  GetCourses - gets courses for logged-in student from dynamodb table.  DOES NOT USE SCAN
  
  EnrollCourse - allows a student to enroll in a course.  Puts item in Courses dynamodb table.
  
  DeenrollCourse - allows a student to deeroll from a course.  Deletes item from Courses dynamodb table.
  
  UpdateCourse - allows a student to check a course as completed on their transcript, and to upload their screenshots.  Updates item in Courses dynamodb table.
  
  GenerateProjectUrl - will get a signed url for the student to upload their project screenshot to S3 bucket.
  
  



