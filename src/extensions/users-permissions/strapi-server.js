//modificamos el controlador de user-permissions, seteando un plugin (extension) del mismo
//para modificar solo el estado de recien creada
module.exports = (plugin) => {
    //update recien creado
    plugin.controllers.user.updateRecien = async (ctx) => {
        if (!ctx.state.user || !ctx.state.user.id){
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
    return plugin
}