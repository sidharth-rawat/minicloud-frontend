import type {
  AuthUser,
  Deployment,
  DeploymentLog,
  Project,
  User,
} from './types'

export const API_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

const TOKEN_KEY = 'minicloud_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Thrown when a request fails. `status` is the HTTP status (0 for network errors).
 */
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Callback registered by the auth layer so that a 401/403 anywhere triggers logout.
let unauthorizedHandler: (() => void) | null = null
export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options
  const headers: Record<string, string> = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (auth) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Network error — is the API running?', 0)
  }

  if (res.status === 401 || res.status === 403) {
    if (unauthorizedHandler) unauthorizedHandler()
    throw new ApiError('Your session has expired. Please log in again.', res.status)
  }

  let data: unknown = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : null) ?? `Request failed (${res.status})`
    throw new ApiError(message, res.status)
  }

  return data as T
}

// ---- Auth ----
export const api = {
  register(body: {
    firstName: string
    lastName: string
    email: string
    password: string
  }): Promise<User> {
    return request<User>('/auth/register', { method: 'POST', body, auth: false })
  },

  login(body: { email: string; password: string }): Promise<AuthUser> {
    return request<AuthUser>('/auth/login', { method: 'POST', body, auth: false })
  },

  me(): Promise<User> {
    return request<User>('/auth/me')
  },

  // ---- Projects ----
  listProjects(): Promise<Project[]> {
    return request<Project[]>('/projects')
  },

  getProject(id: number | string): Promise<Project> {
    return request<Project>(`/projects/${id}`)
  },

  createProject(body: {
    name: string
    description?: string
    repositoryUrl?: string
  }): Promise<Project> {
    return request<Project>('/projects', { method: 'POST', body })
  },

  updateProject(
    id: number | string,
    body: Partial<Pick<Project, 'name' | 'description' | 'repositoryUrl'>>,
  ): Promise<Project> {
    return request<Project>(`/projects/${id}`, { method: 'PATCH', body })
  },

  deleteProject(id: number | string): Promise<{ message: string; project: Project }> {
    return request<{ message: string; project: Project }>(`/projects/${id}`, {
      method: 'DELETE',
    })
  },

  // ---- Deployments ----
  listDeployments(projectId: number | string): Promise<Deployment[]> {
    return request<Deployment[]>(`/projects/${projectId}/deployments`)
  },

  getDeployment(
    projectId: number | string,
    deploymentId: number | string,
  ): Promise<Deployment> {
    return request<Deployment>(`/projects/${projectId}/deployments/${deploymentId}`)
  },

  createDeployment(
    projectId: number | string,
    body: { branch: string; commitHash: string },
  ): Promise<Deployment> {
    return request<Deployment>(`/projects/${projectId}/deployments`, {
      method: 'POST',
      body,
    })
  },

  getDeploymentLogs(
    projectId: number | string,
    deploymentId: number | string,
  ): Promise<DeploymentLog[]> {
    return request<DeploymentLog[]>(
      `/projects/${projectId}/deployments/${deploymentId}/logs`,
    )
  },

  retryDeployment(
    projectId: number | string,
    deploymentId: number | string,
  ): Promise<Deployment> {
    return request<Deployment>(
      `/projects/${projectId}/deployments/${deploymentId}/retry`,
      { method: 'POST' },
    )
  },

  rollbackDeployment(
    projectId: number | string,
    deploymentId: number | string,
  ): Promise<Deployment> {
    return request<Deployment>(
      `/projects/${projectId}/deployments/${deploymentId}/rollback`,
      { method: 'POST' },
    )
  },
}
