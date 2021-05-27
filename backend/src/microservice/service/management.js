import path from 'path'
import * as grpc from '@grpc/grpc-js'
const protoLoader = require("@grpc/proto-loader")
import config from '../../config/service'
import db from '../database/connect'
import StudentModel from '../database/model/student'
import ProjectModel from '../database/model/project'
const PROTO_PATH = path.join(__dirname, '../../proto/management.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})

// Load in our service definition
const proto = grpc.loadPackageDefinition(packageDefinition).management
const server = new grpc.Server()

const studentModel = StudentModel(db)
const projectModel = ProjectModel(db)

studentModel.belongsToMany(projectModel, {
  through: "management",
  as: "projects",
  foreignKey: "project_id"
});

projectModel.belongsToMany(studentModel, {
  through: "management",
  as: "students",
  foreignKey: "student_id"
})

// Only update function makes sense

// Implement the update function
const Update = async (call, callback) => {
    let management = call.request
    
    try{
        let affectedRows = await managementModel.update(
            {
                "ids":  management.ids, 
            },
            {
                where: { id: management.id }
            }
        )
        if(affectedRows[0]){
            callback(null, affectedRows)
        }
        else{
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not found"
            })
        }
    }catch(err){
        callback({
            code: grpc.status.ABORTED,
            details: "Aborted"
        })
    }
}
// Collect errors
const dbErrorCollector=({
    errors
})=>{
    const metadata = new grpc.Metadata()
    const error = errors.map(item => {
        metadata.set(item.path, item.type)
    })
    return metadata
}
const exposedFunctions = {
    Update
}

server.addService(proto.ManagementStudentService.service, exposedFunctions)
server.addService(proto.ManagementProjectService.service, exposedFunctions)
server.bindAsync(config.management.host +':'+ config.management.port, grpc.ServerCredentials.createInsecure(), (error)=>{ throw error;})

db.sequelize.sync().then(() => {
    console.log("Re-sync db.")
    server.start()
    console.log('Server running at ' + config.management.host +':'+ config.management.port)
})
.catch(err => {
    console.log('Can not start server at ' + config.management.host +':'+ config.management.port)
    console.log(err)
})