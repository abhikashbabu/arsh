function removeElementsByClass(html: string, tagName: string, className: string) {
  const opening = new RegExp(`<${tagName}\\b(?=[^>]*\\bclass=["'][^"']*\\b${className}\\b[^"']*["'])[^>]*>`, "i");
  let result = html;
  let match: RegExpExecArray | null;
  while ((match = opening.exec(result))) {
    const tags = new RegExp(`<${tagName}\\b[^>]*>|<\\/${tagName}\\s*>`, "gi");
    tags.lastIndex = match.index;
    let depth = 0;
    let tag: RegExpExecArray | null;
    while ((tag = tags.exec(result))) {
      depth += tag[0].startsWith(`</`) ? -1 : 1;
      if (depth === 0) {
        result = result.slice(0, match.index) + result.slice(tags.lastIndex);
        break;
      }
    }
    if (depth !== 0) break;
  }
  return result;
}

function removeElementById(html: string, tagName: string, id: string) {
  const opening = new RegExp(`<${tagName}\\b(?=[^>]*\\bid=["']${id}["'])[^>]*>`, "i");
  let result = html;
  const match = opening.exec(result);
  if (!match) return result;
  const tags = new RegExp(`<${tagName}\\b[^>]*>|<\\/${tagName}\\s*>`, "gi");
  tags.lastIndex = match.index;
  let depth = 0;
  let tag: RegExpExecArray | null;
  while ((tag = tags.exec(result))) {
    depth += tag[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return result.slice(0, match.index) + result.slice(tags.lastIndex);
  }
  return result;
}

/** Remove page-authored chrome; the root layout renders the single shared header. */
export function stripLegacySiteChrome(body: string) {
  let result = removeElementsByClass(body, "div", "topbar");
  result = removeElementsByClass(result, "header", "site-header");
  result = removeElementById(result, "div", "searchModal");
  result = removeElementById(result, "div", "scrim");
  result = removeElementById(result, "aside", "drawer");
  return result;
}

export const siteNavigationCss = `
.site-header{position:sticky;top:0;z-index:1030;isolation:isolate}
.site-header .wrap{gap:.7rem}
.site-header .mega{position:absolute;left:0;right:0;top:100%;z-index:1031;background:#fff;border-top:1px solid #dce9f4;box-shadow:0 28px 55px rgba(7,61,120,.16);opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .2s,transform .2s,visibility .2s;max-height:calc(100vh - 76px);overflow:auto}
.site-header .mega.open{opacity:1;visibility:visible;transform:none}
.source-page-facilities .page-hero{padding:clamp(2rem,4.5vw,4rem) 0 clamp(2.4rem,5vw,4.4rem)}
.source-page-facilities .page-hero .breadcrumb{margin-bottom:1rem}
.site-header .mega-in{display:grid;grid-template-columns:minmax(210px,260px) 1fr;gap:1.25rem;padding-block:1.25rem}
.site-header .mega-side{background:linear-gradient(145deg,#073d78,#1267bd);color:#fff;border-radius:18px;padding:1.2rem;display:flex;flex-direction:column;align-items:flex-start}
.site-header .mega-count{font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#d8ebfb;margin-bottom:.7rem}
.site-header .mega-side h3{color:#fff;font-size:1.2rem;font-weight:800;margin:0 0 .35rem}
.site-header .mega-side p{font-size:.82rem;color:#d8ebfb;margin:0 0 .9rem}
.site-header .mega-side .btn{font-size:.8rem;padding:.5rem .85rem;box-shadow:none}
.site-header .mega-link{margin-top:.7rem;color:#fff;font-size:.82rem;font-weight:700}
.site-header .mgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.3rem;align-content:start}
.site-header .mi{display:flex;gap:.6rem;align-items:center;padding:.55rem;border-radius:12px;text-decoration:none}
.site-header .mi:hover{background:#eef7fd}
.site-header .mi-ic{width:38px;height:38px;border-radius:11px;background:#eef7fd;color:#1267bd;display:grid;place-items:center;flex:none}
.site-header .mi b{display:block;color:#073d78;font-size:.82rem;line-height:1.25}
.site-header .mi small{display:block;color:#5f7387;font-size:.69rem;line-height:1.3;margin-top:.1rem}
.main-nav .mega-trigger{border:0;background:transparent;display:flex;align-items:center;gap:.35rem;padding:.5rem .65rem;border-radius:10px;color:#244665;font-family:inherit;font-size:.88rem;font-weight:600;cursor:pointer}
.main-nav .mega-trigger:hover,.main-nav .mega-trigger.active,.main-nav .mega-trigger[aria-expanded=true]{background:#eef7fd;color:#1267bd}
.main-nav .mega-trigger i{font-size:.68rem;transition:transform .2s}
.main-nav .mega-trigger[aria-expanded=true] i{transform:rotate(180deg)}
.header-emergency{display:flex;align-items:center;gap:.55rem;padding:.42rem .72rem;border:1px solid #f2c9ce;border-radius:12px;background:#fff8f8;color:#d7192e;font-size:.76rem;font-weight:700;line-height:1.15;white-space:nowrap}
.header-emergency>i{width:32px;height:32px;border-radius:10px;background:#ffe7e9;display:grid;place-items:center;font-size:.95rem}
.header-emergency small{display:block;color:#7c8997;font-size:.65rem;font-weight:600;margin-bottom:.1rem}
.header-emergency:hover{background:#fff0f1;color:#b9132a;border-color:#edabb3}
.ditem{display:block}
.drawer-links .dacc{width:100%;display:flex;align-items:center;gap:.9rem;padding:.65rem .7rem;border:0;background:transparent;border-radius:14px;font-family:inherit;font-size:.95rem;font-weight:600;color:#073d78;text-align:left;cursor:pointer}
.drawer-links .dacc>i{width:38px;height:38px;border-radius:12px;background:#eef7fd;color:#1267bd;display:grid;place-items:center;font-size:1.05rem}
.drawer-links .dacc::after{content:"⌄";margin-left:auto;color:#7891a8;transition:transform .2s}
.drawer-links .dacc[aria-expanded=true]{background:#eef7fd}
.drawer-links .dacc[aria-expanded=true]::after{transform:rotate(180deg)}
.drawer-links .dsub{display:grid;grid-template-rows:0fr;transition:grid-template-rows .25s ease}
.drawer-links .dsub.open{grid-template-rows:1fr}
.drawer-links .dsub>div{overflow:hidden;padding-left:1rem}
.drawer-links .dsub a{display:flex;align-items:center;gap:.6rem;padding:.55rem .65rem;font-size:.86rem;font-weight:500;color:#244665;border-radius:10px}
.drawer-links .dsub a::after{display:none}
.drawer-links .dsub a i{width:28px;height:28px;border-radius:9px;background:#eef7fd;color:#1267bd;display:grid;place-items:center;font-size:.84rem}
.drawer-links .dsub a.dall{color:#1267bd;font-weight:700}
@media(max-width:1199.98px){.site-header .mega-in{grid-template-columns:210px 1fr}.site-header .mgrid{grid-template-columns:repeat(2,minmax(0,1fr))}.header-emergency{display:grid;place-items:center;width:42px;height:42px;padding:0;border:0;border-radius:12px;background:#d7192e;color:#fff;flex:none}.header-emergency>i{width:auto;height:auto;background:transparent;color:#fff}.header-emergency span{display:none}}
@media(max-width:991.98px){.site-header .mega{display:none}.header-emergency{display:none}}
@media(prefers-reduced-motion:reduce){.site-header .mega,.drawer-links .dsub{transition:none}}
`;
