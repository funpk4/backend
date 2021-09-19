const { Router } = require('express');
const auth = require("../middleware/adminauth");

const adminRouter = Router();
const adminController = require('../controllers/adminController');

adminRouter.post('/login',adminController.login)
adminRouter.post('/register',adminController.register)

adminRouter.post('/change-password', auth, adminController.changePassword)

adminRouter.post('/reset-password', adminController.resetPasswordController)
adminRouter.post('/request-password-reset', adminController.requestPasswordReset)



module.exports = adminRouter

