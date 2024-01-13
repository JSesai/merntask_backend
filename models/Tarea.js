import mongoose from "mongoose";

//definimos el esquema
const tareaSchema = mongoose.Schema({
    nombre: { //nombre de la tarea, quita espacios en blanco con trim y es oblogatorio
        type: String,
        trim: true,
        required: true
    },
    descripcion: { //descripcion de la tarea
        type: String,
        trim: true,
        required: true
    },
    estado: { //estado de la tarea arranca en false define si la tarea esta completa o no
        type: Boolean,
        default: false
    },
    fechaEntrega: { //fecha de entrega, de tipo fecha, es obligatorio y genera una fecha por default 
        type: Date,
        required: true,
        default: Date.now()
    },
    prioridad: { //prioridad de la tarea, es obligatorio y de tipo string
        type: String,
        required: true,
        enum: ["Baja", "Media", "Alta"] //permite colocar unicamente los valores que estan en el arreglo
    },
    proyecto: { //cada tarea tiene un proyecto asociado por lo que se debe relacionar con el modelo de proyecto
        type: mongoose.Schema.Types.ObjectId, //el tipo es id de un documento
        ref: "Proyecto" //la referencia es la referencia del modelo al que se relaciona, en este caso el nombre del modelo es Proyecto
    },
    completado:{
        type: mongoose.Schema.Types.ObjectId, //el tipo es id de un documento
        ref: "Usuario"//la referencia es la referencia del modelo al que se relaciona, en este caso el usuario 
    }
},
{
    timestamps: true //timestamps agrega un createdAt y un updatedAt cuando se crea un objeto
});

const Tarea = mongoose.model("Tarea", tareaSchema); // se define el modelo con el nombre y el modelo creado previamente en el schema
export default Tarea; //exportamos el modelo