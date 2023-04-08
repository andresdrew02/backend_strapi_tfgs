'use strict';
//strapi.log.info('In registerMiddleware middleware: '+ ctx.request);

function getAge(DOB) {
  var today = new Date();
  var birthDate = new Date(DOB);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }    
  return age;
}

function checkPassword(str){
    let re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(str);
}

function checkCp(str){
  let re = /^(?:0[1-9]\d{3}|[1-4]\d{4}|5[0-2]\d{3})$/
  return re.test(str)
}

//middleware para establecer una política de contraseña y comprobar que el usuario sea mayor de 18 años
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if ((ctx.request.url === '/api/auth/local/register') && ctx.request.method === 'POST'){
      const fecha = ctx.request.body.fecha_nacimiento
      const pwd = ctx.request.body.password
      const codigopostal = ctx.request.body.direccion.cp
      if (fecha === null || ''){
        return ctx.throw(400, ' La fecha de nacimiento es obligatoria. ');
      }
      if (getAge(fecha) < 18){
        return ctx.throw(400, ' Debes de ser mayor de 18 años para registrarte. ');
      }
      if (!checkPassword(pwd)){
        return ctx.throw(400, 'La contraseña debe de tener mínimo 8 carácteres, con al menos una letra mayuscula, una letra minúscula, un número y un símbolo');
      }
      if (!checkCp(codigopostal)){
        return ctx.throw(400, 'El código postal debe de ser válido');
      }
    } 
    await next();
  };
};
