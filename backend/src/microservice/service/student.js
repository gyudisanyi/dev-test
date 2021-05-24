import path from 'path'
import * as grpc from '@grpc/grpc-js'
const protoLoader = require("@grpc/proto-loader")
import config from '../../config/service'
import db from '../../microservice/database/connect'
import StudentModel from '../../microservice/database/model/student'
const PROTO_PATH = path.join(__dirname, '../../proto/student.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})

// Load in our service definition
const studentProto = grpc.loadPackageDefinition(packageDefinition).student
const server = new grpc.Server()

const studentModel = StudentModel(db)

// Implement the list function
const List = async (call, callback) => {
    //const Op = db.DataType.Op
    //const condition = first_name ? { first_name: { [Op.like]: `%${first_name}%` } } : null;

    // Tanulók listázása adatbázisból
    try{
        //const result = await studentModel.findAll({ where: condition })
        const result = await studentModel.findAll()
        callback(null, {students: result})
    }
    catch(err){
        callback({
            code: grpc.status.ABORTED,
            details: "Aborted"
        })
    }
}
// Implement the insert function
const Create = async (call, callback) => {
    let student = call.request
    try{
        let result = await studentModel.create(student)
        callback(null, result)
    }catch(err){
        switch(err.name) {
            case 'SequelizeUniqueConstraintError':
                let jsErr = new Error('ALREADY_EXISTS')
                jsErr.code = grpc.status.ALREADY_EXISTS
                jsErr.metadata = dbErrorCollector({errors: err.errors})
                callback(jsErr)
                break
            default:
                callback({
                    code: grpc.status.ABORTED,
                    details: "ABORTED"
                })
        }
    }
}
// Implement the read function
const Read = async (call, callback) => {
    let id = call.request.id
    // data validation
    // ...
    // Kontakt mentése adatbázisba
    try{
        let result = await studentModel.findByPk(id)
        if(result){
            callback(null, result)
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
// Implement the update function
const Update = async (call, callback) => {
    let student = call.request
    try{
        let affectedRows = await studentModel.update(
            {
                "first_name":   student.first_name, 
                "last_name":    student.last_name, 
                "title":        student.title, 
                "email":        student.email
            },
            {
                where: { id: student.id }
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
// Implement the delete function
const Delete = async (call, callback) => {
    let id = call.request.id
    try{
        let result = await studentModel.destroy({ where: { "id": id } })
        if(result){
            callback(null, result)
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
    List,
    Create,
    Read,
    Update,
    Delete
}

server.addService(studentProto.StudentService.service, exposedFunctions)
server.bindAsync(config.student.host +':'+ config.student.port, grpc.ServerCredentials.createInsecure(), (error)=>{ throw error;})

db.sequelize.sync().then(() => {
    console.log("Re-sync db.")
    server.start()
    console.log('Server running at ' + config.student.host +':'+ config.student.port)
})
.catch(err => {
    console.log('Can not start server at ' + config.student.host +':'+ config.student.port)
    console.log(err)
})