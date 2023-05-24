'use strict';

/**
 * producto controller
 */
const nameRegex = /^[A-Za-z\s]{0,100}$/
const descripcionRegex = /^[a-zA-Z0-9!@#$%^&*()_+={[}\]|\\:;"'<,>.?/ -]{50,200}$/
const decimalRegex = /^\d+(\.\d+)?$/
const numberRegex = /^\d+$/
const anotherName = /^.{5,50}$/
const anotherDescripcion = /^[^\n]{50,500}$/

const checkRegexp = (str, regexp) => {
    const checker = new RegExp(regexp)
    return checker.test(str)
}

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::producto.producto', ({ strapi }) => ({
    async getProductosPorTienda(ctx) {
        const { slug } = ctx.params
        const user = ctx.state.user

        if (!user) {
            return ctx.response.status = 403
        }


        if (!user.id) {
            return ctx.response.status = 403
        }

        //checkeamos que la tienda pertenece a este usuario
        const tienda = await strapi.db.query('api::tienda.tienda').findOne({
            select: ['id'],
            where: {
                slug: slug,
                admin_tienda: {
                    id: user.id
                }
            },
            populate: {
                admin_tienda: {
                    select: ['id']
                }
            }
        })

        if (tienda === null || tienda.admin_tienda.id !== ctx.state.user.id) {
            return ctx.response.status = 403
        }

        const productos = await strapi.db.query('api::producto.producto').findMany({
            where: {
                tienda: {
                    id: tienda.id
                }
            },
            populate: {
                categoria: {
                    select: '*'
                }
            }
        })

        const sanitizedResults = await this.sanitizeOutput(productos, ctx)
        return this.transformResponse(sanitizedResults)
    },
    async update(ctx) {
        const user = ctx.state.user
        const { id } = ctx.params
        const body = ctx.request.body

        if (!user) {
            return ctx.response.status = 403
        }

        if (!user.id) {
            return ctx.response.status = 403
        }

        if (!id) {
            return ctx.response.status = 400
        }

        if (body.nombre === undefined || body.descripcion === undefined || body.categoria === undefined) {
            return ctx.response.status = 400
        }


        if (!checkRegexp(body.nombre, nameRegex)) {
            return ctx.response.status = 400
        }

        if (!checkRegexp(body.descripcion, descripcionRegex)) {
            return ctx.response.status = 400
        }

        const productoOriginal = await strapi.db.query('api::producto.producto').findOne({
            where: {
                id: id,
                tienda: {
                    admin_tienda: {
                        id: user.id
                    }
                }
            },
            populate: {
                tienda: {
                    populate: {
                        admin_tienda: true
                    }
                }
            }
        })

        if (productoOriginal === null) {
            return ctx.response.status(403)
        }

        if (!productoOriginal.tienda.admin_tienda.id === user.id) {
            return ctx.response.status(403)
        }

        const productoEditado = await strapi.entityService.update('api::producto.producto', productoOriginal.id, {
            data: {
                nombre: body.nombre,
                descripcion: body.descripcion,
                precio_unidad: body.ppu,
                categoria: {
                    id: body.categoria
                }
            }
        })

        return ctx.response.status = 200
    },
    async deleteMany(ctx) {
        const user = ctx.state.user
        const body = ctx.request.body

        if (!user) {
            return ctx.response.status = 403
        }

        if (!user.id) {
            return ctx.response.status = 403
        }

        //primero conseguimos las ofertas asociadas, las borramos y despues borramos los productos
        body.forEach(async e => {
            let ofertaItems;
            try {
                ofertaItems = await strapi
                    .query("api::oferta.oferta")
                    .findMany({ where: { productos: { id: e.id } } });
            } catch (ex) {
                console.error(ex);
                return ctx.responses.status = 500
            }

            try {
                for (const oferta of ofertaItems) {
                    await strapi
                        .query("api::oferta.oferta")
                        .delete({ where: { id: oferta.id } });
                }
            } catch (ex) {
                console.error(ex);
                return ctx.responses.status = 500
            }

            try {
                await strapi.entityService.delete('api::producto.producto', e.id)
            } catch (ex) {
                console.error(ex)
                return ctx.responses.status = 500
            }

        })

        return ctx.response.status = 200
    },
    async create(ctx) {
        const user = ctx.state.user
        const body = ctx.request.body
        const { nombre, descripcion, ppu, categoria, idTienda } = ctx.request.body

        if (!user) {
            return ctx.response.status = 403
        }

        if (!user.id) {
            return ctx.response.status = 403
        }

        //validar los datos
        if (!checkRegexp(nombre, anotherName) || !checkRegexp(descripcion, anotherDescripcion) || !checkRegexp(ppu, decimalRegex) || !checkRegexp(categoria, numberRegex) || !checkRegexp(idTienda, numberRegex)) {
            return response.status(400).send("")
        }

        //checkear que la categoria exista
        const db_categoria = await strapi.entityService.findOne('api::categoria.categoria',categoria)
        if (db_categoria === null){
            return response.status(400).send("")
        }

        //la tienda pertenece al usuario que esta intentando crear el producto
        const tienda = await strapi.entityService.findOne('api::tienda.tienda', idTienda, {
            fields: ['*'],
            populate: '*'
        });

        if (user.id !== tienda.admin_tienda.id) {
            ctx.response.status = 403
        }

        //checkeamos que no tiene mas de 20 productos creados en la tienda
        const productos = await strapi.db.query('api::producto.producto').findMany({
            select: ['*'],
            where: {
                tienda: {
                    id: idTienda
                }
            },
            orderBy: { publishedAt: 'DESC' }
        });

        if (productos.length >= 20){
            ctx.response.status = 400
        }else{
            const productoCreado = await strapi.entityService.create('api::producto.producto', {
                data: {
                  nombre: nombre,
                  descripcion: descripcion,
                  precio_unidad: ppu,
                  tienda: {
                    id: idTienda
                  },
                  categoria: categoria
                },
              });
              return this.transformResponse(productoCreado)
        }

        return ctx.response.status = 500

    }
}));
