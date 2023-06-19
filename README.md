# Crearte

## Tabla de contenidos

 - [Información general](#info)
 
 - [Caracteristicas](#cara)
 
 - [Diseño](#dise)
 
 - [Enlaces](#enla)
 
 - [Requisitos](#requi)
 
 - [Créditos](#credi)


<div id='info'/>

## Información general

### ❓ ¿Qué es Crearte?
**Es una plataforma e-Commerce** (en versión beta) realizada como proyecto de final de grado superior en Desarollo de Aplicaciones Web.

### ⁉️ ¿Por qué un e-Commerce?
En una plataforma de este tipo, debes de controlar muchas posibles situaciones que pueden ocurrir, por lo cual tienes que investigar o utilizar formas ingeniosas para poder solucionar los problemas que van surgiendo.
Además, **¿por qué no?**

### 💻 Tecnologías usadas
* **Frontend:** ha sido construido con **Next.JS 13**
* **Backend:** ha sido construido utilizando **Strapi** via RESTful
* **SGBD:** El SGBD puede migrarse fácilmente, el utilizado en el proyecto ha sido **Postgresql**
* **Otras:** Para implementar la *beta* del sistema de pagos, se ha utilizado **Stripe**


<div id='cara'/>

## Caracteristicas

### 🤔¿Qué se puede hacer actualmente?
Esta es una versión demostrativa de que se podría hacer en la plataforma, sin embargo, se permite.
1. **Autenticación** local.
1. **OAuth** mediante Google.
1. Recuperación de credenciales y **modificación de perfil**
1. **CRUD tiendas** virtuales.
1. **CRUD de productos** asociados a tiendas.
1. **CRUD de ofertas** asociadas a productos.
1. **Busqueda** de tiendas/ofertas.
1. **Pagos** a través de Stripe.

### 🔮 Futuras implementaciones.
Hacen falta muchas implementaciones para que esto se convierta en una versión la cual se pueda sacar a producción. Cosas las cuales, en este caso, son cosas menos relevantes para sacar una versión *beta*
1. Seguimiento de pedidos.
1. Responsividad para dispositivos móviles.
1. Panel de administración.
1. Edición/eliminación de las valoraciones asociadas a las tiendas. 
1. Controlar multicuentas con el mismo correo electrónico.
1. Despligue.

Entre otras...


<div id='dise'/>

## Diseño 

![Logo de Crearte.](https://github.com/andresdrew02/cliente_nextjs_tfgs/blob/main/src/img/logo.png?raw=true "Logo de Crearte")

### 🖌️ Frameworks utilizados.
Se ha utilizado TailwindCSS, ChakraUI y DaisyUI para estilar la plataforma.


<div id='enla'/>

## Enlaces

[Cliente](https://github.com/andresdrew02/cliente_nextjs_tfgs/)

[Servidor](https://github.com/andresdrew02/backend_strapi_tfgs)


<div id='requi'/>

## Requisitos
Necesitas tener instalado NPM para poder desplegar la plataforma.

Además, necesitas un SGBD y cambiar la configuración en el archivo *database.js* dentro de la carpeta *config* (Strapi)

Una vez hecho esto, puedes ejecutar para instalar las dependencias de Node

```
npm install
```

Para ejecutar el cliente en modo desarrollo

```
npm run dev
```

Para ejecutar Strapi
```
npm strapi develop
```
**o**
```
yarn strapi develop
```

<div id='credi'/>

## Créditos
Andrés Del Cerro, yo 😄


