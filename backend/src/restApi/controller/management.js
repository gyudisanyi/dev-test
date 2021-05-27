import { body, validationResult } from 'express-validator'
import path from 'path'
import * as grpc from '@grpc/grpc-js'
const protoLoader = require("@grpc/proto-loader")
import config from '../../config/service'
const PROTO_PATH = path.join(__dirname, '../../proto/management.proto')

exports.validationRules = (method) => {
    switch (method) {
        case 'update': {
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
const client = new managementProto.ManagementService(config.management.host +':'+ config.management.port, grpc.credentials.createInsecure())

const associateProjects = (options) => {
    return new Promise((resolve, reject) => {
      client.associateProjects(options, (error, response) => {
            if (error) { reject(error) }
            resolve(response)
        })
    })
}

exports.associateProjects = async (req, res, next) => {
    try{
        const student = await associateProjects({id: req.params.id, ids: req.body.ids})
        res.status(200).json({id: req.params.id})
    } catch(e){
      console.log({e})
        if(e.details === 'Not found'){
            res.status(204).json(e)
        }
        else{
            res.status(500).json(e)
        }
    }
}