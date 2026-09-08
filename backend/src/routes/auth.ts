import { Request, Response, Router } from 'express'
import {
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'
import csrfProtection from '../middlewares/csrf'
import {
    validateAuthentication,
    validateUserBody,
} from '../middlewares/validations'

const authRouter = Router()

authRouter.get(
    '/csrf-token',
    csrfProtection,
    (req: Request, res: Response) => {
        res.json({ csrfToken: req.csrfToken() })
    }
)
authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', auth, csrfProtection, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.post('/login', validateAuthentication, login)
authRouter.get('/token', refreshAccessToken)
authRouter.get('/logout', logout)
authRouter.post('/register', validateUserBody, register)

export default authRouter
