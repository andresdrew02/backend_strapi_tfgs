'use strict';

const utils = require('@strapi/utils')
const { ForbiddenError, ApplicationError } = utils.errors
const stripe = require('stripe')("sk_test_51NBeBsLTLzvUicBUjtu3pGwEkfWECbnpk4v6ROYaOl6DdR2svYDwFvwpeArJwFY0cjcHOSV0ORSIw1bOiRWrtIXn007S05QkYN")
/**
 * pedido controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::pedido.pedido', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user
        const pedido = ctx.request.body

        if (!user) {
            throw new ForbiddenError('No tiene permisos para realizar esta acción')
        }


        if (!user.id) {
            throw new ForbiddenError('No tiene permisos para realizar esta acción')
        }

        if (!pedido || !Array.isArray(pedido) || pedido.length <= 0 || !pedido[0].idOferta || !pedido[0].cantidad) {
            throw new ApplicationError('Ha ocurrido un error al crear el pago')
        }

        //checkeamos que las ofertas existen
        const ofertas_db = []
        const metadata = {
            productos: []
        }
        for (let i = 0; i < pedido.length; i++) {
            const oferta = await strapi.entityService.findOne('api::oferta.oferta', pedido[i].idOferta, {
                populate: {
                    fotos: true
                }
            })
            if (oferta === null) {
                throw new ForbiddenError('Alguna de las ofertas especificadas ya no existe, inténtelo de nuevo mas tarde')
            }
            //checkeamos las cantidades de las ofertas
            if (pedido[i].cantidad > oferta.stock) {
                pedido[i].cantidad = oferta.stock
            }
            ofertas_db.push({
                price_data: {
                    unit_amount: oferta.precio_oferta * 100,
                    currency: 'eur',
                    product_data: {
                        name: oferta.nombre,
                        description: oferta.descripcion,
                        images: [`http://localhost:1337${oferta.fotos[0].url}`]
                    }
                },
                quantity: pedido[i].cantidad
            })
            metadata.productos.push({
                idOferta: oferta.id,
                cantidad: pedido[i].cantidad
            })
        }

        const lineItems = ofertas_db

        //controlar las cantidades
        const cantidadesPorId = pedido.reduce((accumulator, current) => {
            const { idOferta, cantidad } = current;
            const currentCantidad = accumulator[idOferta] || 0;
            return {
              ...accumulator,
              [idOferta]: currentCantidad + cantidad,
            };
          }, {});
          
          const duplicados = pedido.filter((item) => cantidadesPorId[item.idOferta] > item.cantidad);
          
          //checkeamos la cantidad todal y la cantidad en stock
          if (duplicados.length > 0){
            for(const [key,value] of Object.entries(cantidadesPorId)){
                const oferta_db = await strapi.entityService.findOne('api::oferta.oferta',key)
                if (oferta_db.stock < value){
                    throw new ForbiddenError('El stock de una oferta es menor que la cantidad total del pédido, revise su pedido e inténtelo de nuevo')
                }
            }
          }
        //creamos la sesión del pago y redireccionamos al usuario
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            success_url: "http://localhost:1337/api/pedidos/verificarPago?session_id={CHECKOUT_SESSION_ID}",
            cancel_url: "http://localhost:1337/api/pedidos/cancelarPago",
            shipping_address_collection: {
                allowed_countries: ['ES'],
            },
            line_items: lineItems,
            payment_method_types: ["card"],
            metadata: {
                usuario: user.id,
                data: JSON.stringify(metadata.productos)
            }
        })

        return ctx.body = {
            paymentUrl: session.url
        }
    },
    async verificarPago(ctx) {
        const { session_id } = ctx.query
        const URL_ERROR = 'http://localhost:3000/error/errorPage'
        const URL_EXITO = 'http://localhost:3000/success?msg=¡Pronto%20podrá%20disfrutar%20de%20el!'

        //verificamos la sesión
        const session = await stripe.checkout.sessions.retrieve(session_id)
        if (session === null){
            return ctx.redirect(`${URL_ERROR}?msg=ID%20de%20sesión%20no%20establecida`)
        }

        //verificamos que no se haya confirmado ya este id
        const pedido_db = await strapi.db.query('api::pedido.pedido').findOne({
            where:{
                stripe_id: session_id
            }
        })

        if (pedido_db !== null){
            return ctx.redirect(`${URL_ERROR}?msg=Este%20pedido%20ya%20ha%20sido%20confirmado...`)
        }

        const { metadata, customer_details, amount_total, payment_method_types } = session
        const data = JSON.parse(metadata.data)
        const idUsuario = metadata.usuario
        let cantidadTotal = 0
        let idOfertas = []
        data.map(e => {
            idOfertas.push(e.idOferta)
            cantidadTotal += e.cantidad
        })

        //creamos el pedido
        const pedido = await strapi.entityService.create('api::pedido.pedido',{
            data:{
                usuario: idUsuario,
                precio_final: amount_total/100,
                cantidad_final: cantidadTotal,
                metodo_pago: payment_method_types[0],
                estado: 'pagado',
                ofertas: idOfertas,
                direccion:[{
                    calle: customer_details.address.line1 + ' ' + customer_details.address.line2,
                    ciudad: customer_details.address.city,
                    cp: customer_details.address.postal_code,
                    pais: customer_details.address.city,
                    poblacion: customer_details.address.state,
                    tipo_via: '',
                    numero: customer_details.address.line1 + ' ' + customer_details.address.line2

                }],
                nombre_facturacion: customer_details.name,
                email_facturacion: customer_details.email,
                tlfo_facturacion: customer_details.phone,
                OfertasCantidad: metadata.data,
                stripe_id: session_id
            }
        })

        const result = data.reduce((obj, item) => {
          if (!obj[item.idOferta]) {
            obj[item.idOferta] = 0;
          }
          obj[item.idOferta] += item.cantidad;
          return obj;
        }, {});
        
        for(const [key,value] of Object.entries(result)){
            const oferta_db = await strapi.entityService.findOne('api::oferta.oferta',key)
            if (oferta_db.stock <= value){
                await strapi.entityService.delete('api::oferta.oferta',key)
            }else{
                await strapi.entityService.update('api::oferta.oferta',key,{
                    data:{
                        stock: oferta_db.stock - value
                    }
                })
            }
        }

        //redireccionar como pago realizado
        return ctx.redirect(URL_EXITO)
    }
}));
