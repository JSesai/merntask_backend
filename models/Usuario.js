import mongoose from "mongoose"; //biblioteca de modelado de datos orientada a objetos (ODM) para mongo db y node
import bcrypt, { genSalt } from "bcrypt" //libreria que nos ayuda a hashear

//definimos el modelo del eschema es la estructura de la bd
const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required:true,
        trim: true,
        unique: true,
    },
    token: {
        type: String,

    },
    confirmado: {
        type: Boolean,
        default: false,
    }
},{
    timestamps: true, //tmestamp crea 2 columnas una de creado y una de actualizado
})

//se ejecuta antes de que se guarde y se utiliza fn declarada para poder usar el contexto de this porque en fn expresion es diferente  
usuarioSchema.pre('save', async function(next){

    //compruba si no ha sido modificado el password 
    if(!this.isModified('password')){
        next(); //si entra al bloque saltara al siguiente bloque de codigo y no se ejecutara el hasheo, es importatnte porque en el futuro si se actualiza alguna otra parte del comdelo usuario la password volvera hashear lo hasheado
    }
    const salt = await bcrypt.genSalt(10); //genera el hasheo 
    this.password = await bcrypt.hash(this.password, salt); // asigna hasheo con ayuda del contexto this hace referencia a la password que llega, si se hiciera con arrow funtion que son funcion expresion
    
} );

//FN QUE COMPARA el password que se recibe con la almacenada;  con .methods permite agregar metodos al usuarioSchema, nuestro metodo se llama comprobarPassword y es una funcion declarada que recibe el password que sera enviado desde un formulario
usuarioSchema.methods.comprobarPassword = async function(paswwordFormulario){

    return await bcrypt.compare(paswwordFormulario, this.password); //compara el pasword recibido por parametro con el del objeto de este contexto, si son iguales retorna true caso contrarion false
}

//definimos el modelo que requiere el schema creado anteriormente
const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;

