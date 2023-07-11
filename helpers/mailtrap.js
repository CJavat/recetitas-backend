const nodemailer = require("nodemailer");

//* Email change password
const changePasswordEmail = async (datos) => {
  const { firstName, lastName, email, token } = datos;

  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "006e1b3cdeee8d",
      pass: "e613c296f35a9a",
    },
  });

  const info = await transport.sendMail({
    from: "Recetitas - <noreply@recetitas.com>",
    to: email,
    subject: "RECUPERA TU CUENTA - Recetitas",
    text: "Reestablecer Contraseña",
    html: `
      <p> Hola ${firstName} ${lastName}, has solicitado reestablecer tu contraseña </p>
      <br>
      <p>Preciona el siguiente enlace para ir a la página y generar una nueva contraseña:</p>
      <a href="${process.env.URL_CHANGEPASSWORD}/auth/change-password/${token}">Reestablecer Contraseña</a>
      <br>
      <p>Si tú no solicitaste esto, por favor ignora el mensaje</p>
    `,
  });
};

module.exports = { changePasswordEmail };
