import express from 'express'
const router = express.Router()
import student from '../controller/student'

// Classic CRUD solution
// Function	    Request Method
// list	        GET
// get	        GET
// create	    POST
// update	    PUT
// delete	    DELETE
// set	        PATCH

// GET request for list of all items
router.get('/', student.list)
// POST request for create an item
router.post('/', student.validationRules('create'), student.validate, student.create)
// GET request for read an item by id
router.get('/:id', student.read)
// PUT request for update an item by id
router.put('/:id', student.update)
// DELETE request for delete item by id
router.delete('/:id', student.delete)
export default router