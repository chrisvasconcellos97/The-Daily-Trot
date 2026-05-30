const W = 390, N = 5, scW = W / N
const bodyH = 105
const scR = scW * 0.5
const svgH = bodyH + scR + 48
const k = 0.5523
const MOUNT = '#112217'

function scallopPath(i) {
  const x0 = i * scW, x1 = x0 + scW, cx = x0 + scW / 2
  const ty = bodyH + scR
  return `M${x0},${bodyH} C${x0},${bodyH + k * scR} ${cx - k * scR},${ty} ${cx},${ty} C${cx + k * scR},${ty} ${x1},${bodyH + k * scR} ${x1},${bodyH} Z`
}

const PATHS = Array.from({ length: N }, (_, i) => scallopPath(i))

function AwningBase({ colors, uid }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${svgH}`}
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      <defs>
        <linearGradient id={`${uid}-shadow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.22)"/>
          <stop offset="40%"  stopColor="rgba(0,0,0,0.08)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </linearGradient>
        {colors.map((_, i) => (
          <linearGradient key={i} id={`${uid}-c${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(0,0,0,0.18)"/>
            <stop offset="18%"  stopColor="rgba(0,0,0,0.04)"/>
            <stop offset="50%"  stopColor="rgba(255,255,255,0.10)"/>
            <stop offset="82%"  stopColor="rgba(0,0,0,0.04)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.18)"/>
          </linearGradient>
        ))}
        {colors.map((_, i) => (
          <clipPath key={i} id={`${uid}-cc${i}`}>
            <rect x={i * scW} y="0" width={scW} height={svgH}/>
          </clipPath>
        ))}
        <clipPath id={`${uid}-sc`}>
          {PATHS.map((d, i) => <path key={i} d={d}/>)}
        </clipPath>
      </defs>

      {colors.map((c, i) => (
        <rect key={i} x={i * scW} y="10" width={scW} height={bodyH - 10} fill={c}/>
      ))}

      {colors.map((c, i) => (
        <path key={i} d={PATHS[i]} fill={c}/>
      ))}

      {colors.map((_, i) => (
        <rect key={i} x={i * scW} y="10" width={scW} height={svgH}
              fill={`url(#${uid}-c${i})`} clipPath={`url(#${uid}-cc${i})`}/>
      ))}

      <rect x="0" y={bodyH} width={W} height={scR + 10}
            fill="rgba(0,0,0,0.15)" clipPath={`url(#${uid}-sc)`}/>

      {/* Cast shadow — fades to nothing below the scallop tips */}
      <rect x="0" y={bodyH + scR - 4} width={W} height="52"
            fill={`url(#${uid}-shadow)`}/>

      <rect x="0" y="0" width={W} height="12" fill={MOUNT}/>
    </svg>
  )
}

export function AwningGreen() {
  return <AwningBase uid="ag" colors={['#1F3D2B', '#3B7254', '#1F3D2B', '#3B7254', '#1F3D2B']}/>
}

export function AwningCream() {
  return <AwningBase uid="ac" colors={['#1F3D2B', '#F2EBD8', '#1F3D2B', '#F2EBD8', '#1F3D2B']}/>
}

export default AwningGreen
