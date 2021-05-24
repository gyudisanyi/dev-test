import express from 'express'
const router = express()
import student from './student'
import project from './project'
import management from './management'

// Documentation
// https://expressjs.com/en/api.html#router

// Hallgatókat kezelő útvonalak
router.use('/student', student)

// Projekteket kezelő útvonalak
router.use('/project', project)

// Managementet kezelő útvonalak
router.use('/management', management)

export default router