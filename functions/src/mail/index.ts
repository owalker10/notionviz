import * as functions from "firebase-functions";
import nodemailer from "nodemailer";
import { Feedback } from "@common/firestore";
import getEnv from "../env";

// sends an email when a feedback document is created

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

const emulated = process.env.FUNCTIONS_EMULATOR === "true";
const serverEmail = getEnv("EMAIL_USER");
const recipient = getEnv("EMAIL_RECIPIENT");
const mailingList = [serverEmail];
if (!emulated) mailingList.push(recipient);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: serverEmail,
    pass: getEnv("EMAIL_PASS"),
  },
});

export default functions.firestore
  .document("feedback/{id}")
  .onCreate((snap) => {
    const feedback = snap.data() as Feedback;
    const viewUrl = `https://console.firebase.google.com/u/0/project/notion-viz/firestore/data/~2Ffeedback~2F${snap.id}`;

    const { name, content, type } = feedback;
    if (!(name && content && type)) {
      console.error("Mailing Error: Missing fields in feedback:", feedback);
      return null;
    }

    if (emulated && !process.env.SEND_MAIL) {
      console.log(
        `Received feedback ${snap.id} in non-production environment. Not sending email.`
      );
      return null;
    }

    const mailOptions = {
      from: serverEmail,
      subject: `${emulated ? "[development] " : ""}NotionViz feedback received`,
      html: `<p>NotionViz has received feedback from <b>${feedback.name}</b> of type <b>${feedback.type}</b>.</p>
      <blockquote><em>${feedback.content}</em></blockquote>
      <p><a href="${viewUrl}">Click here to view in console</a></p>`,
    };

    return Promise.all(
      mailingList.map((addr) =>
        transporter.sendMail({ ...mailOptions, to: addr }, (err) => {
          if (err) {
            console.error("Mailing Error:", err);
          } else {
            console.log(
              `Sent mail notification to ${addr} for feedback`,
              snap.id
            );
          }
        })
      )
    );
  });
