import { AuthScreen } from "@/components/auth/AuthScreen"
import { EmptyProgram } from "@/components/EmptyProgram"
import { DesktopApp } from "@/components/desktop/DesktopApp"
import { MobileApp } from "@/components/mobile/MobileApp"
import { useAuth } from "@/hooks/useAuth"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { usePlan } from "@/hooks/usePlan"
import { useProgress } from "@/hooks/useProgress"
import { useTheme } from "@/hooks/useTheme"

export default function App() {
  const auth = useAuth()
  const plan = usePlan()
  const prog = useProgress(auth.user?.id ?? null)
  const { theme, toggle } = useTheme()
  const isDesktop = useMediaQuery("(min-width: 860px)")

  if (auth.status === "loading") {
    return <Centered>Connexion…</Centered>
  }
  if (auth.status === "anonymous") {
    return <AuthScreen auth={auth} theme={theme} onToggleTheme={toggle} />
  }

  if (plan.loading) {
    return <Centered>Chargement du plan…</Centered>
  }
  if (plan.error) {
    return (
      <Centered>
        <span style={{ color: "var(--rust)" }}>Impossible de charger le plan.</span>
        <br />
        <span style={{ fontSize: 13 }}>({plan.error})</span>
      </Centered>
    )
  }
  if (!plan.hasProgram) {
    return (
      <EmptyProgram
        user={auth.user}
        onLogout={auth.logout}
        theme={theme}
        onToggleTheme={toggle}
      />
    )
  }

  const shared = {
    plan,
    prog,
    theme,
    onToggleTheme: toggle,
    user: auth.user,
    onLogout: auth.logout,
  }

  return isDesktop ? <DesktopApp {...shared} /> : <MobileApp {...shared} />
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 24,
        color: "var(--muted)",
        fontSize: 16,
      }}
    >
      <div>{children}</div>
    </div>
  )
}
