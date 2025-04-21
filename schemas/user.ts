import * as Yup from "yup";

export const Inquiry = Yup.object().shape({
  name: Yup.string().required("Full Name is required"),
  email: Yup.string()
    .email("Invalid Email")
    .required("Email Address is required"),
  phone: Yup.string().required("Phone Number is required"),
  message: Yup.string().required("Message is required"),
});
