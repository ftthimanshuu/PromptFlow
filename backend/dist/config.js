"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default("5000").transform((val) => parseInt(val, 10)),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    SUPABASE_URL: zod_1.z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().optional(),
    SUPABASE_ANON_KEY: zod_1.z.string().optional(),
    GEMINI_API_KEY: zod_1.z.string().optional(),
    TELEGRAM_BOT_TOKEN: zod_1.z.string().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid environment configuration:", parsed.error.format());
}
exports.config = parsed.success ? parsed.data : {
    PORT: 5000,
    NODE_ENV: "development",
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
};
