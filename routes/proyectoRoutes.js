import express from 'express';
import { obtenerProyectos, nuevoProyecto, obtenerProyecto, editarProyecto, eliminarProyecto, buscarColaborador, agregarColaborador, eliminarColaborador } from '../controllers/proyectoController.js'
import checkAuth from '../middleware/checkAuth.js'

//hacemos uso del router
const router = express.Router();

//generamos las rutas
//ejecuta dependiendo del verbo http, en ambos primero valida la autenticacion y despues ejecuta el metodo respectivamente
router
    .route("/")
    .get(checkAuth, obtenerProyectos)  //ruta para obtener proyectos gracias al metodo
    .post(checkAuth, nuevoProyecto);  //ruta para crear proyectos gracias al metodo

router //ruta para obtener un proyecto por medio de su id
    .route("/:id")
    .get(checkAuth, obtenerProyecto)
    .put(checkAuth, editarProyecto)
    .delete(checkAuth, eliminarProyecto)

router.post("/colaboradores", checkAuth, buscarColaborador); //ruta para agregar colaborador por medio de su id
router.post("/colaboradores/:id", checkAuth, agregarColaborador); //ruta para agregar colaborador por medio de su id
router.post("/eliminar-colaborador/:id", checkAuth, eliminarColaborador); //ruta para eliminar colaborador por medio de su id




export default router; //exportamos el router para que se puedan acceder a las rutas definidas anteriormente