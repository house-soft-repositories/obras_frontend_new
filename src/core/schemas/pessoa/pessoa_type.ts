import { z } from "zod";

export const pessoaType = z.enum(["FISICA", "JURIDICA"])