"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSafeUrl = validateSafeUrl;
exports.scrapeWebsite = scrapeWebsite;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const promises_1 = __importDefault(require("dns/promises"));
const url_1 = require("url");
/**
 * Checks whether an IP address belongs to private/internal/loopback ranges.
 * Defends against Server-Side Request Forgery (SSRF).
 */
function isPrivateIp(ip) {
    // IPv4 Loopback & Link-local
    if (ip.startsWith("127.") || ip.startsWith("169.254.")) {
        return true;
    }
    // RFC 1918 Private ranges:
    // 10.0.0.0 - 10.255.255.255
    if (ip.startsWith("10.")) {
        return true;
    }
    // 172.16.0.0 - 172.31.255.255
    if (ip.startsWith("172.")) {
        const parts = ip.split(".");
        if (parts.length > 1) {
            const secondOctet = parseInt(parts[1], 10);
            if (secondOctet >= 16 && secondOctet <= 31)
                return true;
        }
    }
    // 192.168.0.0 - 192.168.255.255
    if (ip.startsWith("192.168.")) {
        return true;
    }
    // IPv6 loopback / unspecified
    if (ip === "::1" || ip === "::" || ip.toLowerCase().startsWith("fe80:")) {
        return true;
    }
    return false;
}
/**
 * Validates the target URL and enforces SSRF security boundaries.
 */
async function validateSafeUrl(targetUrl) {
    const parsed = new url_1.URL(targetUrl);
    // Protocol whitelist: only HTTP and HTTPS
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error(`Forbidden protocol: "${parsed.protocol}". Only HTTP and HTTPS are permitted.`);
    }
    const hostname = parsed.hostname.toLowerCase();
    // Deny localhost explicitly
    if (hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
        throw new Error(`Forbidden host: "${hostname}". Access to internal domains is blocked.`);
    }
    // Resolve DNS to IP to verify it's not a private subnet
    try {
        const lookup = await promises_1.default.lookup(hostname);
        if (isPrivateIp(lookup.address)) {
            throw new Error(`SSRF Prevention: Host "${hostname}" resolves to private address "${lookup.address}".`);
        }
    }
    catch (err) {
        if (err.message.includes("SSRF Prevention"))
            throw err;
        throw new Error(`DNS Resolution failed for "${hostname}": ${err.message}`);
    }
}
/**
 * Asynchronously scrapes website text, strips layout fluff, and normalizes text.
 */
async function scrapeWebsite(config) {
    await validateSafeUrl(config.url);
    const response = await axios_1.default.get(config.url, {
        timeout: 10000, // 10 second safety timeout
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 PromptFlow/1.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        },
        maxContentLength: 5 * 1024 * 1024, // Max 5MB raw HTML
    });
    const html = response.data;
    const $ = cheerio.load(html);
    // Strip non-content elements
    $("script, style, nav, header, footer, svg, noscript, iframe, meta, link").remove();
    const title = $("title").text().trim() || "";
    // Extract clean text with normalized whitespace
    let cleanText = $("body").text() || $.text();
    cleanText = cleanText
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
    const maxLength = config.max_length || 10000;
    if (cleanText.length > maxLength) {
        cleanText = cleanText.substring(0, maxLength) + " ...[truncated]";
    }
    return {
        text: cleanText,
        url: config.url,
        title,
        char_count: cleanText.length,
    };
}
