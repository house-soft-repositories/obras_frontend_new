import { ErrorTranslator } from "./error_translator";

export const AUTH_INVALID_CREDENTIALS_MESSAGE =
  "E-mail ou senha inválidos. Confira seus dados e tente novamente.";
export const AUTH_REQUIRED_FIELDS_MESSAGE =
  "Informe seu e-mail e sua senha para entrar.";
export const AUTH_UNAVAILABLE_MESSAGE =
  "Não foi possível entrar agora. Tente novamente em instantes.";

export class AuthErrorTranslator extends ErrorTranslator {
  protected readonly messages: Record<string, string> = {
    AUTH_INVALID_CREDENTIALS: AUTH_INVALID_CREDENTIALS_MESSAGE,
    INVALID_CREDENTIALS: AUTH_INVALID_CREDENTIALS_MESSAGE,
    CREDENTIALS_SIGNIN: AUTH_INVALID_CREDENTIALS_MESSAGE,
    credentials: AUTH_INVALID_CREDENTIALS_MESSAGE,
    CredentialsSignin: AUTH_INVALID_CREDENTIALS_MESSAGE,
    AUTH_REQUIRED_FIELDS: AUTH_REQUIRED_FIELDS_MESSAGE,
    AUTH_UNAVAILABLE: AUTH_UNAVAILABLE_MESSAGE,
    "500": AUTH_UNAVAILABLE_MESSAGE,
    "503": AUTH_UNAVAILABLE_MESSAGE,
  };
}

export const authErrorTranslator = new AuthErrorTranslator();
