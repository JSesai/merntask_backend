//modelo de proyecto
import mongoose from "mongoose"; //importamos libreria para usar eschemas de mongo

//creamos y definimos el esquema
const proyectosSchema = mongoose.Schema({
    nombre: {
        type: String,
        trim: true,
        required: true,
    },
    descripcion: {
        type: String,
        trim: true,
        required: true,
    },
    fechaEntrega: {
        type: Date,
        default: Date.now(),
    },
    cliente: {
        type: String,
        trim: true,
        required: true,
    },
    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
    },
    tareas: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tarea"
        }
    ],
    colaboradores: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
        },

    ]


},
{
    timestamps: true, //timestamps agrega un createdAt y un updatedAt cuando se crea un objeto
}
);

const Proyecto = mongoose.model("Proyecto", proyectosSchema); // se define el modelo con el nombre y el modelo creado previamente en el schema
export default Proyecto; 