import { env } from "@/core/config/enviroment_variables";
import {
  AuthInterceptor,
  LogInterceptor,
} from "@/core/rest_client/interceptors";
import { ApiKeyInterceptor } from "@/core/rest_client/interceptors/api_key_interceptor";
import { HttpClient } from "./http_client";
const api = HttpClient.getInstance(env.NEXT_API_URL);

const loggingRequest = env.NEXT_SHOW_LOGGING_RESQUEST;
const logginResponse = env.NEXT_SHOW_LOGGING_RESPONSE;
const logginError = env.NEXT_SHOW_LOGGING_ERROR;

api.addInterceptor(
  new LogInterceptor(loggingRequest, logginResponse, logginError),
);
api.addInterceptor(new AuthInterceptor());
api.addInterceptor(new ApiKeyInterceptor());

export default api;
