import StudentModel from './student'
import ProjectModel from './project'
import db from '../connect'

const Student = StudentModel(db)
const Project = ProjectModel(db)

Student.belongsToMany(Project, {
  "through": "management",
  "foreignKey": "student_id"
})

Project.belongsToMany(Student, {
  "through": "management",
  "foreignKey": "project_id"
})



const ManagementModel = ({
    sequelize, 
    DataType
  }) => {
  const {INTEGER, STRING, DATE, NOW} = DataType
  const Management = sequelize.define("management", {
    // id: {
    //   type: INTEGER, 
    //   primaryKey: true, 
    //   autoIncrement: true
    // },
  })
  
  Management.addProjects = async ({id, ids}) => {
    const student = await Student.findByPk(id,
      {include: [
        {
          model: Project,
        }
      ]}
      )
    console.log(student)
    return await student.setProjects(JSON.parse("["+ids+"]"))
  }

  Management.getProjects = async ({id, ids}) => {
    console.log(id)
    const student = await Student.findByPk(id,
      {include: [
        {
          model: Project,
        }
      ]}
      )
    return await student.getProjects()
  }

  Management.addStudents = async ({id, ids}) => {
    const project = await Project.findByPk(id,
      {include: [
        {
          model: Student,
        }
      ]}
      )
    return await project.setStudents(JSON.parse("["+ids+"]"))
  }

  
  Management.getStudents = async ({id, ids}) => {
    console.log(id)
    const project = await Project.findByPk(id,
      {include: [
        {
          model: Student,
        }
      ]}
      )
    return await project.getStudents()
  }

  return Management;
}
  
export default ManagementModel