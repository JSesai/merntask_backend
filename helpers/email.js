//ARCHIVO QUE CONTIENE METODOS PARA EL ENVIO DE EMAILS
import nodemailer from "nodemailer"; //biblioteca para el envio de email -> npm install nodemailer

//fn que dispara el email cuando se hace un nuevo registro
export const emailRegistro = async (datos) => { //hacemos la fn asincrona
  const { nombre, email, token } = datos;

  // configuracion/credenciales para el envio de email
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  //fn para enviar informacion del email
  const info = await transport.sendMail({
    from: '"Uptask- Administrador de Proyectos" <cuentas@uptask.com',
    to: email,
    subject: "Uptask - Comprueba Tu Cuenta",
    text: "Comprueba tu Cuenta en UpTask",
    html: `<p>Hola: ${nombre}</p>
        <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>
        </p>
        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `

  })


}
//fn que dispara el email cuando se solcita olvide password
export const emaiOlvidePassword = async (datos) => { //hacemos la fn asincrona
  const { nombre, email, token } = datos;

  // configuracion/credenciales para el envio de email
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });


  //fn para enviar informacion del email
  const info = await transport.sendMail({
    from: '"Uptask- Administrador de Proyectos" <cuentas@uptask.com',
    to: email,
    subject: "Uptask - Reestablece Tu Password",
    text: "Recupera tu Cuenta en UpTask",
    html: `<p>Hola: ${nombre} has solicitado reestablecer tu password</p>
        <p>La Recuperación de tu cuenta ya esta casi lista, solo debes cambiar tu contraseña en el siguiente enlace:
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer password</a>
        </p>
        <p>Si tu no solicitaste este email, puedes ignorar el mensaje</p>
        `

  })


}

