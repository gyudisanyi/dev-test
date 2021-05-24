import { body, validationResult } from 'express-validator'
import path from 'path'
import * as grpc from '@grpc/grpc-js'
const protoLoader = require("@grpc/proto-loader")
import config from '../../config/service'
const PROTO_PATH = path.join(__dirname, '../../proto/student.proto')

exports.validationRules = (method) => {
    switch (method) {
        case 'create': {
            return [
                body('first_name').not().isEmpty(),
                body('last_name').not().isEmpty(),
                body('email').isEmail()
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
const studentProto = grpc.loadPackageDefinition(packageDefinition).student
console.log({studentProto});
const client = new studentProto.StudentService(config.student.host +':'+ config.student.port, grpc.credentials.createInsecure())

const studentList = (options) => {
    return new Promise((resolve, reject) => {
      client.List(options, (error, response) => {
            if (error) { reject(error) }
            resolve(response)
        })
    })
}

exports.list = async (req, res, next) => {
    try{
        let result = await studentList()
        res.status(200).json(result)
    } catch(e){
        res.json(e)
    }
}

const studentCreate = (options) => {
    return new Promise((resolve, reject) => {
      client.Create(options, (error, response) => {
            if (error) { reject(error) }
            resolve(response)
        })
    })
}

exports.create = async (req, res, next) => {
    try{
        let result = await studentCreate({
            "first_name": req.body.first_name,
            "last_name": req.body.last_name,
            "email": req.body.email
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

const studentRead = (options) => {
    return new Promise((resolve, reject) => {
      client.Read(options, (error, response) => {
            if (error) { reject(error) }
            resolve(response)
        })
    })
}

exports.read = async (req, res, next) => {
    try{
        let result = await studentRead({
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

const studentUpdate = (options) => {
    return new Promise((resolve, reject) => {
      client.Update(options, (error, response) => {
            if (error) { reject(error) }
            resolve(response)
        })
    })
}

exports.update = async (req, res, next) => {
    try{
        let result = await studentUpdate({
            "id": req.params.id,
            "first_name": req.body.first_name,
            "last_name": req.body.last_name,
            "email": req.body.email
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

const studentDelete = (options) => {
    return new Promise((resolve, reject) => {
      client.Delete(options, (error, response) => {
            if (error) { reject(error) }
            resolve(response)
        })
    })
}

exports.delete = async (req, res, next) => {
    try{
        let result = await studentDelete({
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