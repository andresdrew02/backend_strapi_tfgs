module.exports = {
    routes: [
      { // Path defined with an URL parameter
        method: 'GET',
        path: '/tienda/productos/:slug', 
        handler: 'producto.getProductosPorTienda',
        config:{
            policies: []
        }
      },
      { // Path defined with an URL parameter
        method: 'POST',
        path: '/tienda/productos/deleteMany', 
        handler: 'producto.deleteMany',
        config:{
            policies: []
        }
      }
    ]
  }