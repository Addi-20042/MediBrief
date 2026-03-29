import { useEffect } from "react";
import { APP_NAME, APP_DESCRIPTION, getSiteUrl } from "@/lib/site";

interface PageMetaOptions {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

const upsertMetaTag = (selector: string, attributes: Record<string, string>, content: string) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => {
      element?.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

export const usePageMeta = ({
  title,
  description = APP_DESCRIPTION,
  path,
  noIndex = false,
}: PageMetaOptions) => {
  useEffect(() => {
    const pageTitle = title === APP_NAME ? APP_NAME : `${title} | ${APP_NAME}`;
    document.title = pageTitle;

    upsertMetaTag('meta[name="description"]', { name: "description" }, description);
    upsertMetaTag('meta[property="og:title"]', { property: "og:title" }, pageTitle);
    upsertMetaTag('meta[property="og:description"]', { property: "og:description" }, description);
    upsertMetaTag('meta[name="twitter:title"]', { name: "twitter:title" }, pageTitle);
    upsertMetaTag('meta[name="twitter:description"]', { name: "twitter:description" }, description);
    upsertMetaTag('meta[name="robots"]', { name: "robots" }, noIndex ? "noindex, nofollow" : "index, follow");

    const siteUrl = getSiteUrl();
    if (path && siteUrl) {
      const canonicalUrl = `${siteUrl}${path}`;
      let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }

      link.setAttribute("href", canonicalUrl);
      upsertMetaTag('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
    }
  }, [description, noIndex, path, title]);
};
