import type { DeploymentStatus, LogLevel } from '../types'

export function StatusBadge({ status }: { status: DeploymentStatus }) {
  const cls = `badge badge-${status.toLowerCase()}`
  return (
    <span className={cls}>
      {status === 'DEPLOYING' && <span className="badge-dot" aria-hidden="true" />}
      {status}
    </span>
  )
}

export function LogBadge({ level }: { level: LogLevel }) {
  return <span className={`log-level log-${level.toLowerCase()}`}>{level}</span>
}
