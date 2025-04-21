import React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const main = {
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0px 0px",
  marginBottom: "64px",
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
  maxWidth: "600px",
  width: "100%",
};

const box = {
  padding: "24px",
};

const logo = {
  margin: "0 auto",
  marginBottom: "24px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const anchor = {
  color: "#556cd6",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "20px auto",
  textAlign: "center" as const,
};

export const Quotation = () => (
  <Html>
    <Head />
    <Preview>
      New Quotation Request - Infinitech Advertising Corporation
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Section>
            <Img
              alt="Infinitech"
              height="100"
              src="https://abic-agent-bakit.s3.ap-southeast-1.amazonaws.com/media/infinitech.png"
              style={logo}
            />
          </Section>

          <Hr style={hr} />
          <Text style={paragraph}>Dear Infinitech Team,</Text>
          <Text style={paragraph}>
            A client has requested a quotation through your website. See the
            attached file for details:
          </Text>
          <Hr style={hr} />
          <Text style={paragraph}>
            Please follow up with the client promptly to address their quotation
            request. If you have any questions, feel free to reach out to the
            support team.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Unit 311, Campos Rueda Building, 101 Urban Ave, Makati, 1206 Metro
            Manila
            <br />
            LandLine: (02) 7001-6157 | Mobile: +63962-253-0149
            <br />
            Email: infinitechadvertisingcorp@gmail.com | Website:{" "}
            <Link href="https://infinitech-2025.vercel.app" style={anchor}>
              infinitech-2025.vercel.app
            </Link>
            <br />
            Office Hours: Monday to Friday, 8:00 AM - 5:00 PM
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default Quotation;
