//modificamos el controlador de user-permissions, seteando un plugin (extension) del mismo
//para modificar solo el estado de recien creada
module.exports = (plugin) => {
    //update recien creado
    plugin.controllers.user.updateRecien = async (ctx) => {
        if (!ctx.state.user || !ctx.state.user.id) {
            return ctx.response.status = 401
        }
        await strapi.query('plugin::users-permissions.user').update({
            where: { id: ctx.state.user.id },
            data: {
                recien_creada: ctx.request.body.recien_creada
            }
        }).then((res) => {
            ctx.response.status = 200
        })
    }

    plugin.routes['content-api'].routes.push(
        {
            method: 'PUT',
            path: '/user/me',
            handler: 'user.updateRecien',
            config: {
                prefix: '',
                policies: []
            }
        }
    )

    //modificar perfil de usuario
    plugin.controllers.user.updateMe = async (ctx) => {
        if (!ctx.state.user || !ctx.state.user.id) {
            return ctx.response.status = 401
        }

        if (ctx.request.body.pais === undefined || ctx.request.body.ciudad === undefined ||
            ctx.request.body.poblacion === undefined || ctx.request.body.via === undefined ||
            ctx.request.body.calle === undefined || ctx.request.body.num === undefined ||
            ctx.request.body.cp === undefined || ctx.request.body.portal === undefined) {
            return ctx.response.status = 400
        }

        await strapi.entityService.update('plugin::users-permissions.user', ctx.state.user.id, {
            data: {
                nombre_completo: ctx.request.body.nombre_completo,
                direccion: {
                    calle: ctx.request.body.calle,
                    tipo_via: ctx.request.body.via,
                    numero: ctx.request.body.num,
                    cp: ctx.request.body.cp,
                    ciudad: ctx.request.body.ciudad,
                    poblacion: ctx.request.body.poblacion,
                    pais: ctx.request.body.pais,
                    portal: ctx.request.body.portal
                }
            }
        }).then((res) => {
            ctx.response.status = 200
        })
    }
    plugin.routes['content-api'].routes.push(
        {
            method: 'PUT',
            path: '/user/me/updateMe',
            handler: 'user.updateMe',
            config: {
                prefix: '',
                policies: []
            }
        }
    )

    //modificar contraseña
    plugin.controllers.user.changePassword = async (ctx) => {
        if (!ctx.state.user || !ctx.state.user.id) {
            throw new UnauthorizedError('No estás autorizado para realizar esta acción')
        }

        const user = await strapi.entityService.findOne('plugin::users-permissions.user', ctx.state.user.id)

        const { currentPassword, password, passwordConfirmation } = ctx.request.body

        if (currentPassword === undefined || password === undefined || passwordConfirmation === undefined) {
            return ctx.badRequest('Bad request', { message: 'Debe de introducir todos los parametros obligatorios.' })
        }

        if (password !== passwordConfirmation) {
            return ctx.badRequest('Bad request', { message: 'Las contraseñas no coinciden' })
        }

        if (user.provider !== 'local') {
            return ctx.badRequest('Bad request', { message: 'Las cuentas de Google no pueden cambiar sus contraseñas, ya que no tienen. Si desea tener una cuenta con contraseña propia, cierre sesión y cree otra cuenta con otra dirección de correo distinta, si desea usar esta dirección de correo, contacte con soporte técnico.' })
        }

        const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(currentPassword, user.password)

        if (!validPassword) {
            return ctx.badRequest('Bad request', { message: 'La contraseña introducida no coincide con su contraseña actual' })
        }

        const samePassword = await strapi.plugins['users-permissions'].services.user.validatePassword(password, user.password)

        if (samePassword) {
            return ctx.badRequest('Bad request', { message: 'La contraseña que ha introducido es la misma que su contraseña actual' })
        }

        let re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (!re.test(password)) {
            return ctx.badRequest('Bad request', { message: 'La contraseña no coincide con los criterios mínimos de seguridad, la contraseña debe de tener mínimo 8 carácteres, con al menos una letra mayuscula, una letra minúscula, un número y un símbolo' })
        }

        //const bcrypt = require("bcryptjs")
        /*
            Antes hacia falta hashear la contraseña y en el propio sevricio venía un metodo para hashearla, ahora
            el propio entityService lo hace internamente si detecta que el campo a editar es una contraseña
        */

        await strapi.entityService.update('plugin::users-permissions.user', ctx.state.user.id, {
            data: {
                resetPasswordToken: null,
                password: password
            }
        })
        return ctx.response.status = 200
    }

    plugin.routes['content-api'].routes.push(
        {
            method: 'POST',
            path: '/user/me/changePassword',
            handler: 'user.changePassword',
            config: {
                prefix: '',
                policies: []
            }
        }
    )

    //Checkear JWT
    plugin.controllers.user.checkToken = async (ctx) => {
        const { token } = JSON.parse(ctx.request.body)

        if (!token) {
            return ctx.response.status = 400
        }

        try {
            const obj = await strapi.plugins["users-permissions"].services.jwt.verify(token)
            const { id } = obj
            if (!id) {
                return ctx.response.status = 422
            }

            const user = await strapi.entityService.findOne('plugin::users-permissions.user', id)
            if (!user) {
                return ctx.response.status = 404
            }
        }
        catch (err) {
            return ctx.response.status = 400
        }
        return ctx.response.status = 200
    }

    plugin.routes['content-api'].routes.push(
        {
            method: 'POST',
            path: '/user/checkToken',
            handler: 'user.checkToken',
            config: {
                prefix: '',
                policies: []
            }
        }
    )

    plugin.controllers.user.checkResetPasswordToken = async (ctx) => {
        const body = ctx.request.body
        const { token } = JSON.parse(body)

        if (!token || token === undefined || token === null){
            return ctx.response.status = 404
        }

        try {
            const entry = await strapi.query('plugin::users-permissions.user').findOne({
                where: { resetPasswordToken: token }
            })
            if (entry === undefined || entry === null){
                return ctx.response.status = 404
            }
            return ctx.response.status = 200
        }
        catch (err) {
            return ctx.response.status = 404
        }
    }

    plugin.routes['content-api'].routes.push(
        {
            method: 'POST',
            path: '/user/checkResetToken',
            handler: 'user.checkResetPasswordToken',
            config: {
                prefix: '',
                policies: []
            }
        }
    )

    return plugin
}