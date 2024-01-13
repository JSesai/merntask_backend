import mongoose from "mongoose";
import Proyecto from "../models/proyecto.js"; //importamos el modelo de Proyecto
import Usuario from "../models/Usuario.js";


//obtiene todos los proyectos 
const obtenerProyectos = async (req, res) => {
    //recuperamos los proyectos con find y con where encuentra creador que sea igual con el id del usuario autenticado y por ultimo usamos un select - ignorando las tareas, para que no envie ese campo
    const proyectos = await Proyecto.find(
        //utilizamos un or para que pueda acceder colaboradores o creadores del proyecto, por lo que ya no es necesario el where ni el equals
        {'$or': [
            { colaboradores:{ $in: req.usuario }},
            { creador:{ $in: req.usuario }}
        ]})
        // .where('creador')
        // .equals(req.usuario)
        .select("-tareas");
    res.json(proyectos);
}

//fn obtener un proyecto
const obtenerProyecto = async (req, res) => {
    //extraemos y asignamos a const id el valor de id del proyecto que llega por url
    const { id } = req.params;

    //validamos que el el id tenga un formato valido de mongo db y lo hacemos con 
    const valid = mongoose.Types.ObjectId.isValid(id);
    //si no es valido
    if (!valid) {
        const error = new Error("PROYECTO NO EXISTE");
        return res.status(404).json({ msg: error.message })
    }
    //consultamos si el proyecto existe por medio de su Id
    const proyecto = await Proyecto.findById(id)
    //este populate se usa cuando las tareas non tenian un populate para completado que esta referencia esta en la tarea y no en el proyecto .populate("tareas")//concatenamos los populate con el nombre del campo que se llena, ahi se encuentran los ids, pero al usar populate los rellena de manera automatica con la informacion de la referencia que se hace en el modelo de proyecto
    .populate({path: "tareas", populate: {path: "completado", select: "nombre"}}) //con esta forma se pobla los campos tareas con todos sus atributos y no solo id y tambien se pobla completado con los datos del usuario y no solo con el id
    .populate("colaboradores", "nombre email"); // en el populate de colaboradores ponemos la referencia como primer string y como segundo string los campos que queremos obtener en un string y separados por un espacio y no por coma
   
    //si tiene el formato pero no se encontro el proyecto
    if (!proyecto) {
        const error = new Error("PROYECTO NO EXISTE");
        return res.status(404).json({ msg: error.message });
    }
    //comparamos si el creador es diferente del usuario autenticado y tambien se debe cumplir que el usuario autenticado no se encuentre en los colaboradores, entonces retorna mensaje de error;  para esto los convertimos a string para poder hacer la comparacion ya que comparandolos directamente manda false aunque sean iguales
    if (proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some((colaborador)=> colaborador._id.toString() === req.usuario._id.toString()) ) {
        const error = new Error("Acción No Valida");
        return res.status(401).json({ msg: error.message })
    }

    res.json(proyecto);
}

//fn nuevo proyecto
const nuevoProyecto = async (req, res) => {
    console.log(req.usuario);
    console.log(req.body);
    //validamos que el el objeto que llega tenga un formato valido de mongo db y lo hacemos con 
    const valid = mongoose.Types.ObjectId.isValid(req.usuario._id);
    //si no es valido
    if (!valid) {
        const error = new Error("FORMATO NO VALIDO");
        return res.status(404).json({ msg: error.message })
    }

    const proyecto = new Proyecto(req.body); //cramos instacia de proyecto y pasamos lo que nos llega por el body para crear el proyecto

    //agreagamos el creador del proyecto, que es el usuario que manda la peticion y lo identificamos con el token recibido por el token, que es añadido a req en la autenticacion
    proyecto.creador = req.usuario._id;

    try {
        //guardamos el proyecto con .save
        const proyectoAlmacenado = await proyecto.save();
        res.json({ proyectoAlmacenado });
    } catch (error) {
        console.log(error);
        res.status(404).json({ ms: "No se pudo crear el proyecto", enviaste: proyecto })
    }
}


