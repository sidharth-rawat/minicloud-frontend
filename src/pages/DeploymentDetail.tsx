import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, api } from '../api'
import { LogBadge, StatusBadge } from '../components/StatusBadge'
import type { Deployment, DeploymentLog } from '../types'
import { formatDate, formatDuration, formatTime, shortSha } from '../utils'

const POLL_MS = 3000

export function DeploymentDetail() {
  const { id, deploymentId } = useParams<{ id: string; deploymentId: string }>()

  const [deployment, setDeployment] = useState<Deployment | null>(null)
  const [logs, setLogs] = useState<DeploymentLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const logEndRef = useRef<HTMLDivElement | null>(null)

  const refresh = useCallback(async () => {
    if (!id || !deploymentId) return
    const [dep, logList] = await Promise.all([
      api.getDeployment(id, deploymentId),
      api.getDeploymentLogs(id, deploymentId),
    ])
    setDeployment(dep)
    setLogs(logList)
  }, [id, deploymentId])

  useEffect(() => {
    let cancelled = false
    async function initial() {
      setError(null)
      try {
        await refresh()
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof ApiError ? err.message : 'Failed to load deployment.',
          )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void initial()
    return () => {
      cancelled = true
    }
  }, [refresh])

  const isDeploying = deployment?.status === 'DEPLOYING'

  useEffect(() => {
    if (!isDeploying) return
    const timer = setInterval(() => {
      void refresh().catch(() => {
        /* keep last known state on transient errors */
      })
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [isDeploying, refresh])

  // Keep the log view scrolled to the newest line while deploying.
  useEffect(() => {
    if (isDeploying) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [logs, isDeploying])

  if (loading) {
    return (
      <div className="center-block">
        <div className="spinner" aria-label="Loading" />
      </div>
    )
  }

  if (error || !deployment) {
    return (
      <div className="page">
        <div className="alert alert-error">{error ?? 'Deployment not found.'}</div>
        <Link to={id ? `/projects/${id}` : '/'} className="btn btn-ghost">
          ← Back
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/">Projects</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/projects/${id}`}>Project #{deployment.projectId}</Link>
        <span aria-hidden="true">/</span>
        <span>Deployment #{deployment.id}</span>
      </div>

      <div className="page-head">
        <div>
          <h1 className="page-title">Deployment #{deployment.id}</h1>
          <p className="page-sub">
            <span className="mono">{deployment.branch}</span> @{' '}
            <span className="mono">{shortSha(deployment.commitHash)}</span>
          </p>
        </div>
        <StatusBadge status={deployment.status} />
      </div>

      <section className="card section">
        <h2 className="section-title">Details</h2>
        <dl className="meta-grid">
          <div>
            <dt>Branch</dt>
            <dd className="mono">{deployment.branch}</dd>
          </div>
          <div>
            <dt>Commit</dt>
            <dd className="mono" title={deployment.commitHash}>
              {shortSha(deployment.commitHash)}
            </dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatDate(deployment.createdAt)}</dd>
          </div>
          <div>
            <dt>Started</dt>
            <dd>{formatDate(deployment.startedAt)}</dd>
          </div>
          <div>
            <dt>Finished</dt>
            <dd>{formatDate(deployment.finishedAt)}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd className="mono">
              {formatDuration(deployment.startedAt, deployment.finishedAt)}
            </dd>
          </div>
        </dl>

        {deployment.errorMessage && (
          <div className="alert alert-error error-message">
            <strong>Error:</strong> {deployment.errorMessage}
          </div>
        )}
      </section>

      <section className="card section">
        <div className="section-head">
          <h2 className="section-title">
            Logs
            {isDeploying && <span className="live-pill">live</span>}
          </h2>
          <span className="muted small">{logs.length} lines</span>
        </div>

        <div className="terminal" role="log" aria-live="polite">
          {logs.length === 0 ? (
            <div className="terminal-empty">
              {isDeploying ? 'Waiting for logs…' : 'No logs available.'}
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="log-line">
                <span className="log-time">{formatTime(log.createdAt)}</span>
                <LogBadge level={log.status} />
                <span className={`log-msg log-msg-${log.status.toLowerCase()}`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          {isDeploying && (
            <div className="log-line log-cursor">
              <span className="cursor-blink" aria-hidden="true">
                ▋
              </span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </section>
    </div>
  )
}
