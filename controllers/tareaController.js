//archivo con los metodos para las tareas
import mongoose from "mongoose";
import Proyecto from "../models/proyecto.js";
import Tarea from "../models/Tarea.js";
//crear una nueva Tarea
const agregarTarea = async (req, res) => {
    //validamos que el proyecto exista
    const { proyecto } = req.body; //extraemos el id del proyecto que nos envia en el body la peticion que esta en la propiedad proyecto

    //validamos que proyecto sea un id que tenga un formato valido de mongo db 
    const valid = mongoose.Types.ObjectId.isValid(proyecto);
    //si no es valido
    if (!valid) {
        const error = new Error("PROYECTO NO EXISTE");
        return res.status(403).json({ msg: error.message });
    }

    const existeProyecto = await Proyecto.findById(proyecto); //buscamos por id, si se encuentra se guarda la instancia en existeProyecto

    //si el proyecto no se encontro
    if (!existeProyecto) {
        const error = new Error("El proyecto No Existe");
        return res.status(404).json({ msg: error.message });
    }

    //comprobar si el creador del proyecto es diferente del usuario autenticado retorna mensaje de error;  para esto los convertimos a string para poder hacer la comparacion ya que comparandolos directamente manda false aunque sean iguales
    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No Tienes Permisos para Añadir Tareas");
        return res.status(403).json({ msg: error.message });

    }

    try {
        //guardamos la tarea en la bd con el metodo create y pasandole la info que llega en el cuerpo de la peticion
        const tareaAlmacenada = await Tarea.create(req.body);

        existeProyecto.tareas.push(tareaAlmacenada._id); //empujamos en proyecto la tarea, por lo que guardamos el id 

        await existeProyecto.save(); //Guardamos la modificacion para que se quede grabada en la BD

        res.json(tareaAlmacenada);//retornamos la tarea almacenada, que ya debe de incluir el array con tareas
    } catch (error) {
        console.log(error);
    }
}

//obtener una tarea por medio de su id
const obtenerTarea = async (req, res) => {
    const { id } = req.params; //extraemos el id que llega por params atraves de la url

    //validamos que sea un id que tenga un formato valido de mongo db 
    const valid = mongoose.Types.ObjectId.isValid(id);
    //si no es valido
    if (!valid) {
        const error = new Error("TAREA NO EXISTE");
        return res.status(403).json({ msg: error.message });
    }

    //buscamos si existe esa tarea con findById y pasamos el id, enseguida hacemos un populate con el nombre de la columna donde hace ref el modelo tarea con el modelo Proyecto para que nos poble automáticamente el campo de referencia en el documento tarea
    const tarea = await Tarea.findById(id).populate("proyecto"); //pobla el campo proyecto de manera automatica 

    //si no existe el id
    if (!tarea) {
        const error = new Error("La tarea no Existe");
        return res.status(404).json({ msg: error.message });
    }

    //convertimos a string para comparar y poder validar que el usuario que solicita la tarea sea el mismo que creo el proyecto
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción No Valida, No tienes permisos");
        return res.status(403).json({ msg: error.message });
    }

    res.json(tarea)
}

//actualizar una tarea por medio de su id
const actualizarTarea = async (req, res) => {
    const { id } = req.params; //extraemos el id que llega por params atraves de la url

    //validamos que sea un id que tenga un formato valido de mongo db 
    const valid = mongoose.Types.ObjectId.isValid(id);
    //si no es valido
    if (!valid) {
        const error = new Error("TAREA NO EXISTE");
        return res.status(403).json({ msg: error.message });
    }

    //buscamos si existe esa tarea con findById y pasamos el id, enseguida hacemos un populate con el nombre de la columna donde hace ref el modelo tarea con el modelo Proyecto para que nos poble automáticamente el campo de referencia en el documento tarea
    const tarea = await Tarea.findById(id).populate("proyecto"); //pobla el campo proyecto de manera automatica 

    //si no existe el id
    if (!tarea) {
        const error = new Error("La tarea no Existe");
        return res.status(404).json({ msg: error.message });
    }

    //convertimos a string para comparar y poder validar que el usuario que solicita la tarea sea el mismo que creo el proyecto
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción No Valida, No tienes permisos");
        return res.status(403).json({ msg: error.message });
    }

    //seteamos las propiedades con sus valores correspondientes
    tarea.nombre = req.body.nombre || tarea.nombre; //asigna el nombre que viene en el cuerpo de la peticion, si la peticion no trae esa propiedad asigna la que ya tiene 
    tarea.descripcion = req.body.descripcion || tarea.descripcion; //asigna la descripcion que viene en el cuerpo de la peticion, si la peticion no trae esa propiedad  asigna la que ya tiene 
    tarea.prioridad = req.body.prioridad || tarea.prioridad; //asigna prioridad que viene en el cuerpo de la peticion, si la la peticion no trae esa propiedad asigna la que ya tiene 
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega; //asigna fechaEntrega que viene en el cuerpo de la peticion, si la la peticion no trae esa propiedad asigna la que ya tiene 
    try {
        const tareaAlmacenada = await tarea.save();
        return res.json(tareaAlmacenada);
    } catch (error) {
        console.log(error);
    }
}

