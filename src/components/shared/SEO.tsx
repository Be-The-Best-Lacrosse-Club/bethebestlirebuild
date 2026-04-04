import { useEffect } from "react"

interface SEOProps {
  title: string
  description: string
  path?: string
  ogImage?: string
  ogType?: string
}

const BASE_URL = "https://bethebestli.com"
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/Be%20The%20Best%20Helmet%2C%20Merch%2C%20and%20Social%20Icon.png`

export function SEO({
  title,
  description,
  path = "",
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
}: SEOProps) {
  const canonicalUrl = `${BASE_URL}${path}`

  useEffect(() => {
    // Set document title
    document.title = title

    // Helper to set or create a meta tag
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement("meta")
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute("content", content)
    }

    // Standard meta
    setMeta("name", "description", description)

    // Open Graph
    setMeta("property", "og:title", title)
    setMeta("property", "og:description", description)
    setMeta("property", "og:image", ogImage)
    setMeta("property", "og:url", canonicalUrl)
    setMeta("property", "og:type", ogType)
    setMeta("property", "og:site_name", "BTB Lacrosse Club")

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image")
    setMeta("name", "twitter:title", title)
    setMeta("name", "twitter:description", description)
    setMeta("name", "twitter:image", ogImage)

    // Canonical link
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement("link")
      link.setAttribute("rel", "canonical")
      document.head.appendChild(link)
    }
    link.setAttribute("href", canonicalUrl)
  }, [title, description, canonicalUrl, ogImage, ogType])

  return null
}
