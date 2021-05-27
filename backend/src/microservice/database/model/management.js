import StudentModel from './student'
import ProjectModel from './project'
import db from '../connect'

const ManagementModel = ({
    sequelize, 
    DataType
  }) => {
  const {INTEGER, STRING, DATE, NOW} = DataType
  const Management = sequelize.define("management", {
    id: {
      type: INTEGER, 
      primaryKey: true, 
      autoIncrement: true
    },
  })

    
  StudentModel(db).belongsToMany(ProjectModel(db), {
    "through": "management",
    "as": "projects",
    "foreignKey": "student_id"
  })

  ProjectModel(db).belongsToMany(StudentModel(db), {
    "through": "management",
    "as": "students",
    "foreignKey": "project_id"
  })

  return Management;
}
  
export default ManagementModel