//eliminar una tarea por medio de su id
const eliminarTarea = async (req, res) => {

    const { id } = req.params; //extraemos el id que llega por params atraves de la url

    //validamos que sea un id que tenga un formato valido de mongo db 
    const valid = mongoose.Types.ObjectId.isValid(id);
    //si no es valido
    if (!valid) {
        const error = new Error("TAREA NO EXISTE");
        return res.status(403).json({ msg: error.message });
    }

    //buscamos si existe esa tarea con findById y pasamos el id, enseguida hacemos un populate con el nombre de la columna donde hace ref el modelo tarea con el modelo Proyecto para que nos poble automáticamente el campo de referencia en el documento tarea
    const tarea = await Tarea.findById(id).populate("proyecto"); //pobla el campo proyecto de manera automatica 

    //si no existe el id
    if (!tarea) {
        const error = new Error("La tarea no Existe");
        return res.status(404).json({ msg: error.message });
    }

    //convertimos a string para comparar y poder validar que el usuario que solicita la tarea sea el mismo que creo el proyecto
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción No Valida, No tienes permisos");
        return res.status(403).json({ msg: error.message });
    }

    try {
        //antes de eliminar la tarea, tambien debemos de eliminar la referencia que tiene en el proyecto
        const proyecto = await Proyecto.findById(tarea.proyecto) //buscamos por id el proyecto con la referencia de la tarea que ya hemos recuperado anteriormente
        proyecto.tareas.pull(tarea._id); //sacamos del arreglo a la tarea que vamos a eliminar  
        // ejecutamos 2 metodos al mismo tiempo, el metodo para guardar el proyecto una vez que sacamos el id del arreglo de tareas y el metodo de eliminat la tarea
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()]).then(result => {

            res.json({ msg: "Tarea Eliminada" });//retornamos mensaje de exito
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error en el servidor", error });
    }
}

//cambiar el estado de la tarea, cuando se completa 
const cambiarEstado = async (req, res) => {
    const { id } = req.params; //extraemos el id que llega por params atraves de la url

    //validamos que sea un id que tenga un formato valido de mongo db 
    const valid = mongoose.Types.ObjectId.isValid(id);
    //si no es valido
    if (!valid) {
        const error = new Error("TAREA NO EXISTE");
        return res.status(403).json({ msg: error.message });
    }
    //buscamos si existe esa tarea con findById y pasamos el id, enseguida hacemos un populate con el nombre de la columna donde hace ref el modelo tarea con el modelo Proyecto para que nos poble automáticamente el campo de referencia en el documento tarea
    const tarea = await Tarea.findById(id).populate("proyecto"); //pobla el campo proyecto de manera automatica 

    //si no existe el id
    if (!tarea) {
        const error = new Error("La tarea no Existe");
        return res.status(404).json({ msg: error.message });
    }

    //convertimos a string para comparar y poder validar que el usuario que solicita la tarea sea el mismo que creo el proyecto
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some((colaborador) => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error("Acción No Valida, No tienes permisos");
        return res.status(403).json({ msg: error.message });
    }

    tarea.estado = !tarea.estado; //asignamos el valor contrario de lo que tenga tarea en su propiedad estado que es true o false
    tarea.completado = req.usuario._id; //asignamos el valor del campo completado con el id del usuario que completa la tarea y lo obtenemos por medio del request que en el metodo de autenticacion le añade el usuario y gracias a eso podemos acceder al id
    await tarea.save(); //guardamos el cambio 
    const tareaAlmacenada = await Tarea.findById(id) //consultamos nuevamente la tarea pero ahora pedimos que nos poble proyecto y completado
        .populate("proyecto") //pobla el campo proyecto de manera automatica 
        .populate("completado"); //pobla el campo completado de manera automatica

    res.json(tareaAlmacenada); //retornamos la tarea que fue cambiada de estado 

}

export { agregarTarea, obtenerTarea, actualizarTarea, eliminarTarea, cambiarEstado }