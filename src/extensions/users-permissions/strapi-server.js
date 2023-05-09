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
            path: '/user/me/update',
            handler: 'user.updateMe',
            config: {
                prefix: '',
                policies: []
            }
        }
    )

    return plugin
}