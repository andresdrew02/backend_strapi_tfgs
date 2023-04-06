'use strict';

/**
 * max-ofertas service
 */

module.exports = {
    getMax: async () => {
        try{
            //pillamos las ofertas
            const ofertas = await strapi.entityService.findMany('api::oferta.oferta', {
                fields: ['precio_oferta']
            })
            const precios = []
            ofertas.map(e => precios.push(e.precio_oferta))
            const max = Math.max(...precios);
            return max
        }
        catch(err){
            return err
        }
    }
};
