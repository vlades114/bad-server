import { ErrorRequestHandler } from 'express'

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    let statusCode = err.statusCode || 500
    let message =
        statusCode === 500 ? 'На сервере произошла ошибка' : err.message

    if (err.name === 'MulterError') {
        statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
        message =
            err.code === 'LIMIT_FILE_SIZE'
                ? 'Файл слишком большой'
                : 'Некорректный файл'
    }

    console.log(err)

    res.status(statusCode).send({ message })

    next()
}

export default errorHandler
