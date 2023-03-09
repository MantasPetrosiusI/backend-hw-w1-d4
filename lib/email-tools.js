import sgMail from "@sendgrid/mail";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

sgMail.setApiKey(process.env.SENDGRID_KEY);

export const sendsRegistrationEmail = async (recipientAdress) => {
  const msg = {
    to: recipientAdress,
    from: process.env.SENDER_EMAIL,
    subject: "Succesful Registration",
    text: "Good!",
  };
  await sgMail.send(msg);
};
export const sendsCreatedPostEmail = async (recipientAdress) => {
  const msg = {
    to: recipientAdress,
    from: process.env.SENDER_EMAIL,
    subject: "New Post",
    text: "New blog post was made on account associated with this email address!",
  };
  await sgMail.send(msg);
};
export const sendsMailWithAttachment = async (recipient) => {
  const dataDir = join(dirname(fileURLToPath(import.meta.url)), "../JSONdata");
  fs.readFile(dataDir + `/${recipient.author.name}.pdf`, async (err, data) => {
    if (err) {
      console.log(err);
    }
    if (data) {
      const msg = {
        to: recipient.author.email,
        from: process.env.SENDER_EMAIL,
        subject: "Attachment email",
        html: `<b>This email contains attachment!</b>`,
        attachments: [
          {
            content: data.toString("base64"),
            filename: `${recipient.title}.pdf`,
            type: `application/pdf`,
            disposition: `attachment`,
            content_id: recipient.id,
          },
        ],
      };
      await sgMail.send(msg);
    }
  });
};
