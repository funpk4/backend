const { Router } = require('express');
const auth = require("../middleware/adminauth");

const formRouter = Router();
const formController = require('../controllers/formController');

formRouter.post('/addForm',auth,formController.addForm)
formRouter.post('/updateForm',auth,formController.updateForm)




module.exports = formRouter
