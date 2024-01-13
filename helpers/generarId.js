//genera un numero aleatorio para poder utlizarlo como id unico
const generarId = ()=>{
    const random = Math.random().toString(32).substring(2); //math random genera un numero aleatorio to string lo convierte en string alfanumerico y subtring le quita los dos primeros valores que es  0. 
    const fecha = Date.now().toString(32); // date now genera un numero en base a fecha  y to string lo convierte en string alfanumerico
    return random + fecha;
}

export default  generarId;