//archivo de configuracion para conectar a la bd
import mongoose from "mongoose";

const conectarBD = async () => {
    try {
        //se hace la coneccion con ayuda de mongoose que ya fue instalado con npm i mongoose, el metodo connect recibe 2 parametros: la cadena de conexion la optienes de atlasy otras opciones
        const conecction = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        const url = `${conecction.connection.host} : ${conecction.connection.port}`;
        console.log('Mongo db conectado en:', url);
        console.log('Mongo Uri:', process.env.MONGO_URI);
    } catch (error) {
        console.log('Error:', error.message);
        process.exit(1);
    }
}

export default conectarBD;

