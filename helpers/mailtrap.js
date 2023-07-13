const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "006e1b3cdeee8d",
    pass: "e613c296f35a9a",
  },
});

//* Email change password
const changePasswordEmail = async (datos) => {
  const { firstName, lastName, email, token } = datos;

  await transport.sendMail({
    from: "Recetitas - <noreply@recetitas.com>",
    to: email,
    subject: "RECUPERA TU CUENTA - Recetitas",
    text: "Reestablecer Contraseña",
    html: `
      <p> Hola ${firstName} ${lastName}, has solicitado reestablecer tu contraseña </p>
      <br>
      <p>Preciona el siguiente enlace para ir a la página y generar una nueva contraseña:</p>
      <a href="${process.env.URL_FRONTEND}/auth/change-password/${token}">Reestablecer Contraseña</a>
      <br>
      <p>Si tú no solicitaste esto, por favor ignora el mensaje</p>
    `,
  });
};

//* Email confirm account
const confirmYourAccount = async (datos) => {
  const { email, token } = datos;

  await transport.sendMail({
    from: "Recetitas - <noreplay@recetitas.com>",
    to: email,
    subject: "CONFIRMA TU CUENTA - Recetitas",
    text: "Confirma tu cuenta para poder ingresar",
    html: `
      <p> Te has registrado correctamente, confirma tu cuenta para poder ingresar </p>
      <br>
      <p>Preciona el siguiente enlace para confirmar tu cuenta:</p>
      <a href="${process.env.URL_FRONTEND}/auth/confirm-account/${token}">Confirmar Cuenta</a>
      <br>
      <p>Si tú no solicitaste esto, por favor ignora el mensaje</p>
    `,
  });
};

module.exports = { changePasswordEmail, confirmYourAccount };
