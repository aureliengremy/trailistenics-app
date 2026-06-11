/**
 * Loader plein écran : un petit randonneur gravit la montagne jusqu'au fanion.
 * SVG + SMIL (marche et trajet synchronisés sur la même horloge), couleurs du thème.
 */
export function PlanLoader({ label = "Chargement du plan" }: { label?: string }) {
  return (
    <div className="ldr" role="status" aria-label={`${label}…`}>
      <svg viewBox="0 0 220 140" width="250" aria-hidden="true">
        {/* Soleil */}
        <circle className="ldr-sun" cx="38" cy="30" r="11" />

        {/* Nuages */}
        <g className="ldr-cloud ldr-c1">
          <ellipse cx="168" cy="26" rx="15" ry="5.5" />
          <ellipse cx="157" cy="22" rx="9" ry="4.5" />
        </g>
        <g className="ldr-cloud ldr-c2">
          <ellipse cx="78" cy="52" rx="12" ry="4.5" />
          <ellipse cx="69" cy="49" rx="7" ry="3.5" />
        </g>

        {/* Montagnes */}
        <polygon className="ldr-mtn-back" points="58,122 128,50 198,122" />
        <polygon className="ldr-mtn" points="12,122 140,34 212,122" />

        {/* Sentier (pointillés qui remontent) */}
        <path className="ldr-trail" d="M26,118 L138,38" />

        {/* Fanion au sommet */}
        <line className="ldr-pole" x1="140" y1="34" x2="140" y2="17" />
        <path className="ldr-flag" d="M140,17 L153,20.5 L140,24 Z" />

        {/* Sol */}
        <line className="ldr-ground" x1="0" y1="122" x2="220" y2="122" />

        {/* Randonneur (pieds à l'origine), gravit le sentier en boucle */}
        <g className="ldr-hiker">
          <animateMotion dur="6s" repeatCount="indefinite" rotate="0" path="M26,118 L138,38" />
          <animate
            attributeName="opacity"
            values="0;1;1;1;0"
            keyTimes="0;0.06;0.5;0.96;1"
            dur="6s"
            repeatCount="indefinite"
          />
          {/* sac à dos */}
          <rect className="ldr-pack" x="-5.4" y="-15" width="3.6" height="6.6" rx="1.8" />
          {/* bras arrière */}
          <g transform="translate(0,-14.3)">
            <line className="ldr-limb" x1="0" y1="0" x2="0" y2="6.4" />
            <animateTransform
              attributeName="transform"
              type="rotate"
              additive="sum"
              values="-32 0 0;32 0 0;-32 0 0"
              dur="0.55s"
              repeatCount="indefinite"
            />
          </g>
          {/* jambe arrière */}
          <g transform="translate(0,-7.6)">
            <line className="ldr-limb" x1="0" y1="0" x2="0" y2="7.6" />
            <animateTransform
              attributeName="transform"
              type="rotate"
              additive="sum"
              values="30 0 0;-30 0 0;30 0 0"
              dur="0.55s"
              repeatCount="indefinite"
            />
          </g>
          {/* torse + tête */}
          <line className="ldr-body" x1="0" y1="-15.4" x2="0" y2="-7.6" />
          <circle className="ldr-head" cx="0" cy="-18.4" r="3" />
          {/* jambe avant */}
          <g transform="translate(0,-7.6)">
            <line className="ldr-limb" x1="0" y1="0" x2="0" y2="7.6" />
            <animateTransform
              attributeName="transform"
              type="rotate"
              additive="sum"
              values="-30 0 0;30 0 0;-30 0 0"
              dur="0.55s"
              repeatCount="indefinite"
            />
          </g>
          {/* bras avant */}
          <g transform="translate(0,-14.3)">
            <line className="ldr-limb" x1="0" y1="0" x2="0" y2="6.4" />
            <animateTransform
              attributeName="transform"
              type="rotate"
              additive="sum"
              values="32 0 0;-32 0 0;32 0 0"
              dur="0.55s"
              repeatCount="indefinite"
            />
          </g>
        </g>
      </svg>
      <div className="ldr-label">
        {label}
        <span className="ldr-dots" aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    </div>
  )
}
