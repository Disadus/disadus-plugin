// eslint-disable-next-line no-eval
const fetchPromise: Promise<typeof fetch> = import("node-fetch")
  .then((mod: any) => mod.default)
  .catch((er) => {
    console.error("[APIWrapper]", "Fetch not found", er);
    throw er;
  });
export const nFetch: typeof globalThis.fetch = (...args) => {
  if (globalThis.fetch) {
    return globalThis.fetch(...args);
  }
  return fetchPromise.then((fetch) => fetch(...args));
};
export default nFetch;
