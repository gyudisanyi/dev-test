import StudentModel from './student'
import ProjectModel from './project'
import db from '../connect'

const Student = StudentModel(db)
const Project = ProjectModel(db)

const ManagementModel = ({
  sequelize,
  DataType
}) => {

  const { INTEGER } = DataType

  const Management = sequelize.define("management", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
  },)
    
  Student.belongsToMany(Project, {
    "through": "management",
    "as": "projects",
    "foreignKey": "student_id"
  })

  Project.belongsToMany(Student, {
    "through": "management",
    "as": "students",
    "foreignKey": "project_id"
  })

  Management.setProjects = async ({ id, ids }) => {
    console.log(Object.keys(Management.rawAttributes))
    const student = await Student.findByPk(id,
      {
        include: [
          {
            model: Project,
            as: "projects"
          }
        ]
      }
    )
    return await student.setProjects(JSON.parse("[" + ids + "]"))
  }

  Management.getProjects = async ({ id, ids }) => {
    
    const student = await Student.findByPk(id,
      {
        include: [
          {
            model: Project,
            as: "projects"
          }
        ]
      }
    )
    console.log({ student })
    return await student.getProjects()
  }

  Management.setStudents = async ({ id, ids }) => {
    const project = await Project.findByPk(id,
      {
        include: [
          {
            model: Student,
            as: "students"
          }
        ]
      }
    )
    return await project.setStudents(JSON.parse("[" + ids + "]"))
  }


  Management.getStudents = async ({ id, ids }) => {

    const project = await Project.findByPk(id,
      {
        include: [
          {
            model: Student,
            as: "students"
          }
        ]
      }
    )
    return await project.getStudents()
  }

  return Management;
}

export default ManagementModel