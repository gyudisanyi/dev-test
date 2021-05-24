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
                body('student_ids').not().isEmpty().isArray(),
                body('project_ids').not().isEmpty().isArray(),
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
    defaults: true,
    oneofs: true
})

// Load in our service definition
console.log({grpc})
const managementProto = grpc.loadPackageDefinition(packageDefinition).management
const client = new managementProto.ManagementService(config.management.host +':'+ config.management.port, grpc.credentials.createInsecure())

const managementList = (options) => {
    return new Promise((resolve, reject) => {
      client.List(options, (error, response) => {
            if (error) { reject(error) }
            resolve(response)
        })
    })
}

exports.list = async (req, res, next) => {
    try{
        let result = await managementList()
        res.status(200).json(result)
    } catch(e){
        res.json(e)
    }
}

const managementCreate = (options) => {
    return new Promise((resolve, reject) => {
      client.Create(options, (error, response) => {
            if (error) { reject(error) }
            resolve(response)
        })
    })
}

exports.create = async (req, res, next) => {
    try{
        let result = await managementCreate({
            "student_ids": req.body.student_ids,
            "project_ids": req.body.project_ids,
        })
        res.status(201).json(result)
    } catch(err){
        switch(err?.details){
            case 'ALREADY_EXISTS':
                res.status(409).json({
                    error: err.metadata.getMap()
                })
                break
            default:
                res.status(500).json(err)
        }
    }
}

const managementRead = (options) => {
    return new Promise((resolve, reject) => {
      client.Read(options, (error, response) => {
            if (error) { reject(error) }
            resolve(response)
        })
    })
}

exports.read = async (req, res, next) => {
    try{
        let result = await managementRead({
            "id": req.params.id
        })
        res.status(200).json(result)
    } catch(e){
        if(e.details === 'Not found'){
            res.status(204).json(e)
        }
        else{
            res.status(500).json(e)
        }
    }
}

const managementUpdate = (options) => {
    return new Promise((resolve, reject) => {
      client.Update(options, (error, response) => {
            if (error) { reject(error) }
            resolve(response)
        })
    })
}

exports.update = async (req, res, next) => {
    try{
        let result = await managementUpdate({
            "id": req.params.id,
            "student_ids": req.body.student_ids,
            "project_ids": req.body.project_ids
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

const managementDelete = (options) => {
    return new Promise((resolve, reject) => {
      client.Delete(options, (error, response) => {
            if (error) { reject(error) }
            resolve(response)
        })
    })
}

exports.delete = async (req, res, next) => {
    try{
        let result = await managementDelete({
            "id": req.params.id
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