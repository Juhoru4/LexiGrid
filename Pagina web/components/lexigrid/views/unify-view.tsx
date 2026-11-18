'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Merge, Spline } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { norm } from '@/lib/lexigrid/format'
import { useStore } from '@/lib/lexigrid/store'
import { cn } from '@/lib/utils'
import { EmptyState } from '../empty-state'

type Kind = 'school' | 'journey' | 'city'
const KINDS: { id: Kind; label: string }[] = [
  { id: 'school', label: 'Colegios' },
  { id: 'journey', label: 'Jornadas' },
  { id: 'city', label: 'Ciudades' },
]

const keyOf = (s: string) => norm(s).replace(/^(col\.?|colegio)\s+/, '').replace(/^santiago de /, '').replace(/\s+/g, ' ')

export function UnifyView() {
  const store = useStore()
  const [kind, setKind] = useState<Kind>('school')
  const [picked, setPicked] = useState<Record<string, string>>({})

  const groups = useMemo(() => {
    const map = new Map<string, Map<string, number>>()
    store.state.records.forEach((r) => {
      const raw = r[kind]
      const k = keyOf(raw)
      const variants = map.get(k) ?? new Map<string, number>()
      variants.set(raw, (variants.get(raw) ?? 0) + 1)
      map.set(k, variants)
    })
    return [...map.entries()].filter(([, v]) => v.size > 1).map(([k, v]) => ({ key: k, variants: [...v.entries()].sort((a, b) => b[1] - a[1]) }))
  }, [store.state.records, kind])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tipo de nombre">
        {KINDS.map((k) => (
          <Button key={k.id} role="tab" aria-selected={kind === k.id} variant={kind === k.id ? 'default' : 'outline'} size="sm" onClick={() => setKind(k.id)}>{k.label}</Button>
        ))}
      </div>
      {groups.length === 0 ? (
        <Card><EmptyState icon={Spline} title="No hay nombres para unificar" description="Aquí aparecerán variantes del mismo nombre escritas de forma distinta." /></Card>
      ) : (
        groups.map((g) => {
          const final = picked[`${kind}:${g.key}`] ?? g.variants[0][0]
          return (
            <Card key={g.key}>
              <CardHeader>
                <CardTitle>{g.variants.length} variantes del mismo nombre</CardTitle>
                <CardDescription>Elige el nombre definitivo. Los registros ya enviados no se modifican.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Nombre definitivo">
                  {g.variants.map(([v, n]) => (
                    <button key={v} type="button" role="radio" aria-checked={final === v} onClick={() => setPicked((p) => ({ ...p, [`${kind}:${g.key}`]: v }))} className={cn('rounded-lg border px-3 py-2 text-left text-sm', final === v ? 'border-brand bg-brand-soft' : 'bg-card hover:bg-muted')}>
                      <span className="font-semibold">&quot;{v.trim()}&quot;</span>
                      <span className="block text-xs text-muted-foreground">{n} registro(s)</span>
                    </button>
                  ))}
                </div>
                <Button className="w-fit" onClick={() => { store.unify(kind, g.variants.map(([v]) => v), final); toast.success(`Unificado como "${final.trim()}"`) }}>
                  <Merge data-icon="inline-start" />Unificar como &quot;{final.trim()}&quot;
                </Button>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
