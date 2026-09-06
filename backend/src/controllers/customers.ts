import { NextFunction, Request, Response } from 'express'
import { FilterQuery } from 'mongoose'
import NotFoundError from '../errors/not-found-error'
import Order from '../models/order'
import User, { IUser } from '../models/user'
import escapeRegExp from '../utils/escapeRegExp'
import { asString, toDate, toNumber } from '../utils/query'

const CUSTOMER_SORT_FIELDS = [
    'createdAt',
    'totalAmount',
    'orderCount',
    'name',
    'lastOrderDate',
]

// TODO: Добавить guard admin
// eslint-disable-next-line max-len
// Get GET /customers?page=2&limit=5&sort=totalAmount&order=desc&registrationDateFrom=2023-01-01&registrationDateTo=2023-12-31&lastOrderDateFrom=2023-01-01&lastOrderDateTo=2023-12-31&totalAmountFrom=100&totalAmountTo=1000&orderCountFrom=1&orderCountTo=10
export const getCustomers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = Math.max(toNumber(req.query.page) ?? 1, 1)
        const limit = Math.max(toNumber(req.query.limit) ?? 10, 1)
        const sortField = asString(req.query.sortField) ?? 'createdAt'
        const sortOrder = asString(req.query.sortOrder) ?? 'desc'

        const filters: FilterQuery<Partial<IUser>> = {}

        const registrationDateFrom = toDate(req.query.registrationDateFrom)
        if (registrationDateFrom) {
            filters.createdAt = {
                ...filters.createdAt,
                $gte: registrationDateFrom,
            }
        }

        const registrationDateTo = toDate(req.query.registrationDateTo)
        if (registrationDateTo) {
            const endOfDay = new Date(registrationDateTo)
            endOfDay.setHours(23, 59, 59, 999)
            filters.createdAt = {
                ...filters.createdAt,
                $lte: endOfDay,
            }
        }

        const lastOrderDateFrom = toDate(req.query.lastOrderDateFrom)
        if (lastOrderDateFrom) {
            filters.lastOrderDate = {
                ...filters.lastOrderDate,
                $gte: lastOrderDateFrom,
            }
        }

        const lastOrderDateTo = toDate(req.query.lastOrderDateTo)
        if (lastOrderDateTo) {
            const endOfDay = new Date(lastOrderDateTo)
            endOfDay.setHours(23, 59, 59, 999)
            filters.lastOrderDate = {
                ...filters.lastOrderDate,
                $lte: endOfDay,
            }
        }

        const totalAmountFrom = toNumber(req.query.totalAmountFrom)
        if (totalAmountFrom !== undefined) {
            filters.totalAmount = {
                ...filters.totalAmount,
                $gte: totalAmountFrom,
            }
        }

        const totalAmountTo = toNumber(req.query.totalAmountTo)
        if (totalAmountTo !== undefined) {
            filters.totalAmount = {
                ...filters.totalAmount,
                $lte: totalAmountTo,
            }
        }

        const orderCountFrom = toNumber(req.query.orderCountFrom)
        if (orderCountFrom !== undefined) {
            filters.orderCount = {
                ...filters.orderCount,
                $gte: orderCountFrom,
            }
        }

        const orderCountTo = toNumber(req.query.orderCountTo)
        if (orderCountTo !== undefined) {
            filters.orderCount = {
                ...filters.orderCount,
                $lte: orderCountTo,
            }
        }

        const search = asString(req.query.search)
        if (search) {
            const searchRegex = new RegExp(escapeRegExp(search), 'i')
            const orders = await Order.find(
                {
                    $or: [{ deliveryAddress: searchRegex }],
                },
                '_id'
            )

            const orderIds = orders.map((order) => order._id)

            filters.$or = [
                { name: searchRegex },
                { lastOrder: { $in: orderIds } },
            ]
        }

        const sort: { [key: string]: 1 | -1 } = {}

        if (
            CUSTOMER_SORT_FIELDS.includes(sortField) &&
            (sortOrder === 'asc' || sortOrder === 'desc')
        ) {
            sort[sortField] = sortOrder === 'desc' ? -1 : 1
        }

        const options = {
            sort,
            skip: (page - 1) * limit,
            limit,
        }

        const users = await User.find(filters, null, options).populate([
            'orders',
            {
                path: 'lastOrder',
                populate: {
                    path: 'products',
                },
            },
            {
                path: 'lastOrder',
                populate: {
                    path: 'customer',
                },
            },
        ])

        const totalUsers = await User.countDocuments(filters)
        const totalPages = Math.ceil(totalUsers / limit)

        res.status(200).json({
            customers: users,
            pagination: {
                totalUsers,
                totalPages,
                currentPage: page,
                pageSize: limit,
            },
        })
    } catch (error) {
        next(error)
    }
}

// TODO: Добавить guard admin
// Get /customers/:id
export const getCustomerById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(req.params.id).populate([
            'orders',
            'lastOrder',
        ])
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}

// TODO: Добавить guard admin
// Patch /customers/:id
export const updateCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, email, phone } = req.body
        const updates: { name?: string; email?: string; phone?: string } = {}
        if (name !== undefined) updates.name = name
        if (email !== undefined) updates.email = email
        if (phone !== undefined) updates.phone = phone

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true,
            }
        )
            .orFail(
                () =>
                    new NotFoundError(
                        'Пользователь по заданному id отсутствует в базе'
                    )
            )
            .populate(['orders', 'lastOrder'])
        res.status(200).json(updatedUser)
    } catch (error) {
        next(error)
    }
}

// TODO: Добавить guard admin
// Delete /customers/:id
export const deleteCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id).orFail(
            () =>
                new NotFoundError(
                    'Пользователь по заданному id отсутствует в базе'
                )
        )
        res.status(200).json(deletedUser)
    } catch (error) {
        next(error)
    }
}
