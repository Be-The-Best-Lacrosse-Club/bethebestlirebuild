import { createClient, OAuthStrategy } from "@wix/sdk"
import { items } from "@wix/data"

export const wixClient = createClient({
  auth: OAuthStrategy({ clientId: import.meta.env.VITE_WIX_CLIENT_ID as string }),
  modules: { items },
})
