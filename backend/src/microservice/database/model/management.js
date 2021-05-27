import StudentModel from './student'
import ProjectModel from './project'
import db from '../connect'

const studentModel = StudentModel(db)
const projectModel = ProjectModel(db)

const ManagementModel = () => {

  studentModel.belongsToMany(projectModel, {
    through: "project_tag",
    as: "projects",
    foreignKey: "project_ids"
  });

  projectModel.belongsToMany(studentModel, {
    through: "student_tag",
    as: "students",
    foreignKey: "student_ids"
  })

  return Management;
}
  
export default ManagementModel