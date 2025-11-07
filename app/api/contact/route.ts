import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { name, email, phone, message, receiver } = await req.json();

  console.log("📩 New Inquiry Received:", { name, email, phone, message, receiver });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, // 465 requires SSL
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const htmlContent = `
      <div style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif; line-height: 1.5; background-color:#f5f6fa; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border:1px solid #e6ebf1; border-radius:8px; padding:24px;">
          <div style="text-align:center; margin-bottom:24px;">
            <img src="cid:logo" alt="Infinitech" height="100" style="display:block; margin:0 auto;" />
          </div>

          <hr style="border-color:#e6ebf1; margin:20px 0;" />

          <p style="color:#525f7f; font-size:16px; line-height:24px;">Dear Infinitech Team,</p>
          <p style="color:#525f7f; font-size:16px; line-height:24px;">
            A new inquiry has been submitted through your website. Below are the details:
          </p>

          <hr style="border-color:#e6ebf1; margin:20px 0;" />

          <p style="color:#525f7f; font-size:16px; line-height:24px;"><strong>Name:</strong> ${name}</p>
          <p style="color:#525f7f; font-size:16px; line-height:24px;"><strong>Email:</strong> ${email}</p>
          <p style="color:#525f7f; font-size:16px; line-height:24px;"><strong>Phone:</strong> ${phone}</p>
          <p style="color:#525f7f; font-size:16px; line-height:24px;"><strong>Message:</strong></p>
          <p style="color:#525f7f; font-size:16px; line-height:24px;">${message}</p>

          <hr style="border-color:#e6ebf1; margin:20px 0;" />

          <p style="color:#525f7f; font-size:16px; line-height:24px;">
            Please follow up with the client promptly to address their inquiry.
            If you have any questions, feel free to reach out to the support team.
          </p>

          <hr style="border-color:#e6ebf1; margin:20px 0;" />

          <p style="color:#8898aa; font-size:12px; line-height:16px; text-align:center; margin:20px auto;">
            Unit 311, Campos Rueda Building, 101 Urban Ave, Makati, 1206 Metro Manila<br/>
            LandLine: (02) 7001-6157 | Mobile: +63962-253-0149<br/>
            Email: infinitechadvertisingcorp@gmail.com | Website: 
            <a href="https://infinitechphil.com" style="color:#556cd6;">infinitech-2025.vercel.app</a><br/>
            Office Hours: Monday to Friday, 8:00 AM - 5:00 PM
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USERNAME}>`,
      to: receiver || process.env.SMTP_RECEIVER,
      subject: "📩 New Inquiry - Infinitech Advertising Corporation",
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: "C:/laragon/www/infinitech-website-main/public/images/logo.png",
          cid: "logo", // same as in the HTML img src
        },
      ],
    });

    console.log("✅ Email sent successfully!");
    return new Response(
      JSON.stringify({ code: 200, message: "Inquiry Sent Successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Send Inquiry Error:", error);
    return new Response(
      JSON.stringify({ code: 500, message: "Something Went Wrong" }),
      { status: 500 }
    );
  }
}
