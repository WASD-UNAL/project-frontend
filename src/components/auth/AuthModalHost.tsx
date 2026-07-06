import { useAuthFlow } from '../../hooks/useAuthFlow'
import { AuthModal } from './AuthModal'

export function AuthModalHost() {
  const { modalOpen, mode } = useAuthFlow()
  if (!modalOpen) return null
  return <AuthModal key={mode} />
}
