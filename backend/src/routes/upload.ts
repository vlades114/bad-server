import { Router } from 'express'
import { uploadFile } from '../controllers/upload'
import csrfProtection from '../middlewares/csrf'
import fileMiddleware from '../middlewares/file'

const uploadRouter = Router()
uploadRouter.post('/', csrfProtection, fileMiddleware.single('file'), uploadFile)

export default uploadRouter
