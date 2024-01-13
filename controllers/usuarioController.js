import Usuario from "../models/Usuario.js"; //importamos el modelo 
import generarId from "../helpers/generarId.js"; //fn propia que genera id que usaremos como token
import generarJWT from "../helpers/generarJWT.js"; //fn propia que genera id que usaremos como token
import { emailRegistro, emaiOlvidePassword } from "../helpers/email.js"; //fn de emails


//fn que hace registro con los datos recibidos
const registrar = async (req, res) => {
    //evitar registros duplicados
    const { email } = req.body; //extraemos el dato a validar duplicado
    const correoDuplicado = await Usuario.findOne({ email: email }); // buscamos en la BD la primera coincidencia con el correo recibido, retorna null si no encuentra nada y si lo encuentra retorna el valor buscado

    //evalua si encontro algo es true eso quiere decir que ya existe
    if (correoDuplicado) {
        const error = new Error("Usuario ya registrado"); //creamos un error con mensaje

        return res.status(400).json({ msg: error.message }); //retornamos estatus 400 y el mensaje de error
    }
    //intenta hacer registro
    try {
        const usuario = new Usuario(req.body);  //creamos una instancia con el modelo y con los datos que recibimos

        usuario.token = generarId(); //crea un token con la funcion generar id, como no existe esta propiedad en el objeto de usuario se crea, y sera utilizado para autenticar la cuenta por email

        await usuario.save(); //hacemos que sea asincrono para que se pare la ejecucion del codigo hasta que se  guarde el usaurio continua

        //Enviar el email de confirmacion con ayuda de la fn emailRegistro pasandole un objeto con los datos para hacer el envio de email
        emailRegistro({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        })
        

        res.json({ msg: "Usuario Creado Correctamente, Revisa tu Email para confirmar tu cuenta"});//respuesta de registro exitoso

    } catch (error) {
        console.log(error);
    }

}

//fn que autentica distintos datos del usuario que se loguea
const autenticar = async (req, res) => {
    //extraemos el correo y password
    const { email, password } = req.body;

    //BUSCAR USUARIO PARA Comprobar si el usuario existe 
    const usuario = await Usuario.findOne({ email }); //encuentra el email en el modelo usuario si existe retorna el objeto donde se encuentre la coincidencia

    //si usuario no existe
    if (!usuario) {
        const error = new Error('El usuario no existe'); //creamos un nuevo error y lo personalizamos con un mensaje
        return res.status(404).json({ msg: error.message }); //retornamos un estatis 404 y un json con el error
    }

    //comprobar si el usuario esta confirmado
    if (!usuario.confirmado) {
        const error = new Error('El usuario no esta confirmado'); //creamos un nuevo error y lo personalizamos con un mensaje
        return res.status(403).json({ msg: error.message }); //retornamos un estatus 403 y un json con el error
    }

    //comprobar passsword con la fn asincrona  que esta en el modelo usuario
    if (await usuario.comprobarPassword(password)) {
        return res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        });
    } else {
        const error = new Error('La contraseña es incorrecta'); //creamos un nuevo error y lo personalizamos con un mensaje
        console.log('contraseña incorrecta');
        return res.status(403).json({ msg: error.message }); //retornamos un estatus 403 y un json con el error

    }


}

//confirmacion del usuario con el token 
const confirmar = async (req, res) => {
    const { token } = req.params; //extraemos token
    const usuarioConfirmado = await Usuario.findOne({ token }); //buscamos al usuario con el token que recibimos por url, devolvera el objeto completo si lo encuentra
    console.log(usuarioConfirmado);
    if (!usuarioConfirmado) {
        const error = new Error('Token Incorrecto'); //creamos un nuevo error y lo personalizamos con un mensaje
        return res.status(403).json({ msg: error.message }); //retornamos un estatus 403 y un json con el mensaje de error

    }
    //cachamos la accion de modificar el objeto
    try {
        // si se encuentra el token entonces se encontro el objeto y ahora se tiene que cambiar la propiedad del objeto confirmado a true
        usuarioConfirmado.confirmado = true;
        //el token es de un solo uso, por lo que una vez confirmado debemos cambiar el token a string vacio
        usuarioConfirmado.token = "";
        //guardamos el objeto con lo modificado de lo contrarion no se veran los cambios en la bd
        await usuarioConfirmado.save();
        //enviamos mensaje de usario confirmado correctamente
        return res.json({ msg: "Usuario Confrimado Correctamente" }); //retornamos un estatus 403 y un json con el mensaje de error
        // console.log(usuarioConfirmado);

    } catch (error) {

        // console.log(error);
    }
}

//FN para recuperar password 
const olvidePassword = async (req, res) => {
    //extraer el email
    const { email } = req.body;
    //Comprobar si el usuario existe 
    const usuario = await Usuario.findOne({ email }); //encuentra el email en el modelo usuario si existe retorna el objeto donde se encuentre la coincidencia

    //si usuario no existe
    if (!usuario) {
        const error = new Error('El usuario no existe'); //creamos un nuevo error y lo personalizamos con un mensaje
        return res.status(404).json({ msg: error.message }); //retornamos un estatis 404 y un json con el error
    }

    //si usuario existe debe generarse nuevo token
    try {
        usuario.token = generarId(); //aignamos a la propiedad token una nueva cadena con fn generarId
        await usuario.save(); //guardamos en la BD

        //enviar un email con las instrucciones
        emaiOlvidePassword({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        })

        res.json({ msg: "Hemos enviado un email con las instrucciones" }); //enviamos respuesta 
    } catch (error) {

    }

}

//FN que comprueba el token de olvide-password
const comprobarToken = async (req, res) => {
    const { token } = req.params; //extraemos el token recibido por url
    const tokenValido = await Usuario.findOne({ token }); //buscamos ese token para identificar el objeto; findOne regresa la prmera coincidencia que encuentre 
    //si encontro algo tokenValido es true
    if (tokenValido) {
        res.json({ msg: "Token valido" }); //enviamos respuesta 
        
    } else {
        const error = new Error('Token Invalido'); //creamos un nuevo error y lo personalizamos con un mensaje
        return res.status(403).json({msg: error.message}); //retornamos un estatus 403 y un json con el mensaje de error
    }
}

//FN para definir nuevo password cuando se olvidan de la password
const nuevoPassword = async (req, res)=>{
    const { token } = req.params; //extraemos el toquen que llega por url (params)
    const { password } = req.body; //extraemos el password que llega por post en el body
    const usuario = await Usuario.findOne({ token }); //buscamos ese token para identificar la instancia de usuario; findOne regresa la prmera coincidencia que encuentre 

    //si encontro usuario
    if (usuario) {
        usuario.password = password; //cambiamos el password de la instancia por el recibido en el body
        usuario.token = ""; //seteamos el token a cadena vacia ya que es de un solo uso
        //usamos try catch para interactuar con la bd
        try {
            //siempre que se tenga interaccion con metodos de mongus se debe usar await para esperar a que concluya el proceso del modelo y no tengamos valores nulos o indefinidos
            await usuario.save(); //guarda la instancia ya con la modificacion que hemos hecho
    
            res.json({ msg: "Password Modificada correctamente" }); //enviamos respuesta 
            
        } catch (error) {
            console.log(error);
        }
        
    } else {
        const error = new Error('Token Invalido'); //creamos un nuevo error y lo personalizamos con un mensaje
        return res.status(403).json({msg: error.message}); //retornamos un estatus 403 y un json con el mensaje de error
    }
    
}

const perfil = async (req, res) => {
    const { usuario } = req;

    res.json(usuario);
    
}

export { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil };