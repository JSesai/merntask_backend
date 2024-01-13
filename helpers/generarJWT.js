import jwt from "jsonwebtoken"  //usamos esta libreria npm i jsonwebtoken para generar webtokens

//funcion que genera un JWT
const generarJWT = (id)=>{
    //la fn sing genera un JWT, el primer dato es el valor, el segundo es una llave secreta, el tercero son las opciones
    return jwt.sign( { id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
}

export default generarJWT;