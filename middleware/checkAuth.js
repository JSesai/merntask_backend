import Usuario from "../models/Usuario.js"; //importamos el modelo de usuario
import jwt from "jsonwebtoken"; //libreria para poder cifrar y decifrar jwt

//revisa que el usuario este autenticado
const checkAuth = async (req, res, next) => {
    let token; //declaramos variable que guardara el token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { //si esta enviando por cabeceras el token y es de tipo bearer
        try {
            token = req.headers.authorization.split(" ")[1]; //lo partimos separado por " " y tomamos la poscicion 1 que es donde esta el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decifrar jwt con fn verify y con la key definida en .env; el token contiene el id del usuario
            //creamos la propiedad usuario, asignamos su valor buscando por id la instancia pasando el decoded y accediendo al id, omitimos partes del usuario que no necesitamos  que contiene
            req.usuario = await Usuario.findById(decoded.id).select("-password -confirmado -token -createdAt -updatedAt -__v");
            return next();
        } catch (error) {
            return res.status(404).json({ msg: "Hubo un error" });
        }
    }

    //si el usuarui no envia token 
    if(!token){
        const error = new Error("Token no valido");
        return res.status(401).json({msg: error.message});
    }
    next();
}

export default checkAuth;