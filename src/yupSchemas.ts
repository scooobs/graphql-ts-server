import * as yup from "yup";
import { passwordNotLongEnough } from "./modules/user/register/errorMessages";

export const registerPasswordValidation = yup
  .string()
  .min(5, passwordNotLongEnough)
  .max(255)
  .required();
