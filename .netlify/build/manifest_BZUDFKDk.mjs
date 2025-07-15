import '@astrojs/internal-helpers/path';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_HEADER, k as decodeKey } from './chunks/astro/server_C1RCjSvS.mjs';
import 'clsx';
import 'cookie';
import 'es-module-lexer';
import 'html-escaper';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

const codeToStatusMap = {
  // Implemented from IANA HTTP Status Code Registry
  // https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  CONTENT_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_CONTENT: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NETWORK_AUTHENTICATION_REQUIRED: 511
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/gord/dev/my-website/","cacheDir":"file:///Users/gord/dev/my-website/node_modules/.astro/","outDir":"file:///Users/gord/dev/my-website/dist/","srcDir":"file:///Users/gord/dev/my-website/src/","publicDir":"file:///Users/gord/dev/my-website/public/","buildClientDir":"file:///Users/gord/dev/my-website/dist/","buildServerDir":"file:///Users/gord/dev/my-website/.netlify/build/","adapterName":"@astrojs/netlify","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/blog","isIndex":true,"type":"page","pattern":"^\\/blog\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/index.astro","pathname":"/blog","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"fieldNotes/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/fieldnotes","isIndex":true,"type":"page","pattern":"^\\/fieldNotes\\/?$","segments":[[{"content":"fieldNotes","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/fieldNotes/index.astro","pathname":"/fieldNotes","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"publications/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/publications","isIndex":false,"type":"page","pattern":"^\\/publications\\/?$","segments":[[{"content":"publications","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/publications.astro","pathname":"/publications","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"rss.xml","links":[],"scripts":[],"styles":[],"routeData":{"route":"/rss.xml","isIndex":false,"type":"endpoint","pattern":"^\\/rss\\.xml\\/?$","segments":[[{"content":"rss.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rss.xml.js","pathname":"/rss.xml","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://example.com","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/gord/dev/my-website/src/pages/blog/index.astro",{"propagation":"in-tree","containsHead":true}],["/Users/gord/dev/my-website/src/pages/fieldNotes/index.astro",{"propagation":"in-tree","containsHead":true}],["/Users/gord/dev/my-website/src/pages/publications.astro",{"propagation":"none","containsHead":true}],["/Users/gord/dev/my-website/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/gord/dev/my-website/src/pages/about.astro",{"propagation":"none","containsHead":true}],["/Users/gord/dev/my-website/src/pages/blog/[...slug].astro",{"propagation":"in-tree","containsHead":true}],["/Users/gord/dev/my-website/src/pages/fieldNotes/[...slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/blog/[...slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/blog/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/fieldNotes/[...slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/fieldNotes/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/gord/dev/my-website/src/pages/rss.xml.js",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/rss.xml@_@js",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/blog/index@_@astro":"pages/blog.astro.mjs","\u0000@astro-page:src/pages/blog/[...slug]@_@astro":"pages/blog/_---slug_.astro.mjs","\u0000@astro-page:src/pages/fieldNotes/index@_@astro":"pages/fieldnotes.astro.mjs","\u0000@astro-page:src/pages/fieldNotes/[...slug]@_@astro":"pages/fieldnotes/_---slug_.astro.mjs","\u0000@astro-page:src/pages/publications@_@astro":"pages/publications.astro.mjs","\u0000@astro-page:src/pages/rss.xml@_@js":"pages/rss.xml.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_BZUDFKDk.mjs","/Users/gord/dev/my-website/node_modules/unstorage/drivers/netlify-blobs.mjs":"chunks/netlify-blobs_Cc2jag08.mjs","/Users/gord/dev/my-website/.astro/content-assets.mjs":"chunks/content-assets_C5HYgPOr.mjs","/Users/gord/dev/my-website/.astro/content-modules.mjs":"chunks/content-modules_BqimhQXa.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_D0-fQguf.mjs","/Users/gord/dev/my-website/src/content/blog/omscs-review-dl.mdx?astroPropagatedAssets":"chunks/omscs-review-dl_C8dJmGdy.mjs","/Users/gord/dev/my-website/src/content/blog/omscs-review-ml.mdx?astroPropagatedAssets":"chunks/omscs-review-ml_BShgBei3.mjs","/Users/gord/dev/my-website/src/content/blog/omscs-review-sdp.mdx?astroPropagatedAssets":"chunks/omscs-review-sdp_BZIadTk2.mjs","/Users/gord/dev/my-website/src/content/blog/omscs-review-ml4t.mdx?astroPropagatedAssets":"chunks/omscs-review-ml4t_BJZnm5_6.mjs","/Users/gord/dev/my-website/src/content/blog/user-dev-spectrum.mdx?astroPropagatedAssets":"chunks/user-dev-spectrum_D026B3tv.mjs","/Users/gord/dev/my-website/src/content/blog/old-blogs/old-blogs.mdx?astroPropagatedAssets":"chunks/old-blogs_DZQqVebj.mjs","/Users/gord/dev/my-website/src/content/blog/omscs-review-ns.mdx?astroPropagatedAssets":"chunks/omscs-review-ns_4UJZiHBd.mjs","/Users/gord/dev/my-website/src/content/fieldNotes/stinkhorns-modoc/stinkhorns-modoc.mdx?astroPropagatedAssets":"chunks/stinkhorns-modoc_BG-sejk1.mjs","/Users/gord/dev/my-website/src/content/blog/omscs-review-dl.mdx":"chunks/omscs-review-dl_ClX4LE72.mjs","/Users/gord/dev/my-website/src/content/blog/omscs-review-ml.mdx":"chunks/omscs-review-ml_BRPymbvV.mjs","/Users/gord/dev/my-website/src/content/blog/omscs-review-sdp.mdx":"chunks/omscs-review-sdp_DFUAi_FD.mjs","/Users/gord/dev/my-website/src/content/blog/omscs-review-ml4t.mdx":"chunks/omscs-review-ml4t_DUIMsm7T.mjs","/Users/gord/dev/my-website/src/content/blog/user-dev-spectrum.mdx":"chunks/user-dev-spectrum_CWuq-GOo.mjs","\u0000astro:assets":"chunks/_astro_assets_DjDJfJee.mjs","/Users/gord/dev/my-website/src/content/blog/old-blogs/old-blogs.mdx":"chunks/old-blogs_DeWDMQIv.mjs","/Users/gord/dev/my-website/src/content/blog/omscs-review-ns.mdx":"chunks/omscs-review-ns_DypEiS7R.mjs","/Users/gord/dev/my-website/src/content/fieldNotes/stinkhorns-modoc/stinkhorns-modoc.mdx":"chunks/stinkhorns-modoc_BuVAaPTV.mjs","/Users/gord/dev/my-website/src/components/mdx/LightboxCarousel.astro?astro&type=script&index=1&lang.ts":"_astro/LightboxCarousel.astro_astro_type_script_index_1_lang.BKLJ6Wpj.js","/Users/gord/dev/my-website/src/pages/blog/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.XdtXsefy.js","/Users/gord/dev/my-website/src/pages/fieldNotes/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.DAD4iDhP.js","/Users/gord/dev/my-website/src/components/mdx/LightboxCarousel.astro?astro&type=script&index=0&lang.ts":"_astro/LightboxCarousel.astro_astro_type_script_index_0_lang.C_Ywpb1O.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/gord/dev/my-website/src/pages/blog/index.astro?astro&type=script&index=0&lang.ts","document.querySelectorAll(\".sidebar a\").forEach(t=>{t.addEventListener(\"click\",c=>{c.preventDefault();const s=t.dataset.topic;document.querySelectorAll(\".sidebar a\").forEach(e=>e.classList.remove(\"active\")),t.classList.add(\"active\"),document.querySelectorAll(\"ul.posts li\").forEach(e=>{const l=e.dataset.topics.split(\",\");!s||l.includes(s)?e.style.display=\"\":e.style.display=\"none\"})})});"],["/Users/gord/dev/my-website/src/pages/fieldNotes/index.astro?astro&type=script&index=0&lang.ts","document.querySelectorAll(\".sidebar a\").forEach(t=>{t.addEventListener(\"click\",c=>{c.preventDefault();const s=t.dataset.topic;document.querySelectorAll(\".sidebar a\").forEach(e=>e.classList.remove(\"active\")),t.classList.add(\"active\"),document.querySelectorAll(\"ul.posts li\").forEach(e=>{const l=e.dataset.topics.split(\",\");!s||l.includes(s)?e.style.display=\"\":e.style.display=\"none\"})})});"],["/Users/gord/dev/my-website/src/components/mdx/LightboxCarousel.astro?astro&type=script&index=0&lang.ts","document.addEventListener(\"DOMContentLoaded\",()=>{GLightbox({selector:\".glightbox\"})});"]],"assets":["/_astro/blog-placeholder-5.CB3Xi-gp.jpg","/_astro/blog-placeholder-4.gLBdjEDe.jpg","/_astro/blog-placeholder-about.BtEdEmGp.jpg","/_astro/joy-of-analysis-homepage.DomRO5T7.png","/_astro/joy-of-analysis-blog-example.CCtqIZfN.png","/_astro/hugo-apero-example.CKA7M817.png","/_astro/image4.WTtPvV__.JPEG","/_astro/image1.BRu0H5CY.JPEG","/_astro/blog-placeholder-1.Bx0Zcyzv.jpg","/_astro/image5.RGiCJkCB.JPEG","/_astro/image3.n8gyDkWA.JPEG","/_astro/image2.D2MOap4g.JPEG","/_astro/image0.JyLz-CAQ.JPEG","/_astro/about.B5S30bSI.css","/favicon.svg","/_astro/LightboxCarousel.astro_astro_type_script_index_1_lang.BKLJ6Wpj.js","/fonts/atkinson-bold.woff","/fonts/atkinson-regular.woff","/about/index.html","/blog/index.html","/fieldNotes/index.html","/publications/index.html","/rss.xml","/index.html"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"2jmrD3VsxZl9sKfIT0V6DI/lpWAcc5Oj5xw8+9zm8Vs=","sessionConfig":{"driver":"netlify-blobs","options":{"name":"astro-sessions","consistency":"strong"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/netlify-blobs_Cc2jag08.mjs');

export { manifest };
