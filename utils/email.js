const nodemailer = require('nodemailer');
const { convert } = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Pavneet Saka <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid integration for production
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST, //Can be predefined host provided by nodemailer like gmail, hotmail, yahoo, sendgrid etc using key 'service' instead of 'host'
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
            // Activate in gmail "less secure app" option
        });
    }

    async send(template, subject) {
        // 1) Render HTML based on the pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // 2) Define the email option
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: convert(html)
        };

        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to Natours family!');
    }
    
    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset link (valid for only 10 minutes)');
    }
}

/* const sendEmail = async options => {
    // 1) Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, //Can be predefined host provided by nodemailer like gmail, hotmail, yahoo etc using key 'service' instead of 'host'
        port: process.env.EMAIL_PORT,
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

module.exports = sendEmail; */