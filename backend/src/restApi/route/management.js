import express from 'express'
const router = express.Router()
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
router.get('/', management.list)
// POST request for create an item
router.post('/', management.validationRules('create'), management.validate, management.create)
// GET request for read an item by id
router.get('/:id', management.read)
// GET request for update an item by id
router.put('/:id', management.update)
// GET request for delete item by id
router.delete('/:id', management.delete)
export default router