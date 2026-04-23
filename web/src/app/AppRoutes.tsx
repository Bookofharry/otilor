import { Route, Routes, useNavigate } from 'react-router-dom'
import { AppProvider } from '../context'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import LandingPage from '../pages/LandingPage'
import PrivacyPage from '../pages/PrivacyPage'
import SignInPage from '../pages/SignInPage'
import SignUpPage from '../pages/SignUpPage'
import TermsPage from '../pages/TermsPage'
import { persistAuthUserProfile } from './userProfile'
import AppWorkspace from './AppWorkspace'

function AppRoutes() {
  const navigate = useNavigate()

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            onSignIn={() => navigate('/signin')}
            onStartFree={() => navigate('/signup')}
            onNavigateToPrivacy={() => navigate('/privacy')}
            onNavigateToTerms={() => navigate('/terms')}
          />
        }
      />
      <Route
        path="/signin"
        element={
          <SignInPage
            onSignIn={(email) => {
              persistAuthUserProfile({ email })
              navigate('/dashboard')
            }}
            onNavigateToSignUp={() => navigate('/signup')}
            onNavigateToForgotPassword={() => navigate('/forgot-password')}
            onNavigateToLanding={() => navigate('/')}
          />
        }
      />
      <Route
        path="/signup"
        element={
          <SignUpPage
            onSignUp={(name, email) => {
              persistAuthUserProfile({ name, email })
              navigate('/dashboard')
            }}
            onNavigateToSignIn={() => navigate('/signin')}
            onNavigateToLanding={() => navigate('/')}
            onNavigateToTerms={() => navigate('/terms')}
            onNavigateToPrivacy={() => navigate('/privacy')}
          />
        }
      />
      <Route
        path="/forgot-password"
        element={
          <ForgotPasswordPage
            onNavigateToSignIn={() => navigate('/signin')}
            onNavigateToSignUp={() => navigate('/signup')}
            onNavigateToLanding={() => navigate('/')}
          />
        }
      />
      <Route
        path="/terms"
        element={
          <TermsPage
            onNavigateToHome={() => navigate('/')}
            onNavigateToSignIn={() => navigate('/signin')}
            onNavigateToStartFree={() => navigate('/signup')}
            onNavigateToPrivacy={() => navigate('/privacy')}
          />
        }
      />
      <Route
        path="/privacy"
        element={
          <PrivacyPage
            onNavigateToHome={() => navigate('/')}
            onNavigateToSignIn={() => navigate('/signin')}
            onNavigateToStartFree={() => navigate('/signup')}
            onNavigateToTerms={() => navigate('/terms')}
          />
        }
      />
      <Route
        path="/*"
        element={
          <AppProvider>
            <AppWorkspace />
          </AppProvider>
        }
      />
    </Routes>
  )
}

export default AppRoutes
