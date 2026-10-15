import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError, api } from '../api'
import { StatusBadge } from '../components/StatusBadge'
import type { Deployment, Project } from '../types'
import { formatDate, formatDuration, shortSha } from '../utils'

const POLL_MS = 4000

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)

  const [branch, setBranch] = useState('main')
  const [commitHash, setCommitHash] = useState('')
  const [creating, setCreating] = useState(false)

  const loadDeployments = useCallback(async () => {
    if (!id) return
    const data = await api.listDeployments(id)
    setDeployments(data)
  }, [id])

  const loadAll = useCallback(async () => {
    if (!id) return
    setError(null)
    try {
      const [proj, deps] = await Promise.all([
        api.getProject(id),
        api.listDeployments(id),
      ])
      setProject(proj)
      setDeployments(deps)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load project.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  // Auto-refresh while any deployment is in progress.
  const hasActive = deployments.some((d) => d.status === 'DEPLOYING')
  const hasActiveRef = useRef(hasActive)
  hasActiveRef.current = hasActive

  useEffect(() => {
    if (!hasActive) return
    const timer = setInterval(() => {
      void loadDeployments().catch(() => {
        /* keep last known state on transient errors */
      })
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [hasActive, loadDeployments])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await loadDeployments()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Refresh failed.')
    } finally {
      setRefreshing(false)
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!id) return
    setActionError(null)
    setCreating(true)
    try {
      await api.createDeployment(id, {
        branch: branch.trim() || 'main',
        commitHash: commitHash.trim(),
      })
      setCommitHash('')
      await loadDeployments()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Deployment failed.')
    } finally {
      setCreating(false)
    }
  }

  async function handleRetry(dep: Deployment) {
    if (!id) return
    setActionError(null)
    setBusyId(dep.id)
    try {
      await api.retryDeployment(id, dep.id)
      await loadDeployments()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Retry failed.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleRollback(dep: Deployment) {
    if (!id) return
    if (
      !window.confirm(
        `Roll back by redeploying commit ${shortSha(dep.commitHash)}?`,
      )
    )
      return
    setActionError(null)
    setBusyId(dep.id)
    try {
      await api.rollbackDeployment(id, dep.id)
      await loadDeployments()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Rollback failed.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDeleteProject() {
    if (!id || !project) return
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return
    try {
      await api.deleteProject(id)
      navigate('/', { replace: true })
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Delete failed.')
    }
  }

  if (loading) {
    return (
      <div className="center-block">
        <div className="spinner" aria-label="Loading" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="page">
        <div className="alert alert-error">{error ?? 'Project not found.'}</div>
        <Link to="/" className="btn btn-ghost">
          ← Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/">Projects</Link>
        <span aria-hidden="true">/</span>
        <span>{project.name}</span>
      </div>

      <div className="page-head">
        <div>
          <h1 className="page-title">{project.name}</h1>
          {project.description && (
            <p className="page-sub">{project.description}</p>
          )}
          {project.repositoryUrl && (
            <a
              className="project-repo mono"
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
            >
              {project.repositoryUrl.replace('https://github.com/', 'github.com/')}
            </a>
          )}
          <p className="muted small">Created {formatDate(project.createdAt)}</p>
        </div>
        <button
          type="button"
          className="btn btn-danger-ghost"
          onClick={handleDeleteProject}
        >
          Delete project
        </button>
      </div>

      <section className="card section">
        <h2 className="section-title">New deployment</h2>
        <form className="deploy-form" onSubmit={handleCreate}>
          <label className="field">
            <span>Branch</span>
            <input
              type="text"
              className="mono"
              value={branch}
              required
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
            />
          </label>
          <label className="field">
            <span>Commit hash</span>
            <input
              type="text"
              className="mono"
              value={commitHash}
              required
              onChange={(e) => setCommitHash(e.target.value)}
              placeholder="e.g. a1b2c3d4e5f6…"
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={creating || !commitHash.trim()}
          >
            {creating ? 'Deploying…' : 'Deploy'}
          </button>
        </form>
      </section>

      <section className="card section">
        <div className="section-head">
          <h2 className="section-title">
            Deployments
            {hasActive && <span className="live-pill">live</span>}
          </h2>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>

        {actionError && <div className="alert alert-error">{actionError}</div>}

        {deployments.length === 0 ? (
          <p className="muted">No deployments yet. Trigger one above.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Branch</th>
                  <th>Commit</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Started</th>
                  <th>Finished</th>
                  <th>Duration</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((d) => (
                  <tr key={d.id}>
                    <td className="mono">#{d.id}</td>
                    <td className="mono">{d.branch}</td>
                    <td className="mono">{shortSha(d.commitHash)}</td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="muted small">{formatDate(d.createdAt)}</td>
                    <td className="muted small">{formatDate(d.startedAt)}</td>
                    <td className="muted small">{formatDate(d.finishedAt)}</td>
                    <td className="mono small">
                      {formatDuration(d.startedAt, d.finishedAt)}
                    </td>
                    <td className="col-actions">
                      <div className="row-actions">
                        <Link
                          to={`/projects/${project.id}/deployments/${d.id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          Logs
                        </Link>
                        {d.status === 'ERROR' && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={busyId === d.id}
                            onClick={() => handleRetry(d)}
                          >
                            {busyId === d.id ? '…' : 'Retry'}
                          </button>
                        )}
                        {d.status === 'SUCCESS' && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={busyId === d.id}
                            onClick={() => handleRollback(d)}
                          >
                            {busyId === d.id ? '…' : 'Rollback'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
