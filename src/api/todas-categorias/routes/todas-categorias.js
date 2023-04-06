module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/todasCategorias',
     handler: 'todas-categorias.getTodasCategorias',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
