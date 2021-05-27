import Sequelize from 'sequelize'
import config from '../../config/database'

const sequelize = new Sequelize(
    config.database.DB, 
    config.database.USER, 
    config.database.PASSWORD, {
        host: config.database.HOST,
        port: config.database.PORT,
        dialect: config.database.dialect,
        operatorsAliases: 0,
        pool: {
            max: config.database.pool.max,
            min: config.database.pool.min,
            acquire: config.database.pool.acquire,
            idle: config.database.pool.idle
        },
        logging: config.database.logging
    }
)

const db = {
    sequelize: sequelize,
    DataType: Sequelize,
}



/*
StudentModel.belongsToMany(Project, {
  through: "project_tag",
  as: "projects",
  foreignKey: "project_id"
})

ProjectModel.belongsToMany(Student, {
  through: "student_tag",
  as: "students",
  foreignKey: "student_id"
})*/

export default db