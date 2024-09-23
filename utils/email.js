const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, //Can be predefined host provided by nodemailer like gmail, hotmail, yahoo etc using key 'service' instead of 'host'
        post: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        // Activate in gmail "less secure app" option
    });

    // 2) Define the email option
    const mailOptions = {
        from: 'Pavneet Saka <from@example.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 3) Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;