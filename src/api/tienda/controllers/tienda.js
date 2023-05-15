'use strict';

/**
 * tienda controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const checkName = (str) => {
    const regexp = /^[a-zA-Z]{10,32}$/
    const checker = new RegExp(regexp)
    return checker.test(str)
}

module.exports = createCoreController('api::tienda.tienda', ({ strapi }) => ({
    async create(ctx) {
        const { nombre, descripcion } = ctx.request.body
        const user = ctx.state.user

        if (!ctx.state.user) {
            return ctx.response.status = 403
        }
        if (!ctx.state.user.id) {
            return ctx.response.status = 403
        }

        if (!descripcion) {
            return ctx.response.status = 400
        }

        const checkNombre = await strapi.db.query('api::tienda.tienda').findOne({
            where: {
                nombre: nombre
            }
        })

        if (checkNombre !== null) {
            return ctx.response.status = 409
        }

        if (!checkName(nombre)) {
            return ctx.response.status = 400
        }

        //hay un máximo de 3 tiendas por usuario, checkeamos que no tenga mas de 3 tiendas...
        const todasTiendasUsuario = await strapi.entityService.findMany('api::tienda.tienda', {
            filters: { admin_tienda: ctx.state.user.id }
        })

        if (todasTiendasUsuario?.length >= 3) {
            return ctx.response.status = 422
        }

        const tienda = await strapi.entityService.create('api::tienda.tienda', {
            data: {
                nombre: nombre,
                descripcion: descripcion,
                admin_tienda: ctx.state.user.id
            }
        })

        if (tienda === null) {
            return ctx.response.status = 500
        }

        const sanitizedResults = await this.sanitizeOutput(tienda, ctx);
        return this.transformResponse(sanitizedResults);
    },
    async findMyTiendas(ctx) {
        const user = ctx.state.user
        if (!user || !user.id) {
            return ctx.response.status = 403
        }
        const tiendas = await strapi.entityService.findMany('api::tienda.tienda', {
            filters: { admin_tienda: user.id }
        })

        const sanitizedResults = await this.sanitizeOutput(tiendas, ctx);
        return this.transformResponse(sanitizedResults);
    },
    async delete(ctx) {
        const user = ctx.state.user
        const { id } = ctx.params
        if (!user || !user.id) {
            return ctx.response.status = 403
        }
        if (!id) {
            return ctx.response.status = 400
        }
        const tiendaBorrada = await strapi.entityService.delete('api::tienda.tienda', id)
        const sanitizedResults = await this.sanitizeOutput(tiendaBorrada, ctx);
        return this.transformResponse(sanitizedResults);
    },
    async update(ctx) {
        const user = ctx.state.user
        const { id } = ctx.params
        const { nombre, descripcion } = ctx.request.body

        if (!user || !user.id) {
            return ctx.response.status = 403
        }
        if (!id || !nombre || !descripcion) {
            return ctx.response.status = 400
        }

        if (!checkName(nombre)) {
            return ctx.response.status = 400
        }

        const tienda = await strapi.entityService.findOne('api::tienda.tienda', id, {
            populate: '*'
        })

        if (tienda !== null && tienda.admin_tienda.id === user.id) {
            const tiendaEditada = await strapi.entityService.update('api::tienda.tienda', id, {
                data: {
                    nombre: nombre,
                    descripcion: descripcion
                }
            })
            return ctx.response.status = 200
        }

        return ctx.response.status = 403

    }
}));
