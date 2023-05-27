///auth/forgot-password
'use strict';

function checkPassword(str) {
    let re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(str);
}

//middleware para establecer una política de contraseña y comprobar que el usuario sea mayor de 18 años
module.exports = (config, { strapi }) => {
    return async (ctx, next) => {
        if ((ctx.request.url === '/api/auth/reset-password/') && ctx.request.method === 'POST') {
            const password = ctx.request.body.password
            const passwordConfirmation = ctx.request.body.passwordConfirmation

            if (password !== passwordConfirmation){
                return ctx.throw(400, 'Las contraseñas no coinciden')
            }

            if (!checkPassword(password)) {
                console.log(password)
                console.log(checkPassword(password))
                return ctx.throw(400, 'La contraseña debe de tener mínimo 8 carácteres, con al menos una letra mayuscula, una letra minúscula, un número y un símbolo');
            }
            if (!checkPassword(passwordConfirmation)) {
                console.log('aki2')

                return ctx.throw(400, 'La contraseña debe de tener mínimo 8 carácteres, con al menos una letra mayuscula, una letra minúscula, un número y un símbolo');
            }
        }
        await next();
    };
};
