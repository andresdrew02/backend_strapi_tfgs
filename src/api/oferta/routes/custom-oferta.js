module.exports = {
    routes: [
      { // Path defined with an URL parameter
        method: 'GET',
        path: '/tienda/ofertas-tienda/:slug', 
        handler: 'oferta.getOfertasByTienda',
        config:{
            policies: []
        }
      }
    ]
  }