//FN que actuliza proyecto
const editarProyecto = async (req, res) => {
    //extraemos y asignamos a const id el valor de id del proyecto que llega por url
    const { id } = req.params;

    //validamos que el el id tenga un formato valido de mongo db y lo hacemos con 
    const valid = mongoose.Types.ObjectId.isValid(id);
    //si no es valido
    if (!valid) {
        const error = new Error("PROYECTO NO EXISTE");
        return res.status(404).json({ msg: error.message })
    }
    //consultamos si el proyecto existe
    const proyecto = await Proyecto.findById(id); //buscamos en bd con el id 

    //si tiene el formato pero no se encontro el proyecto
    if (!proyecto) {
        const error = new Error("PROYECTO NO EXISTE");
        return res.status(404).json({ msg: error.message });
    }
    //comparamos si el creador es diferente del usuario autenticado retorna mensaje de error;  para esto los convertimos a string para poder hacer la comparacion ya que comparandolos directamente manda false aunque sean iguales
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción No Valida");
        return res.status(401).json({ msg: error.message })
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre; //se asigna el valor de lo que llega en el cuerpo de la peticion O si no envia nada se usa lo que ya esta en esa propiedad de la bd
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion; //se asigna el valor de lo que llega en el cuerpo de la peticion O si no envia nada se usa lo que ya esta en esa propiedad de la bd
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega; //se asigna el valor de lo que llega en el cuerpo de la peticion O si no envia nada se usa lo que ya esta en esa propiedad de la bd
    proyecto.cliente = req.body.cliente || proyecto.cliente; //se asigna el valor de lo que llega en el cuerpo de la peticion O si no envia nada se usa lo que ya esta en esa propiedad de la bd

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);
    } catch (error) {
        console.log(error);
    }

}

//fn eliminar proyecto
const eliminarProyecto = async (req, res) => {
    //extraemos y asignamos a const id el valor de id del proyecto que llega por url
    const { id } = req.params;

    //validamos que el el id tenga un formato valido de mongo db y lo hacemos con 
    const valid = mongoose.Types.ObjectId.isValid(id);
    //si no es valido
    if (!valid) {
        const error = new Error("PROYECTO NO EXISTE");
        return res.status(401).json({ msg: error.message })
    }
    //consultamos si el proyecto existe
    const proyecto = await Proyecto.findById(id); //buscamos en bd con el id 

    //si tiene el formato pero no se encontro el proyecto
    if (!proyecto) {
        const error = new Error("PROYECTO NO EXISTE");
        return res.status(404).json({ msg: error.message });
    }
    //comparamos si el creador es diferente del usuario autenticado retorna mensaje de error;  para esto los convertimos a string para poder hacer la comparacion ya que comparandolos directamente manda false aunque sean iguales
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción No Valida");
        return res.status(403).json({ msg: error.message })
    }

    try {
        await proyecto.deleteOne(); //elimina el documento proyecto que se encontro previamente
        res.json({ msg: "Proyecto Eliminado" });
    } catch (error) {
        console.log(error);
    }

}

//fn buscar colaborador
const buscarColaborador = async (req, res) => {
    const { email } = req.body //destructuramos para extraer el email que nos llega en el body de la peticion
    const usuario = await Usuario.findOne({ email }).select("-confirmado -createdAt -updatedAt -password -token -__v") //buscamos el usuario por email, con el metodo find one, esto debolvera el usuario que haga match con el email que le estamos pasando

    //si el usuario no fue encontrado
    if (!usuario) {
        //creamos un error 
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({ msg: error.message }) //retornamos con estatus y encadenamos el mensaje de error

    }
    //console.log(usuario);
    return res.json(usuario) // retorna el usuario 
}

