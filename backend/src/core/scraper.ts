import axios from "axios";
import * as cheerio from "cheerio";
import dns from "dns/promises";
import { URL } from "url";
import { ScrapeConfig } from "../types/dsl.js";

/**
 * Checks whether an IP address belongs to private/internal/loopback ranges.
 * Defends against Server-Side Request Forgery (SSRF).
 */
function isPrivateIp(ip: string): boolean {
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
      if (secondOctet >= 16 && secondOctet <= 31) return true;
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
export async function validateSafeUrl(targetUrl: string): Promise<void> {
  const parsed = new URL(targetUrl);

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
    const lookup = await dns.lookup(hostname);
    if (isPrivateIp(lookup.address)) {
      throw new Error(`SSRF Prevention: Host "${hostname}" resolves to private address "${lookup.address}".`);
    }
  } catch (err: any) {
    if (err.message.includes("SSRF Prevention")) throw err;
    throw new Error(`DNS Resolution failed for "${hostname}": ${err.message}`);
  }
}

export interface ScrapeResult {
  text: string;
  url: string;
  title: string;
  char_count: number;
}

/**
 * Asynchronously scrapes website text, strips layout fluff, and normalizes text.
 */
export async function scrapeWebsite(config: ScrapeConfig): Promise<ScrapeResult> {
  await validateSafeUrl(config.url);

  let response;
  try {
    response = await axios.get(config.url, {
      timeout: 10000, // 10 second safety timeout
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Upgrade-Insecure-Requests": "1",
      },
      maxContentLength: 5 * 1024 * 1024, // Max 5MB raw HTML
    });
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 403 || status === 401 || status === 429) {
        throw new Error(
          `The scraper cannot access this website due to anti-bot protection or access restrictions (HTTP ${status}). Please try an alternate website or public source.`
        );
      }
      if (status === 404) {
        throw new Error(
          `The target page was not found (HTTP 404). Please verify that the URL is correct.`
        );
      }
      if (status && status >= 500) {
        throw new Error(
          `The target website's server encountered an internal error (HTTP ${status}). Please try an alternate source.`
        );
      }
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        throw new Error(
          `The connection timed out while loading the website. The server may be unresponsive or blocking automated connections. Please try an alternate site.`
        );
      }
    }
    throw err;
  }

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

