const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export const GTM_CONTAINER_ID = GTM_ID;

export function isGTMAnabled() {
  return Boolean(GTM_ID);
}
