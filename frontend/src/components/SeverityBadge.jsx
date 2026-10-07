import React from 'react'
import { AlertOctagon, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'

export function SeverityBadge({ severity }) {
  const sev = (severity || '').toUpperCase()

  let icon = <Info size={13} />
  let className = 'badge-medium'

  if (sev === 'CRITICAL') {
    icon = <AlertOctagon size={13} />
    className = 'badge-critical'
  } else if (sev === 'HIGH') {
    icon = <AlertTriangle size={13} />
    className = 'badge-high'
  } else if (sev === 'MEDIUM') {
    icon = <Info size={13} />
    className = 'badge-medium'
  } else if (sev === 'SAFE') {
    icon = <CheckCircle2 size={13} />
    className = 'badge-safe'
  }

  return (
    <span className={`severity-badge ${className}`}>
      {icon}
      <span>{sev}</span>
    </span>
  )
}