//fn agregar colaborador
const agregarColaborador = async (req, res) => {
    // console.log(req.params); 
    const { id } = req.params;//extraemos el id que nos llega por url y que debe de corresponder a un proyecto

    //console.log(id);
    //validamos que el el id tenga un formato valido de mongo db y lo hacemos con 
    const valid = mongoose.Types.ObjectId.isValid(id);
    //si no es valido
    if (!valid) {
        const error = new Error("PROYECTO NO EXISTE"); //creamos error
        return res.status(404).json({ msg: error.message }) //retornamos status de no encontrado y encademos la respuesta del error en formato json

    }

    //buscamos proyecto por ID
    const proyecto = await Proyecto.findById(id);
    //si el proyecto no fue encontrado
    if (!proyecto) {
        const error = new Error("Proyecto No Existe"); //creamos un error
        return res.status(404).json({ msg: error.message }); //retornamos status de no encontrado y encademos la respuesta del error en formato json

    }
    //si el id del creador no es el mismo que el id del que llega por la peticion, entonces no es el creador y no puede agregar colaboradores
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción denegada!!"); //creamos un error
        return res.status(404).json({ msg: error.message }); //retornamos status de no encontrado y encademos la respuesta del error en formato json

    }

    //validamos que el usuario exista
    const { email } = req.body //destructuramos para extraer el email que nos llega en el body de la peticion
    const usuario = await Usuario.findOne({ email }).select("-confirmado -createdAt -updatedAt -password -token -__v") //buscamos el usuario por email, con el metodo find one, esto debolvera el usuario que haga match con el email que le estamos pasando

    //si el usuario no fue encontrado
    if (!usuario) {
        //creamos un error 
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({ msg: error.message }) //retornamos con estatus y encadenamos el mensaje de error

    }

    //validamos si el colaborador es el creador(admin) del proyecto, no se debe de agregar
    if (proyecto.creador.toString() === usuario._id.toString()) {
        //creamos un error 
        const error = new Error("El creador del Proyecto no puede ser Colaborador")
        return res.status(404).json({ msg: error.message }) //retornamos con estatus y encadenamos el mensaje de error
    }

    //validar que no se encuentre agregado ya en el proyecto
    if (proyecto.colaboradores.includes(usuario._id)) { //buscamos en el arreglo de colaboradores si se encuentra el id del usuario que se desea agregar es porque ya existe
        //creamos un error 
        const error = new Error("El usuario ya es colaborador del Proyecto")
        return res.status(404).json({ msg: error.message }) //retornamos con estatus y encadenamos el mensaje de error
    }

    //una vez pasada todas las validaciones anteriores, podemos agregarlo
    proyecto.colaboradores.push(usuario._id); //agregamos el id del usuario  en el arreglo de colaboradores 
    //guardamos en la bd el proyecto para que se conserve el cambio
    await proyecto.save();
    //retornamos una respuesta con mensaje de exito
    res.json({ msg: 'Usuario Agregado Correctamente' });


    // console.log(req.body);

}

//fn eliminar colaborador
const eliminarColaborador = async (req, res) => {
    // console.log(req.params); 
    const { id } = req.params;//extraemos el id que nos llega por url y que debe de corresponder a un proyecto

    console.log(id);
    //validamos que el el id tenga un formato valido de mongo db y lo hacemos con 
    const valid = mongoose.Types.ObjectId.isValid(id);
    //si no es valido
    if (!valid) {
        const error = new Error("PROYECTO NO EXISTE"); //creamos error
        return res.status(404).json({ msg: error.message }) //retornamos status de no encontrado y encademos la respuesta del error en formato json

    }

    //buscamos proyecto por ID
    const proyecto = await Proyecto.findById(id);
    //si el proyecto no fue encontrado
    if (!proyecto) {
        const error = new Error("Proyecto No Existe"); //creamos un error
        return res.status(404).json({ msg: error.message }); //retornamos status de no encontrado y encademos la respuesta del error en formato json

    }
    //si el id del creador no es el mismo que el id del que llega por la peticion, entonces no es el creador y no puede eliminar colaboradores
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción denegada!!"); //creamos un error
        return res.status(403).json({ msg: error.message }); //retornamos status de no permitido y encademos la respuesta del error en formato json

    }

    //validamos que el usuario a eliminar exista
    const { email } = req.body //destructuramos para extraer el email que nos llega en el body de la peticion
    const usuario = await Usuario.findOne({ email }).select("-confirmado -createdAt -updatedAt -password -token -__v") //buscamos el usuario por email, con el metodo find one, esto debolvera el usuario que haga match con el email que le estamos pasando
    console.log(usuario);


    //si el usuario no fue encontrado
    if (!usuario) {
        //creamos un error 
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({ msg: error.message }) //retornamos con estatus y encadenamos el mensaje de error

    }

    //validamos si el colaborador es el creador(admin) del proyecto, no se debe de eliminar del proyecto
    if (proyecto.creador.toString() === usuario._id.toString()) {
        //creamos un error 
        const error = new Error("El creador del Proyecto no puede ser eliminado")
        return res.status(404).json({ msg: error.message }) //retornamos con estatus y encadenamos el mensaje de error
    }

    //una vez pasada todas las validaciones anteriores, podemos eliminarlo
    proyecto.colaboradores.pull(usuario._id); //eliminamos el id del usuario  en el arreglo de colaboradores con el metodo pull

    //guardamos en la bd el proyecto para que se conserve el cambio
    await proyecto.save();
    //retornamos una respuesta con mensaje de exito
    res.json({ msg: 'Usuario Eliminado Correctamente' });


}

//exportacion de las fn
export { obtenerProyectos, nuevoProyecto, obtenerProyecto, editarProyecto, eliminarProyecto, buscarColaborador, agregarColaborador, eliminarColaborador }