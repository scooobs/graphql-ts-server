import { ValidationError } from "yup";

export const formatYupError = (err: ValidationError) => {
  const errors: { path: string; message: string }[] = [];
  err.inner.forEach((e) => {
    errors.push({
      path: e.path ?? "Empty at root level",
      message: e.message,
    });
  });
  return errors;
};
