import { defineMiddleware } from 'astro:middleware';
import { getStoreByDomainOrId } from './lib/db/storeRepo';

export const onRequest = defineMiddleware(async (context, next) => {
  const db = context.locals.runtime?.env?.DB;
  if (!db) {
    return next();
  }

  const url = new URL(context.request.url);
  const hostname = url.hostname; // misal 'localhost', 'navanusa', atau custom domain pelanggan

  // Cari data tenant di D1
  const store = await getStoreByDomainOrId(db, hostname);

  if (store) {
    context.locals.store = store;
  }

  return next();
});
