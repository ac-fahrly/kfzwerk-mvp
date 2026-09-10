/**
 * The login page's right-hand panel: a vector scene of the business this app
 * runs — a Kfz-Werkstatt service bay, with a car raised on a two-post lift,
 * a tool trolley, a tyre stack and shelved parts.
 *
 * Vector rather than a raster render, for the same reasons amazon-subs-fe's
 * login hero is vector: it is crisp at every viewport, it costs a few KB inside
 * the bundle instead of a network round-trip on the one page a user sees before
 * they have a session, and it is drawn in `currentColor` so it inherits the
 * primary palette and follows the light/dark toggle instead of needing two
 * exported images.
 *
 * Everything is decorative — `aria-hidden` throughout; the panel carries no
 * information that is not also in the headline text beside it.
 */
export function WorkshopHero() {
  return (
    <>
      {/* soft depth */}
      <div className="absolute -right-24 -top-24 size-96 rounded-full bg-primary-foreground/5 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-primary-foreground/5 blur-3xl" />

      {/* workshop floor grid */}
      <svg className="absolute inset-0 size-full text-primary-foreground/10" aria-hidden="true">
        <defs>
          <pattern id="werkstatt-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 H0 V40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#werkstatt-grid)" />
      </svg>

      {/* the service bay */}
      <svg
        className="absolute inset-0 size-full text-primary-foreground"
        viewBox="0 0 600 700"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* overhead LED strip */}
        <g opacity="0.22">
          <rect x="180" y="118" width="240" height="7" rx="3.5" fill="currentColor" />
          <rect x="150" y="128" width="300" height="26" rx="13" fill="currentColor" opacity="0.25" />
        </g>

        {/* parts shelving, back wall */}
        <g opacity="0.13" fill="currentColor">
          <rect x="60" y="200" width="120" height="6" />
          <rect x="60" y="252" width="120" height="6" />
          <rect x="60" y="304" width="120" height="6" />
          {/* boxes on the shelves */}
          <rect x="70" y="172" width="26" height="28" />
          <rect x="104" y="180" width="34" height="20" />
          <rect x="146" y="176" width="22" height="24" />
          <rect x="76" y="228" width="32" height="24" />
          <rect x="118" y="222" width="28" height="30" />
          <rect x="82" y="280" width="24" height="24" />
          <rect x="114" y="274" width="40" height="30" />
        </g>

        {/* two-post lift: posts + crossbeam */}
        <g opacity="0.3" fill="currentColor">
          <rect x="118" y="168" width="17" height="302" rx="2" />
          <rect x="465" y="168" width="17" height="302" rx="2" />
          <rect x="118" y="168" width="364" height="15" rx="3" />
          {/* base plates */}
          <rect x="104" y="462" width="45" height="9" rx="2" />
          <rect x="451" y="462" width="45" height="9" rx="2" />
          {/* lift arms under the car */}
          <rect x="135" y="371" width="112" height="8" rx="3" />
          <rect x="353" y="371" width="112" height="8" rx="3" />
        </g>

        {/* the raised car, side profile */}
        <g>
          {/* body */}
          <path
            d="M166 350 L166 334 C168 320 192 316 212 312 L238 286 L318 284 L348 312
               L418 316 C428 318 430 332 430 350 L412 350 Q390 318 368 350
               L237 350 Q215 318 193 350 Z"
            fill="currentColor"
            opacity="0.42"
          />
          {/* glass */}
          <g opacity="0.2" fill="currentColor">
            <path d="M245 290 L272 289 L272 310 L228 310 Z" />
            <path d="M281 289 L314 288 L334 310 L281 310 Z" />
          </g>
          {/* wheels */}
          <g fill="currentColor">
            <circle cx="215" cy="350" r="21" opacity="0.5" />
            <circle cx="390" cy="350" r="21" opacity="0.5" />
            <circle cx="215" cy="350" r="8.5" opacity="0.28" />
            <circle cx="390" cy="350" r="8.5" opacity="0.28" />
          </g>
        </g>

        {/* tool trolley on the floor */}
        <g opacity="0.17" fill="currentColor">
          <rect x="152" y="412" width="92" height="50" rx="4" />
          <rect x="162" y="424" width="72" height="4" rx="2" opacity="0.7" />
          <rect x="162" y="438" width="72" height="4" rx="2" opacity="0.7" />
          <circle cx="168" cy="466" r="6" />
          <circle cx="228" cy="466" r="6" />
        </g>

        {/* tyre stack */}
        <g opacity="0.15" fill="none" stroke="currentColor" strokeWidth="7">
          <ellipse cx="404" cy="452" rx="42" ry="13" />
          <ellipse cx="404" cy="432" rx="42" ry="13" />
          <ellipse cx="404" cy="412" rx="42" ry="13" />
        </g>

        {/* floor line */}
        <path d="M0 471 H600" stroke="currentColor" strokeWidth="2" opacity="0.22" />

        {/* gear + wrench motif, upper right — brand texture, kept away from
            the headline so it never competes with the text */}
        <g opacity="0.14" fill="none" stroke="currentColor" strokeWidth="4">
          <circle cx="508" cy="96" r="30" />
          <circle cx="508" cy="96" r="12" />
          <path d="M508 60 v-12 M508 132 v12 M472 96 h-12 M544 96 h12 M482 70 l-9-9 M534 122 l9 9 M534 70 l9-9 M482 122 l-9 9" />
        </g>
      </svg>
    </>
  );
}
