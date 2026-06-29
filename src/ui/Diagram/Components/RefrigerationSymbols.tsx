interface SymbolProps {
  x: number
  y: number
  label: string
}

export const CompressorSVG = ({ x, y, label }: SymbolProps) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect width="90" height="48" rx="8" className="node" />
    <text x="10" y="28">{label}</text>
  </g>
)

export const CondenserSVG = ({ x, y, label }: SymbolProps) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect width="96" height="48" rx="8" className="node" />
    <text x="10" y="28">{label}</text>
  </g>
)

export const FilterSVG = ({ x, y, label }: SymbolProps) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect width="76" height="42" rx="8" className="node" />
    <text x="10" y="24">{label}</text>
  </g>
)

export const SightGlassSVG = ({ x, y, label }: SymbolProps) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle cx="20" cy="20" r="18" className="node" />
    <text x="46" y="24">{label}</text>
  </g>
)

export const ExpansionValveSVG = ({ x, y, label }: SymbolProps) => (
  <g transform={`translate(${x}, ${y})`}>
    <polygon points="10,10 44,24 10,38" className="node" />
    <text x="52" y="28">{label}</text>
  </g>
)

export const EvaporatorSVG = ({ x, y, label }: SymbolProps) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect width="110" height="52" rx="8" className="node" />
    <text x="12" y="30">{label}</text>
  </g>
)

export const Pipe = ({
  d,
  pressure,
}: {
  d: string
  pressure: 'HP' | 'BP' | 'MIXED'
}) => (
  <path d={d} className={`pipe-${pressure}`} strokeWidth="5" fill="none" />
)
