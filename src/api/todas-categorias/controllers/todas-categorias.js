'use strict';

/**
 * A set of functions called "actions" for `max-ofertas`
 */

module.exports = {
  async getTodasCategorias(ctx,next) {
    try{
      const data = await strapi.service('api::todas-categorias.todas-categorias').getTodas()
      ctx.body = data
    }catch(err){
      ctx.badRequest('Page report controller error',{moreDetails: err})
    }
  }
};
