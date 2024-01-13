//archivo con las rutas de tarea y sus respectivos metodos aejecutar dependiendo de la peticion

import express from "express"; //importamos express
import { agregarTarea, obtenerTarea, actualizarTarea, eliminarTarea, cambiarEstado } from "../controllers/tareaController.js";
import checkAuth from "../middleware/checkAuth.js"; //importamos el archivo que nos ayuda a autenticar al usuario

//definimos el router con ayuda de express
const router = express.Router();

//ENDPOINTS DE TAREA, PRIMERO AUTENTICAN CON CHECK AUTH Y SI PASA LA AUTENTICACION EJECUTAN SU METODO SIGUIENTE CORRESPONDIENTE EN CADA RUTA 
//definimos con el router la ruta de /api/tareas que sera la que agregue una nueva tarea
router.post("/", checkAuth, agregarTarea);

//definimos con el roter una ruta dinamica /api/tareas/aquiVaUnId que llega por params un id y que dependiendo del verbo es lo que ejecuta
router.route("/:id")
    .get(checkAuth, obtenerTarea) //si es get obtiene la tarea por medio de su id
    .put(checkAuth, actualizarTarea) //si es put actualiza la tarea por medio de su id
    .delete(checkAuth, eliminarTarea); //si es delete elimina la tarea por medio de su id

//definimos con el router la ruta dinamica /api/tareas/estado/aquiVaUnId que llega por params un id y que cambia de estado esa tarea 
router.post("/estado/:id", checkAuth, cambiarEstado);

export default router ; //exportamos el router para que se puedan acceder a las rutas definidas anteriormente