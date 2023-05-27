module.exports = {
    routes: [
      { // Path defined with an URL parameter
        method: 'GET',
        path: '/tienda/me', 
        handler: 'tienda.findMyTiendas',
        config:{
            policies: []
        }
      },
      {
        method: 'POST',
        path: '/tienda/:slug/valorar', 
        handler: 'tienda.ponerValoracion',
        config:{
            policies: []
        }
      },
    ]
  }