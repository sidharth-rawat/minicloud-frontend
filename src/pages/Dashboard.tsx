import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, api } from '../api'
import type { Project } from '../types'
import { formatDate, isValidGithubUrl } from '../utils'

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function load() {
    setError(null)
    try {
      const data = await api.listProjects()
      setProjects(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleDelete(project: Project) {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return
    setDeletingId(project.id)
    try {
      await api.deleteProject(project.id)
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete project.')
    } finally {
      setDeletingId(null)
    }
  }

  function handleCreated(project: Project) {
    setProjects((prev) => [project, ...prev])
    setShowForm(false)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-sub">Your deployed applications.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + New project
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="center-block">
          <div className="spinner" aria-label="Loading" />
        </div>
      ) : projects.length === 0 ? (
        <div className="empty card">
          <div className="empty-icon" aria-hidden="true">
            ☁
          </div>
          <h2>No projects yet</h2>
          <p>Create your first project to start deploying.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + New project
          </button>
        </div>
      ) : (
        <div className="grid">
          {projects.map((p) => (
            <div key={p.id} className="card project-card">
              <div className="project-card-body">
                <Link to={`/projects/${p.id}`} className="project-name">
                  {p.name}
                </Link>
                {p.description && (
                  <p className="project-desc">{p.description}</p>
                )}
                {p.repositoryUrl && (
                  <a
                    className="project-repo mono"
                    href={p.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {p.repositoryUrl.replace('https://github.com/', 'github.com/')}
                  </a>
                )}
              </div>
              <div className="project-card-foot">
                <span className="muted small">
                  Created {formatDate(p.createdAt)}
                </span>
                <div className="project-actions">
                  <Link to={`/projects/${p.id}`} className="btn btn-ghost btn-sm">
                    Open
                  </Link>
                  <button
                    type="button"
                    className="btn btn-danger-ghost btn-sm"
                    disabled={deletingId === p.id}
                    onClick={() => handleDelete(p)}
                  >
                    {deletingId === p.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <NewProjectModal
          onClose={() => setShowForm(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}

function NewProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (p: Project) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedRepo = repositoryUrl.trim()
    if (trimmedRepo && !isValidGithubUrl(trimmedRepo)) {
      setError(
        'Repository URL must look like https://github.com/<owner>/<repo>',
      )
      return
    }

    setSubmitting(true)
    try {
      const project = await api.createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        repositoryUrl: trimmedRepo || undefined,
      })
      onCreated(project)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create project.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal card"
        role="dialog"
        aria-modal="true"
        aria-label="New project"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>New project</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={name}
              required
              autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder="my-api"
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              value={description}
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this project do?"
            />
          </label>

          <label className="field">
            <span>Repository URL</span>
            <input
              type="url"
              className="mono"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
            />
          </label>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !name.trim()}
            >
              {submitting ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
