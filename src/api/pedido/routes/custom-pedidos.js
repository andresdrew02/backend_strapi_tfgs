module.exports = {
    routes: [
      { // Path defined with an URL parameter
        method: 'GET',
        path: '/pedidos/verificarPago', 
        handler: 'pedido.verificarPago',
        config:{
            policies: []
        }
      }
    ]
  }