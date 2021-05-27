import express from 'express'
const router = express.Router()
import project from '../controller/project'
import management from '../controller/management'

// Classic CRUD solution
// Function	    Request Method
// list	        GET
// get	        GET
// create	    POST
// update	    PUT
// delete	    DELETE
// set	        PATCH

// GET request for list of all items
router.get('/', project.list)
// POST request for create an item
router.post('/', project.validationRules('create'), project.validate, project.create)
// GET request for read an item by id
router.get('/:id', project.read)
// PUT request for update an item by id
router.put('/:id', project.update)
// PUT request for update a student by id with associated projects
// router.put('/manage/:id', management.validationRules('update'), management.validate, management.associateStudents)
// DELETE request for delete item by id
router.delete('/:id', project.delete)
export default router