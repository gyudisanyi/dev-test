import path from 'path'
import * as grpc from '@grpc/grpc-js'
const protoLoader = require("@grpc/proto-loader")
import config from '../../config/service'
import db from '../database/connect'
import ManagementModel from '../database/model/management'
const PROTO_PATH = path.join(__dirname, '../../proto/management.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})

// Load in our service definition
const managementProto = grpc.loadPackageDefinition(packageDefinition).management
const server = new grpc.Server()

const managementModel = ManagementModel(db)

// Implement getter functions


const getProjects = async (call, callback) => {
  let management = call.request
  try{
      let result = await managementModel.getProjects(
          {
              "id":     management.id 
          }
      )
      if(result[0]){
        callback(null, {projects: result})
      }
      else{
          callback({
              code: grpc.status.NOT_FOUND,
              details: "Not found"
          })
      }
  }catch(err){
    console.log(err)
      callback({
          code: grpc.status.ABORTED,
          details: "Aborted"
      })
  }
}


const getStudents = async (call, callback) => {
  let management = call.request
  try{
      let result = await managementModel.getStudents(
          {
              "id":     management.id 
          }
      )
      if(result[0]){
          callback(null, {students: result})
      }
      else{
          callback({
              code: grpc.status.NOT_FOUND,
              details: "Not found"
          })
      }
  }catch(err){
    console.log(err)
      callback({
          code: grpc.status.ABORTED,
          details: "Aborted"
      })
  }
}

// Implement the update functions
const associateProjects = async (call, callback) => {
    let management = call.request
    try{
        let affectedRows = await managementModel.addProjects(
            {
                "ids":    management.ids,
                "id":     management.id 
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
      console.log(err)
        callback({
            code: grpc.status.ABORTED,
            details: "Aborted"
        })
    }
}
const associateStudents = async (call, callback) => {
  let management = call.request
  try{
      let affectedRows = await managementModel.addStudents(
          {
              "ids":    management.ids,
              "id":     management.id 
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
    console.log(err)
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
    getProjects,
    getStudents,
    associateProjects,
    associateStudents,
}

server.addService(managementProto.ManagementService.service, exposedFunctions)
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