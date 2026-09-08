import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    const base = path.resolve(baseDir)

    return (req: Request, res: Response, next: NextFunction) => {
        // Определяем полный путь к запрашиваемому файлу
        const filePath = path.join(base, req.path)

        // Не даём выйти за пределы базовой директории (защита от path traversal)
        if (filePath !== base && !filePath.startsWith(base + path.sep)) {
            return next()
        }

        // Проверяем, существует ли файл
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // Файл не существует отдаем дальше мидлварам
                return next()
            }
            // Файл существует, отправляем его клиенту
            return res.sendFile(filePath, (err) => {
                if (err) {
                    next(err)
                }
            })
        })
    }
}
