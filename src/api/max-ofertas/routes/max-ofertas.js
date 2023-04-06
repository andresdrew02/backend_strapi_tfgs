module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/maxOfertas',
     handler: 'max-ofertas.maxOfertas',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
