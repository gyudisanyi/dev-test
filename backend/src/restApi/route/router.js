import express from 'express'
const router = express()
import student from './student'
import project from './project'

// Documentation
// https://expressjs.com/en/api.html#router

// Hallgatókat kezelő útvonalak
router.use('/student', student)

// Projekteket kezelő útvonalak
router.use('/project', project)

export default router