export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
}

export interface AuthUser extends User {
  token: string
}

export interface Project {
  id: number
  name: string
  description?: string
  repositoryUrl?: string
  userId: number
  createdAt: string
}

export type DeploymentStatus = 'SUCCESS' | 'ERROR' | 'DEPLOYING' | 'IDLE'

export interface Deployment {
  id: number
  projectId: number
  branch: string
  commitHash: string
  status: DeploymentStatus
  startedAt: string
  finishedAt: string | null
  errorMessage: string | null
  createdAt: string
}

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR'

export interface DeploymentLog {
  id: number
  status: LogLevel
  message: string
  createdAt: string
  deploymentId: number
}
