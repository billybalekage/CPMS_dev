const nodemailer = require("nodemailer");

<<<<<<< HEAD
// exports.transporter = nodemailer.createTransport({
//     host : process.env.SMTP_SERVER,
//     port: process.env.SMTP_PORT,
//     secure: process.env.SMTP_PORT == 465, // IMPORTANT
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS
//     }
// })

=======
>>>>>>> dev
exports.transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  secure: false,
  debug: true, 
  logger: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, 
  },
});
