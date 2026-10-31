"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabaseAdmin = getSupabaseAdmin;
exports.getUserSupabaseClient = getUserSupabaseClient;
const supabase_js_1 = require("@supabase/supabase-js");
const config_js_1 = require("../config.js");
let adminClient = null;
/**
 * Returns the Supabase Admin Client (using service_role key).
 * Bypasses RLS for backend daemon, cron execution, and system logging.
 */
function getSupabaseAdmin() {
    if (adminClient)
        return adminClient;
    const url = config_js_1.config.SUPABASE_URL;
    const key = config_js_1.config.SUPABASE_SERVICE_ROLE_KEY || config_js_1.config.SUPABASE_ANON_KEY;
    if (!url || !key) {
        console.warn("Supabase credentials are not fully configured in backend/.env. Database operations will be mocked or skipped.");
    }
    adminClient = (0, supabase_js_1.createClient)(url || "https://placeholder-project.supabase.co", key || "placeholder-key", {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
    return adminClient;
}
/**
 * Returns a Supabase client scoped to a user's JWT token (respecting RLS).
 */
function getUserSupabaseClient(jwtToken) {
    const url = config_js_1.config.SUPABASE_URL || "https://placeholder-project.supabase.co";
    const anonKey = config_js_1.config.SUPABASE_ANON_KEY || "placeholder-key";
    return (0, supabase_js_1.createClient)(url, anonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
