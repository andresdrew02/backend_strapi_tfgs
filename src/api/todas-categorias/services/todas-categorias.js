'use strict';

/**
 * todas-categorias service
 */

module.exports = {
    getTodas: async () => {
        try{
            //pillamos las categorias de las ofertas publicadas
            const categorias = await strapi.entityService.findMany('api::oferta.oferta',{
                fields: ['id'],
                populate: {
                    producto: {
                        fields: ['categoria']
                    }
                },
            })
            const categoriasDistintas = []
            categorias.map(e => {
                const cat = `${e.producto.categoria.substring(0,1).toUpperCase()}${e.producto.categoria.substring(1)}`
                if (!categoriasDistintas.includes(cat)) categoriasDistintas.push(cat)
            })
            return categoriasDistintas
        }
        catch(err){
            return err
        }
    }
};
