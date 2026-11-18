'use client'

import { useState } from 'react'
import { KeyRound, RefreshCw, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useStore } from '@/lib/lexigrid/store'
import { DataTable, type Column } from '../data-table'

type DemoUser = { name: string; email: string; role: 'Analista' | 'Administrador'; active: boolean }

const INITIAL_USERS: DemoUser[] = [
  { name: 'Laura Mejía', email: 'laura.mejia@lexigrid.edu.co', role: 'Analista', active: true },
  { name: 'Camilo Ortiz', email: 'camilo.ortiz@lexigrid.edu.co', role: 'Analista', active: true },
  { name: 'Paola Restrepo', email: 'paola.restrepo@lexigrid.edu.co', role: 'Administrador', active: true },
]

export function AdminView() {
  const store = useStore()
  const [users, setUsers] = useState(INITIAL_USERS)
  const [environment, setEnvironment] = useState('Pruebas')
  const [retention, setRetention] = useState('10')
  const [testing, setTesting] = useState(false)

  const testConnection = async () => {
    setTesting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setTesting(false)
    if (store.state.integration.online) toast.success(`Conexión exitosa en ambiente ${environment}`)
    else toast.error(store.state.integration.error ?? 'La conexión no está disponible')
  }

  const columns: Column<DemoUser>[] = [
    { id: 'name', header: 'Usuario', cell: (u) => <div><p className="font-semibold">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div> },
    { id: 'role', header: 'Rol', cell: (u) => u.role },
    { id: 'active', header: 'Estado', cell: (u) => <span className={u.active ? 'text-success' : 'text-muted-foreground'}>{u.active ? 'Activo' : 'Inactivo'}</span> },
    { id: 'actions', header: 'Acciones', cell: (u) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => toast.info(`Contraseña restablecida de demostración para ${u.name}`)}><KeyRound />Clave</Button>
        <Button size="sm" variant="ghost" onClick={() => setUsers((rows) => rows.map((row) => row.email === u.email ? { ...row, active: !row.active } : row))}>{u.active ? 'Inhabilitar' : 'Activar'}</Button>
      </div>
    ) },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users />Usuarios</CardTitle><CardDescription>{users.filter((u) => u.active).length} cuentas activas</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck />CRM</CardTitle><CardDescription>{store.state.integration.online ? 'Conectado' : 'Con error'}</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><RefreshCw />Retención</CardTitle><CardDescription>{retention} días después del envío</CardDescription></CardHeader></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios y roles</CardTitle>
          <CardDescription>Acceso exclusivo a analistas y administradores de la plataforma web.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable label="Usuarios" rows={users} columns={columns} rowKey={(u) => u.email} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Conexión con el CRM</CardTitle><CardDescription>Configuración de demostración; no almacena credenciales reales.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <label className="text-sm font-medium">Organización</label>
            <Input defaultValue="LexiGrid Colombia" />
            <label className="text-sm font-medium">Ambiente</label>
            <Select value={environment} onValueChange={(value) => value && setEnvironment(value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pruebas">Pruebas</SelectItem>
                <SelectItem value="Producción">Producción</SelectItem>
              </SelectContent>
            </Select>
            <label className="flex items-center justify-between rounded-lg border p-3 text-sm">Conexión habilitada<Switch checked={store.state.integration.online} onCheckedChange={(online) => store.setIntegration({ online, error: online ? null : 'Conexión deshabilitada por el administrador.' })} /></label>
            <Button onClick={testConnection} disabled={testing}><RefreshCw />{testing ? 'Probando...' : 'Probar conexión'}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Parámetros y mapeo</CardTitle><CardDescription>Mapa base de campos y retención de imágenes.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Alert>
              <UserPlus />
              <AlertTitle>Mapeo activo de demostración</AlertTitle>
              <AlertDescription>Nombre, documento, celulares, correo, acudiente, grado, calendario, carreras, evento, colegio, ciudad y prioridad.</AlertDescription>
            </Alert>
            <label className="text-sm font-medium">Retención de imágenes (días)</label>
            <Input type="number" min="1" max="365" value={retention} onChange={(e) => setRetention(e.target.value)} />
            <Button onClick={() => toast.success(`Configuración guardada: ${retention} días`)}>Guardar parámetros</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
