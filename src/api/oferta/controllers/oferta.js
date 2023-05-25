'use strict';

/**
 * oferta controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const utils = require('@strapi/utils')
const { ForbiddenError, ApplicationError } = utils.errors


const minPriceRegex = /^(5|[6-9]\d*|\d+\.[0-9]{1,})\s?€?$/
const minStockRegex = /^[1-9]\d*$/
const nombreRegex = /^[A-Za-z ]{10,30}$/
const descripcionRegex = /^.{50,250}$/

const checkRegexp = (str, regexp) => {
    const checker = new RegExp(regexp)
    return checker.test(str)
}

module.exports = createCoreController('api::oferta.oferta', ({ strapi }) => ({
    async getProductos(productos) {
        let precioFinalOferta = 0
        productos.map(async e => {
            const producto = await strapi.entityService.findOne('api::producto.producto', e)
            precioFinalOferta += producto.precio_unidad
        })
        return precioFinalOferta
    },
    async getOfertasByTienda(ctx) {
        const { slug } = ctx.params
        const { page = 1, pageSize = 10 } = ctx.request.query
        const user = ctx.state.user

        if (!user) {
            return ctx.response.status = 403
        }

        if (!user.id) {
            return ctx.response.status = 403
        }

        if (!slug) {
            return ctx.response.status = 403
        }

        const ofertas = await strapi.db.query('api::oferta.oferta').findMany({
            where: {
                tienda: {
                    slug: slug
                }
            },
            populate: true,
            offset: page > 0 ? (page - 1) * pageSize : 0,
            limit: pageSize
        })

        console

        return this.transformResponse(ofertas)
    },
    async create(ctx) {
        //precio minimo 5 pavos, stock minimo 1, nombre minimo 10 caracteres max 30, descripcion min 50 max 250
        const user = ctx.state.user
        const body = ctx.request.body
        const { nombre, descripcion, precio, stock, precioManual, productos, idTienda } = JSON.parse(body.data)
        const files = ctx.request.files

        if (!user) {
            throw new ForbiddenError('No estas autorizado para hacer esta acción')
        }

        if (!user.id) {
            throw new ForbiddenError('No estas autorizado para hacer esta acción')
        }

        const tienda = await strapi.entityService.findOne('api::tienda.tienda', idTienda, {
            populate: '*'
        })

        //Checkeamos que la tienda exista y que pertenezca a este usuario
        if (tienda === null || tienda.admin_tienda.id !== user.id) {
            throw new ForbiddenError('No estas autorizado para hacer esta acción')
        }

        //checkeamos que haya productos para añadir en la oferta
        if (productos.length <= 0) {
            throw new ApplicationError('Para crear necesitas seleccionar mínimo un producto.')
        }

        //checkear data
        let precioFinalOferta = 0
        const db_productos = await strapi.entityService.findMany('api::producto.producto', {
            filters: {
                id: {
                    $in: productos
                }
            }
        })

        //Cuando solo se selecciona un producto, viene como un integer sin array
        if (db_productos !== null && db_productos.length === 1) {
            if (Array.isArray(productos)) {
                throw new ApplicationError('Alguno de los productos seleccionados es incorrecto.')
            } else {
                if (db_productos[0].id !== parseInt(productos)) {
                    console.log(db_productos[0].id, productos)
                    throw new ApplicationError('Alguno de los productos seleccionados es incorrecto.')
                }
            }
        } else {
            if (db_productos.length !== productos.length) {
                throw new ApplicationError('Alguno de los productos seleccionados es incorrecto.')
            }
        }

        db_productos.map(e => precioFinalOferta += e.precio_unidad)

        if (precioManual && precioManual !== '' && precioManual !== undefined && precioManual !== null) {
            precioFinalOferta = precioManual
        }

        if (!checkRegexp(nombre, nombreRegex)) {
            throw new ApplicationError('El nombre no es válido, debe de tener entre 10 y 30 letras')
        }

        if (!checkRegexp(descripcion, descripcionRegex)) {
            throw new ApplicationError('La descripción no es válida, debe de tener entre 50 y 250 caracteres')
        }

        precioFinalOferta = parseFloat(precioFinalOferta).toFixed(2)
        if (!checkRegexp(precioFinalOferta, minPriceRegex)) {
            throw new ApplicationError('El precio de la oferta debe de ser mínimo de 5€')
        }

        if (!checkRegexp(stock, minStockRegex)) {
            throw new ApplicationError('Mínimo debe de haber 1 de stock para poder publicar la oferta')
        }

        //checkeamos imagenes
        if (!files) {
            throw new ApplicationError('Mínimo debe de haber una foto en la oferta')
        }

        for (const [key, value] of Object.entries(files)) {
            if (!Array.isArray(value) && !value) {
                throw new ApplicationError('Ha ocurrido un error inesperado')
            }
            if (value.length > 5) {
                throw new ApplicationError('Solo se pueden subir un máximo de 5 fotos por oferta')
            }
            if (value.length <= 0) {
                throw new ApplicationError('Mínimo debe de haber una foto en la oferta')
            }
            if (Array.isArray(value)) {
                value.map(e => {
                    if (!e.type.includes('image')) {
                        throw new ApplicationError('Solo se pueden subir imagenes')
                    }
                })
            } else {
                if (!value.type.includes('image')) {
                    throw new ApplicationError('Solo se pueden subir imagenes')
                }
            }
        }

        try {
            const oferta = await strapi.entityService.create('api::oferta.oferta', {
                data: {
                    nombre: nombre,
                    descripcion: descripcion,
                    stock: stock,
                    tienda: idTienda,
                    precio_oferta: precioFinalOferta,
                    productos: productos
                },
                files: {
                    fotos: files['files.media']
                }
            })
            if (oferta === null) {
                throw new ApplicationError('Ha ocurrido un error inesperado')
            }
            return this.transformResponse(oferta)
        }
        catch (err) {
            throw new ApplicationError('Ha ocurrido un error inesperado')
        }
    },
    async update(ctx) {
        //precio minimo 5 pavos, stock minimo 1, nombre minimo 10 caracteres max 30, descripcion min 50 max 250
        const user = ctx.state.user
        const body = ctx.request.body
        const { id: idOferta } = ctx.params
        const { nombre, descripcion, precio, stock, precioManual, productos, idTienda } = JSON.parse(body.data)
        const files = ctx.request.files

        if (!user) {
            throw new ForbiddenError('No estas autorizado para hacer esta acción')
        }

        if (!user.id) {
            throw new ForbiddenError('No estas autorizado para hacer esta acción')
        }

        const tienda = await strapi.entityService.findOne('api::tienda.tienda', idTienda, {
            populate: '*'
        })

        //Checkeamos que la tienda exista y que pertenezca a este usuario
        if (tienda === null || tienda.admin_tienda.id !== user.id) {
            throw new ForbiddenError('No estas autorizado para hacer esta acción')
        }

        //Checkeamos que la oferta existe
        if (!idOferta) {
            throw new ApplicationError('Debes especificar una oferta para poder editarla')
        }

        const oferta_db = await strapi.entityService.findOne('api::oferta.oferta', idOferta, {
            populate: '*'
        })
        if (oferta_db === null) {
            throw new ApplicationError('La oferta que está intentando editar no existe')
        }
        const fotos = oferta_db.fotos

        //checkear data
        let precioFinalOferta = 0
        if (!productos) {
            throw new ApplicationError('Debe seleccionar productos')
        }

        const db_productos = await strapi.entityService.findMany('api::producto.producto', {
            filters: {
                id: {
                    $in: productos
                }
            }
        })

        if (db_productos !== null && db_productos.length === 1) {
            if (Array.isArray(productos)) {
                throw new ApplicationError('Alguno de los productos seleccionados es incorrecto.')
            } else {
                if (db_productos[0].id !== parseInt(productos)) {
                    console.log(db_productos[0].id, productos)
                    throw new ApplicationError('Alguno de los productos seleccionados es incorrecto.')
                }
            }
        } else {
            if (db_productos.length !== productos.length) {
                throw new ApplicationError('Alguno de los productos seleccionados es incorrecto.')
            }
        }

        db_productos.map(e => precioFinalOferta += e.precio_unidad)

        if (precioManual && precioManual !== '' && precioManual !== undefined && precioManual !== null) {
            precioFinalOferta = precioManual
        }

        if (!checkRegexp(nombre, nombreRegex)) {
            throw new ApplicationError('El nombre no es válido, debe de tener entre 10 y 30 letras')
        }

        if (!checkRegexp(descripcion, descripcionRegex)) {
            throw new ApplicationError('La descripción no es válida, debe de tener entre 50 y 250 caracteres')
        }

        precioFinalOferta = parseFloat(precioFinalOferta).toFixed(2)
        if (!checkRegexp(precioFinalOferta, minPriceRegex)) {
            throw new ApplicationError('El precio de la oferta debe de ser mínimo de 5€')
        }

        if (!checkRegexp(stock, minStockRegex)) {
            throw new ApplicationError('Mínimo debe de haber 1 de stock para poder publicar la oferta')
        }

        //checkeamos imagenes
        if (!files) {
            throw new ApplicationError('Mínimo debe de haber una foto en la oferta')
        }

        for (const [key, value] of Object.entries(files)) {
            if (!Array.isArray(value) && !value) {
                throw new ApplicationError('Ha ocurrido un error inesperado')
            }
            if (value.length > 5) {
                throw new ApplicationError('Solo se pueden subir un máximo de 5 fotos por oferta')
            }
            if (value.length <= 0) {
                throw new ApplicationError('Mínimo debe de haber una foto en la oferta')
            }
            if (Array.isArray(value)) {
                value.map(e => {
                    if (!e.type.includes('image')) {
                        throw new ApplicationError('Solo se pueden subir imagenes')
                    }
                })
            } else {
                if (!value.type.includes('image')) {
                    throw new ApplicationError('Solo se pueden subir imagenes')
                }
            }
        }

        try {
            if (fotos !== null) {
                fotos.map(async (e) => await strapi.plugins['upload'].services.upload.remove(e))
            }
            const oferta = await strapi.entityService.update('api::oferta.oferta', oferta_db.id, {
                data: {
                    nombre: nombre,
                    descripcion: descripcion,
                    stock: stock,
                    tienda: idTienda,
                    precio_oferta: precioFinalOferta,
                    productos: productos
                },
                files: {
                    fotos: files['files.media']
                }
            })
            if (oferta === null) {
                throw new ApplicationError('Ha ocurrido un error inesperado')
            }
            return this.transformResponse(oferta)
        }
        catch (err) {
            throw new ApplicationError('Ha ocurrido un error inesperado')
        }
    },
    async delete(ctx) {
        const user = ctx.state.user
        const { id } = ctx.params
        const { slug } = ctx.request.query


        if (!user) {
            throw new ForbiddenError('No estas autorizado para hacer esta acción')
        }

        if (!user.id) {
            throw new ForbiddenError('No estas autorizado para hacer esta acción')
        }

        if (!id || !slug){
            throw new ApplicationError('Ha ocurrido un error inesperado')
        }

        //la tienda existe
        const tienda = await strapi.db.query('api::tienda.tienda').findOne({
            where:{
                slug: slug
            },
            populate:{
                admin_tienda: true
            }
        })

        //Checkeamos que la tienda exista y que pertenezca a este usuario
        if (tienda === null || tienda.admin_tienda.id !== user.id) {
            throw new ForbiddenError('No estas autorizado para hacer esta acción')
        }

        //la oferta existe
        const oferta_db = await strapi.entityService.findOne('api::oferta.oferta',id,{
            populate: {
                tienda: true
            }
        })
        
        if (oferta_db.tienda.id !== tienda.id){
            throw new ForbiddenError('No estas autorizado para hacer esta acción')
        }
        
        const oferta_borrada = await strapi.entityService.delete('api::oferta.oferta',id)
        if (oferta_borrada === null){
            throw new ApplicationError('Ha ocurrido un error inesperado')
        }
        return ctx.response.status = 200
    }
}));
