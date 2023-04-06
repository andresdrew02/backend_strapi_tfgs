'use strict';

/**
 * A set of functions called "actions" for `max-ofertas`
 */

module.exports = {
  async maxOfertas(ctx,next) {
    try{
      const data = await strapi.service('api::max-ofertas.max-ofertas').getMax()
      ctx.body = data
    }catch(err){
      ctx.badRequest('Page report controller error',{moreDetails: err})
    }
  }
};
