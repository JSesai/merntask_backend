// const express = require('express');//modulo con common js
import express from 'express';  //exportamos espress con ES6
import conectarBD from './config/db.js'; //importamos el archivo de coneccion
import dotenv from 'dotenv'; //importamos dotenv importado anteriormente con npm i dotenv
import cors from 'cors'; //importamos cors previamente instalado con npm i cors
import usuarioRoutes from './routes/usuarioRoutes.js' //importamos el archivo que contiene las rutas y metodos a ejecutar dependiendo de la peticion
import proyectoRoutes from './routes/proyectoRoutes.js'; //importamos el archivo que contiene las rutas y metodos a ejecutar dependiendo de la peticion
import tareaRoutes from './routes/tareaRoutes.js'; //importamos el archivo que contiene las rutas y metodos a ejecutar dependiendo de la peticion

const app = express(); //hacenos uso de expres
app.use(express.json()); //habilitamos para que se puedan leer datos que llegan via request en formato json
dotenv.config(); //con esto busca el archivo .env

conectarBD(); //mandamos a llamar a la fn que hace la conexion

//configuracion de cors
//creamos un whitelist con un arreglo para determinar quienes se pueden conectar al backend, el nombre esta en .env
const whitelist = [process.env.FRONTEND_URL];

//opciones del cors
const corsOptions = {
    origin: function (origin, callback) { //origen de la peticion genera una fn que toma el origen y un callback que bloquea o permite la peticion
        //console.log(origin); //imprime origin en consola
        if (whitelist.includes(origin)) { //si el origen se encuentra en la lista blanca puede consultar la api
            callback(null, true); //primer parametro es de error y segundo de acceso
        } else {//caso contrario no esta permitido
            callback(new Error("Error de cors"));
        }
    }
}

app.use(cors(corsOptions)); //hacemos uso del cors y le pasamos las opciones definidas anteriormente

//Routing. Use soporta todos lo verbs http. hace referencia a la url solicitada y al metodo que se ejecuta esto es util para que en un archivo tengas separadas las rutas con los distintos tipos de verbs
app.use("/api/usuarios", usuarioRoutes);

//Routing. Use soporta todos lo verbs http. hace referencia a la url solicitada y al metodo que se ejecuta esto es util para que en un archivo tengas separadas las rutas con los distintos tipos de verbs
app.use("/api/proyectos", proyectoRoutes);

//Routing. Use soporta todos lo verbs http. hace referencia a la url solicitada y al metodo que se ejecuta esto es util para que en un archivo tengas separadas las rutas con los distintos tipos de verbs
app.use("/api/tareas", tareaRoutes);

const PORT = process.env.PORT || 4000; // cuando esta en produccion se crea el puerto y si no toma el valor 4000

//pone a la escucha el puerto
const servidor = app.listen(PORT, () => {
    console.log('servidor corriendo desde el puerto', PORT);
})

//usamos sket.io instalado previamente con npm i socket.io para el server y npm socket.io-client para el front
import {Server} from 'socket.io' //importamos Server para poder crear un server usando socket io
import Proyecto from './models/proyecto.js';
//creamos un servidor y pasamos el servidor que hemos creado anterioirmente con express
const io = new Server(servidor, { //definimos la configuracion en este objeto
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
});

//se detecta cuando abre conexion
io.on('connection', (socket)=>{
    console.log('Conectado a Socket Io');

    //definir los enventos de socket io
    socket.on('abrir proyecto', (proyecto)=>{
        console.log('abre proyecto->', proyecto);
        socket.join(proyecto); //join guarda la referencia para que se responda a la referencia y no a todos 
        
    });

    socket.on('nueva tarea', (tarea)=> {
        console.log('desde socket::',tarea);
        const proyecto = tarea.proyecto; //extraemos el id del proyecto para usarlo como evento
        // console.log(proyecto);
        socket.to(proyecto).emit('tarea agregada', tarea); //tenemos el evento del proyecto y emitimos tarea nombrado como tarea agregada  hacia el frontend
    });

    //escucha el evento eliminar tarea
    socket.on('eliminar tarea', tarea => {
        const proyecto = tarea.proyecto;//extraemos el id del proyecto para que las personas que tengan abierto ese proyecto vean la actualizacion en tiempo real
        socket.to(proyecto).emit('tarea eliminada', tarea); //para los que estan en la sala de ese proyecto emite el evento tarea eliminada por lo que en el front hay que capturar ese emit
    });

    //escucha el evento para actualizar tarea y emitir la misma tarea que recibe que ya es la tarea actualizada y la manda al room para que todos los que estan en la sala puedan ver la actualizacion en tiempo real
    socket.on('actualizar tarea', tarea => { //escucha evento y recibe una tarea
        // console.log('responde a ->',tarea.proyecto._id);
        const proyecto = tarea.proyecto._id; //extremos el id del proyecto para que a ese proyecto sea al que se le responda 
        socket.to(proyecto).emit('tarea actualizada', tarea); //para los que estan en ese proyecto se emite el evento tarea actualizada pasandole la tarea

    });

    //escucha evento completar tarea y retorna la misma tarea al room de ese proyecto
    socket.on('completar tarea', tarea => {
        console.log(tarea);
        const proyecto = tarea.proyecto._id; //extremos el id del proyecto para que a ese proyecto sea al que se le responda 
        socket.to(proyecto).emit('tarea completada', tarea); //para los que estan en ese proyecto se emite el evento tarea completada pasandole la tarea

    });


});



