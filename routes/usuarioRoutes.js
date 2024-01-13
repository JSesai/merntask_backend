import express  from "express";
import { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil } from "../controllers/usuarioController.js";
import checkAuth from "../middleware/checkAuth.js";
const router = express.Router(); //hacemos uso del router de express para poder manejar rutas

//autenticacion, registro y confirmacion de usuarios
router.post("/", registrar); //crea nuevo usuario
router.post("/login", autenticar); //autentica usuario
router.get("/confirmar/:token", confirmar); //confirma usuario por token 
router.post("/olvide-password", olvidePassword); //autentica usuario
// router.get("/olvide-password/:token", comprobarToken); //confirma usuario por token 
// router.post("/olvide-password/:token", nuevoPassword); //confirma usuario por token 
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword); // es lo mismo de arriba, tiene los 2 metodos get y post solo que se ejecuta el que se solicite

//ruta que valida la autenticacion y despues mustra perfil del usuario
router.get("/perfil", checkAuth, perfil);
export default router; //exportamos el router para que se puedan acceder a las rutas definidas anteriormente