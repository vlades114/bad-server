import csurf from 'csurf'

const csrfProtection = csurf({
    cookie: {
        key: '_csrf',
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
    },
})

export default csrfProtection
