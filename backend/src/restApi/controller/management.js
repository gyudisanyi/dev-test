import { body, validationResult } from 'express-validator'
import path from 'path'
import * as grpc from '@grpc/grpc-js'
const protoLoader = require("@grpc/proto-loader")
import config from '../../config/service'
const PROTO_PATH = path.join(__dirname, '../../proto/management.proto')

exports.validationRules = (method) => {
    switch (method) {
        case 'create': {
            return [
                body('ids').notEmpty().isArray(),
            ]
        }
    }
}

exports.validate = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))
  
    return res.status(400).json({
        errors: extractedErrors
    })
}

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
    defaults: true,
    oneofs: true
})

// Load in our service definition
console.log({grpc})
const managementProto = grpc.loadPackageDefinition(packageDefinition).management
const studentClient = new managementProto.ManagementStudentService(config.management.host +':'+ config.management.port, grpc.credentials.createInsecure())
const projectClient = new managementProto.ManagementProjectService(config.management.host +':'+ config.management.port, grpc.credentials.createInsecure())

const studentUpdate = (options) => {
  console.log({options})
    return new Promise((resolve, reject) => {
      studentClient.Update(options, (error, response) => {
            if (error) { reject(error) }
            resolve(response)
        })
    })
}

exports.associateProjects = async (req, res, next) => {
    
    try{
        let result = await studentUpdate({
            "id": req.params.id,
            "project_ids": req.body.ids,
        })
        res.status(200).json({id: req.params.id})
    } catch(e){
        if(e.details === 'Not found'){
            res.status(204).json(e)
        }
        else{
            res.status(500).json(e)
        }
    }
}


const projectUpdate = (options) => {
  return new Promise((resolve, reject) => {
    projectClient.Update(options, (error, response) => {
          if (error) { reject(error) }
          resolve(response)
      })
  })
}

exports.associateStudents = async (req, res, next) => {
  console.log(req.body.ids)
  try{
      let result = await projectUpdate({
          "id": req.params.id,
          "student_ids": req.body.ids,
      })
      res.status(200).json({id: req.params.id})
  } catch(e){
      if(e.details === 'Not found'){
          res.status(204).json(e)
      }
      else{
          res.status(500).json(e)
      }
  }
}
