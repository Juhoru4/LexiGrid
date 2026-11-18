import { redirect } from 'next/navigation'
import { AnalystProvider } from '@/components/lexigrid/analyst-context'
import { AppShell } from '@/components/lexigrid/app-shell'
import { UiProvider } from '@/components/lexigrid/ui-context'
import { getSession } from '@/lib/auth/session'
import { StoreProvider } from '@/lib/lexigrid/store'

export default async function Page() {
  const analyst = await getSession()
  if (!analyst) redirect('/login')

  return (
    <AnalystProvider analyst={analyst}>
      <StoreProvider me={analyst.name}>
        <UiProvider>
          <AppShell />
        </UiProvider>
      </StoreProvider>
    </AnalystProvider>
  )
}
