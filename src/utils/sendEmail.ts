import * as sgMail from "@sendgrid/mail";

export const sendEmail = async (recipient: string, url: string) => {
  sgMail.setApiKey(process.env.API_KEY as string);
  const msg = {
    to: recipient, // Change to your recipient
    from: process.env.VERIFIED_SENDER as string, // Change to your verified sender
    subject: "Confirm Email",
    html: `
    <body>
        <p>Confirm your email address</p>
        <a href=${url}>click here</a>
    </body>`,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body);
    }
  }
};
