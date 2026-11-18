Historias de usuario - prototipo web

## Leyenda

- ✅ Cumplido en el prototipo
- 🟡 Parcial
- 🔴 No cumplido

Después de cada criterio parcial o no cumplido se indica `->` y la razón.

## Resumen


| Estado                 | Cantidad aproximada |
| ---------------------- | ------------------: |
| Cumplidas totalmente   |                   6 |
| Cumplidas parcialmente |                  26 |
| No cumplidas           |                   4 |

El resumen cubre las 36 historias web aplicables numeradas de la HU 12 a la HU 47, incluyendo las marcadas Won’t.

## Épica #3 - OCR

### HU 12 - Identificación de campos

- ✅ Los campos personales, de contacto, académicos y de autorización se muestran asociados a etiquetas.
- ✅ Nombre, documento, celulares, correo y acudiente tienen datos de demostración.
- 🟡 Se identifican opciones múltiples y marcas. -> Es datos simulados; no existe OCR ni procesamiento real.
- 🟡 Cada campo aparece con estado después del procesamiento. -> No hay carga de imagen ni motor OCR.

**Estado: parcialmente cumplida.**

### HU 13 - Campos con incertidumbre

- ✅ Los campos dudosos usan estado `Por revisar` y se resaltan visualmente.
- ✅ Existe estado individual por campo.
- ✅ El registro queda `Por revisar` si tiene al menos un campo dudoso.
- ✅ Se puede continuar revisando los demás campos.
- 🟡 La certeza no es configurable y se representa con valores 100 o inferiores. -> No existe modelo OCR real ni umbral computado.
- 🔴 Los campos correctamente vacíos se generan manualmente. -> No existe flujo OCR que detecte blancos.

**Estado: parcialmente cumplida.**

### HU 14 - Validación de formato

- ✅ Documento, celulares y correo tienen validadores.
- ✅ Los formatos inválidos conservan el valor y muestran un motivo.
- ✅ No permite confirmar un celular, correo o documento inválido.
- ✅ Un celular repetido se conserva una sola vez.
- 🟡 Los datos válidos se usan para contacto y prioridad. -> Parte de la prioridad sí usa validación; no hay servicio externo.

**Estado: cumplida parcialmente.**

### HU 15 - Retención de imágenes

- 🟡 Existe disponibilidad de imagen por estado de duda. -> La imagen es de demostración y no está cifrada ni almacenada en servidor.
- 🟡 La interfaz indica imágenes eliminadas por retención. -> No hay purga automática ni servicio de archivos.
- 🟡 Se muestra una retención configurable en administración. -> Es una configuración local visual, no persistida ni aplicada.
- 🔴 Las eliminaciones no se registran con datos del identificador. -> El historial no tiene acción completa de purga y el almacenamiento no existe.

**Estado: cumplida parcialmente.**

## Épica #4 - Revisión

### HU 16 - Comparación visual

- ✅ Vista dividida con foto y datos extraídos.
- ✅ Permite confirmar o sobrescribir valores.
- ✅ Confirmar/corregir cambia el estado a `Revisado manualmente`.
- ✅ El registro pasa a `Revisado` al resolver pendientes.
- ✅ Confirmaciones y correcciones quedan en el historial.
- ✅ Los enviados quedan de solo lectura.
- 🟡 La imagen original está disponible mientras hay dudas. -> Usa una imagen de prototipo compartida, no un archivo por registro.

**Estado: cumplida parcialmente.**

### HU 17 - Ediciones simultáneas

- 🟡 Los registros muestran un bloqueador por analista cuando están abiertos. -> El bloqueo existe en estado local y no hay tiempo de inactividad configurable compartido entre usuarios.
- 🔴 No existe un servidor que rechace guardados obsoletos. -> Puede haber escrituras concurrentes en sesiones o navegadores distintos.
- 🔴 No existe carga móvil que deba mantenerse operativa. -> La app móvil fue excluida del alcance.

**Estado: cumplida parcialmente.**

### HU 18 - Pendientes y filtro

- ✅ Muestra cuántos campos pendientes tiene cada registro.
- ✅ Filtra por estado de revisión.
- ✅ Permite combinar evento, colegio y ciudad.
- 🔴 No mantiene el filtro por perfil de capturador. -> Se retiró el filtro móvil de embajadores.

**Estado: cumplida parcialmente.**

### HU 19 - Comentarios internos

- ✅ Permite agregar notas desde el detalle.
- ✅ Cada nota incluye usuario y fecha.
- ✅ Las notas aparecen entre analistas y administradores.
- ✅ Las notas no se incluyen en el envío simulado.
- 🔴 No existe una restricción backend. -> Un usuario con acceso no autorizado podría modificar almacenamiento local.

**Estado: cumplida parcialmente.**

### HU 20 - Imagen desde el detalle

- ✅ Abre la vista de comparación desde el registro.
- 🟡 Indica que no existe imagen para registros ciertos o eliminados. -> Depende de datos simulados y no de retención real.
- 🟡 Reutiliza la misma vista de comparación. -> La imagen no pertenece a cada formulario.

**Estado: cumplida parcialmente.**

## Épica #5 - Organización

### HU 21 - Detección de duplicados

- ✅ Detecta coincidencia por documento o correo.
- ✅ Excluye celular como criterio.
- ✅ Compara solo campos resueltos.
- ✅ Marca como nuevo el registro más reciente.
- ✅ Agrupa casos conectados.
- ✅ Tiene apartado exclusivo web.
- ✅ Participan registros enviados.
- 🟡 Se registra la detección y resolución en historial. -> Solo la resolución queda detallada; la detección inicial no genera una entrada separada.
- 🔴 No consulta el CRM. -> Sí cumple el criterio por ausencia de integración real.

**Estado: cumplida parcialmente.**

### HU 22 - Resolver duplicados

- ✅ Tiene apartado `Duplicados`.
- ✅ Muestra coincidencia y campos diferentes.
- ✅ Permite conservar anterior, nuevo o campo por campo.
- ✅ Sugiere el registro reciente.
- ✅ Aplica un único registro y manda descartados a la Papelera.
- ✅ Los enviados pasan a pendiente de actualización.
- ✅ Registra la decisión.

**Estado: cumplida totalmente.**

### HU 23 - Clasificación incontactable

- ✅ Mueve a Papelera los registros sin canal.
- ✅ Conserva registros con al menos un canal.
- ✅ Espera a que se resuelvan campos pendientes.
- ✅ Reevalúa al cambiar contacto.
- ✅ Guarda motivo y fecha.
- ✅ Excluye registros de la fila.
- ✅ Registra el movimiento automático.

**Estado: cumplida totalmente.**

### HU 24 - Papelera

- ✅ Guarda duplicados e incontactables.
- ✅ Muestra motivo, fecha y días restantes.
- ✅ Permite restaurar individualmente.
- ✅ Aplica reglas básicas al restaurar.
- ✅ Guarda restauración en historial.
- ✅ Excluye la Papelera de la fila.
- 🔴 No purga de forma automática persistente a los 30 días. -> La aplicación no ejecuta una tarea de servidor.

**Estado: cumplida parcialmente.**

### HU 25 - Filtrar y restaurar en lote

- 🟡 Permite seleccionar varios registros y restaurarlos. -> Sí funciona.
- 🔴 No existen filtros específicos por motivo y colegio en la Papelera. -> Solo se muestra el listado completo.

**Estado: cumplida parcialmente.**

### HU 26 - Recuperación automática

- ✅ Reevalúa al corregir contactos.
- ✅ Permite editar desde el detalle de la Papelera.
- ✅ Recupera incontactables con canal válido.
- ✅ Asigna estado de revisión.
- ✅ Permite editar el plazo sin reiniciar.
- ✅ No recupera duplicados automáticamente.
- ✅ Envía cambios de enviados a pendiente de actualización.
- 🟡 Registra recuperación automática. -> Solo registra el movimiento general de restauración.
- 🔴 No impide recuperación pasada la purga real. -> No existe purga persistente.

**Estado: cumplida parcialmente.**

### HU 27 - Priorización

- ✅ Calcula prioridad Alta, Media y Baja.
- ✅ Detecta pendiente de prioridad.
- ✅ Recalcula al cambiar datos.
- ✅ Ordena por prioridad, diligenciamiento y captura.
- ✅ Excluye incontactables.
- 🟡 Envía prioridad al lote CRM. -> El lote simulado usa el campo en memoria, no mapeo CRM real.

**Estado: cumplida parcialmente.**

### HU 28 - Archivo de enviados

- ✅ Los enviados se mantienen separados.
- ✅ No participan en conteos de trabajo.
- ✅ Tiene sección `Enviados`.
- ✅ Permite consultar filtros generales.
- ✅ Participan en detección de duplicados.
- ✅ Son de solo lectura.
- ✅ Conservan estado, fecha e identificador simulado.

**Estado: cumplida totalmente.**

## Épica #6 - Eventos y CRM

### HU 29 - Filtros

- ✅ Filtra por evento, colegio y ciudad.
- ✅ Permite combinar filtros.
- ✅ Busca texto parcial con normalización básica.
- ✅ Mantiene filtros al navegar.
- ✅ Permite limpiar filtros.
- ✅ Muestra el total de filas.

**Estado: cumplida totalmente.**

### HU 30 - Resumen por evento y colegio

- 🔴 No existe tabla agrupada de avance. -> El resumen general solo usa tarjetas.
- 🔴 No muestra estado de envío agrupado. -> No hay vista de tabla por evento/colegio.
- 🔴 No permite ordenar por pendientes ni aplicar filtros al seleccionar. -> No existe esta vista.

**Estado: no cumplida.**

### HU 31 - Unificar nombres

- ✅ Sugiere variantes similares.
- ✅ Permite elegir valor final.
- ✅ Actualiza registros no enviados.
- ✅ Deja registro de la unificación.
- ✅ Respeta registros enviados.

**Estado: cumplida totalmente.**

### HU 32 - Configuración CRM

- 🟡 Permite configurar organización y ambiente en una vista de demostración.
- ✅ Tiene acción `Probar conexión`.
- 🟡 Muestra estado y permite reintento. -> No guarda credenciales reales ni fecha persistente.
- 🔴 Las credenciales no se almacenan cifradas. -> No se aceptan credenciales reales.
- 🔴 Toda modificación no queda registrada. -> Falta auditoría específica de configuración.

**Estado: cumplida parcialmente.**

### HU 33 - Mapeo CRM

- 🟡 Expone el conjunto base de campos. -> Es informativo en administración.
- 🔴 No permite editar el mapeo campo por campo. -> No hay persistencia ni equivalencias configurables.
- 🔴 No valida campos disponibles en un CRM real. -> La integración es simulada.
- ✅ Las notas e imágenes no forman parte del envío de demostración.

**Estado: cumplida parcialmente.**

### HU 34 - Preparar lote

- 🟡 Permite seleccionar registros listos desde una lista.
- ✅ Excluye pendientes, duplicados, papelera y sin consentimiento.
- ✅ Muestra listos y bloqueados.
- ✅ El envío es manual.
- ✅ Excluye enviados.
- 🟡 No genera archivo. -> Sí cumple por diseño.
- 🔴 No permite seleccionar varios eventos como lote único. -> No existe preparación por evento/colegio.

**Estado: cumplida parcialmente.**

### HU 35 - Advertencia de pendientes

- 🟡 Señala registros bloqueados antes del envío.
- 🔴 No ofrece acceso directo a pendientes por combinación. -> Sí permite navegar al envío, pero no con la combinación aplicada.
- 🔴 No recalcula al volver ni confirma explícitamente envíos con pendientes. -> Los pendientes se excluyen automáticamente.
- 🟡 Los pendientes quedan fuera y quedan disponibles. -> Sí.

**Estado: cumplida parcialmente.**

### HU 36 - Envío CRM

- 🟡 Simula envío directo por registros individuales.
- 🔴 Los datos no viajan cifrados hacia un CRM real. -> Es procesamiento local.
- ✅ Evita pendientes y duplicados.
- ✅ Envía registros con validación individual.
- ✅ Los exitosos quedan enviados y no se seleccionan de nuevo.
- ✅ Muestra enviados y errores.
- ✅ Los duplicados no se consultan contra CRM.
- ✅ Registra el lote en historial.

**Estado: cumplida parcialmente.**

### HU 37 - Estado de envío

- ✅ Cada registro muestra estado.
- ✅ Enviados muestran fecha e ID.
- ✅ Errores muestran el motivo.
- ✅ Permite filtro por estado, evento y colegio.
- ✅ El estado es independiente de la revisión.

**Estado: cumplida totalmente.**

### HU 38 - Reintento

- ✅ Permite reintentar errores individualmente o por selección.
- ✅ Evita reenviar enviados.
- 🟡 Conserva datos ante caída simulada. -> Es estado local; no hay reanudación persistente en CRM.
- 🔴 No usa identificador externo real contra CRM. -> Usa un ID generado de demostración.

**Estado: cumplida parcialmente.**

### HU 39 - Actualización CRM

- ✅ Marca cambios enviados como pendiente de actualización.
- 🟡 Permite enviar registros y lote preparados. -> Envía el listado disponible, no todos los pendientes por evento.
- 🔴 No modifica un registro real en CRM. -> Solo cambia el estado local.

**Estado: cumplida parcialmente.**

### HU 40 - Alerta de integración

- ✅ Muestra alertas de desconexión y errores.
- 🟡 Permite reintentar desde la vista. -> La notificación al administrador no está separada.
- 🔴 La alerta no persiste ni se sincroniza. -> Solo permanece mientras el estado local lo mantiene.

**Estado: cumplida parcialmente.**

## Épica #7 - Administración

### HU 41 - Usuarios y roles

- 🟡 Lista usuarios, muestra estado y rol. -> Es información local de demostración.
- 🟡 Permite activar/inhabilitar, cambiar clave visual y asignar roles. -> No persiste ni usa base de usuarios.
- 🔴 No revoca sesiones ni mantiene historial asociado. -> No existe gestión real de cuentas.
- 🔴 No gestiona perfiles móviles ni operaciones externas. -> Fue excluido del alcance web.

**Estado: cumplida parcialmente.**

### HU 42 - Revocación y borrado remoto

- 🔴 No existe funcionalidad móvil ni dispositivo embajador. -> Fuera del alcance solicitado.

**Estado: no cumplida.**

### HU 43 - Métricas de digitación

- 🔴 No calcula tiempo de digitación ni reducción de errores. -> No existe medición ni línea base.

**Estado: no cumplida.**

## Épica #8 - Seguridad

### HU 44 - Inicio de sesión

- ✅ Solicita correo y contraseña.
- ✅ Requiere sesión para abrir el portal.
- ✅ Bloquea temporalmente después de tres fallos.
- 🟡 Exige complejidad en contraseñas de demostración. -> No existe un flujo de creación que valide complejidad.
- ✅ El acceso corresponde a usuarios web; no se incluye operación móvil.

**Estado: cumplida parcialmente.**

### HU 45 - Recuperación de contraseña

- 🔴 No existe solicitud desde login ni correo. -> No hay proveedor de correo ni vínculo de uso único.

**Estado: no cumplida.**

### HU 46 - Cierre automático

- 🟡 Detecta inactividad en el navegador y redirige al login. -> La sesión puede permanecer activa en el servidor hasta expirar.
- ✅ Tiene botón explícito de cerrar sesión.
- 🟡 El límite se configuró en 15 minutos. -> No es configurable desde administración.

**Estado: cumplida parcialmente.**

## Épica #9 - Auditoría

### HU 47 - Historial por usuario

- ✅ Registra usuario, fecha, acción y registro afectado en la mayoría de movimientos.
- 🟡 Registra correcciones, confirmaciones, duplicados, restauraciones, envíos y unificaciones. -> Faltan cargas reales, purgas completas y cambios administrativos persistentes.
- ✅ El historial se muestra de solo lectura.
- ✅ Analistas ven sus acciones y administradores pueden seleccionar todos los usuarios.
- 🔴 No permite filtro por rango de fechas. -> Solo filtra por usuario y tipo.

**Estado: cumplida parcialmente.**Historias de usuario - prototipo web

## Leyenda

- ✅ Cumplido en el prototipo
- 🟡 Parcial
- 🔴 No cumplido

Después de cada criterio parcial o no cumplido se indica `->` y la razón.

## Resumen


| Estado                 | Cantidad aproximada |
| ---------------------- | ------------------: |
| Cumplidas totalmente   |                   6 |
| Cumplidas parcialmente |                  26 |
| No cumplidas           |                   4 |

El resumen cubre las 36 historias web aplicables numeradas de la HU 12 a la HU 47, incluyendo las marcadas Won’t.

## Épica #3 - OCR

### HU 12 - Identificación de campos

- ✅ Los campos personales, de contacto, académicos y de autorización se muestran asociados a etiquetas.
- ✅ Nombre, documento, celulares, correo y acudiente tienen datos de demostración.
- 🟡 Se identifican opciones múltiples y marcas. -> Es datos simulados; no existe OCR ni procesamiento real.
- 🟡 Cada campo aparece con estado después del procesamiento. -> No hay carga de imagen ni motor OCR.

**Estado: parcialmente cumplida.**

### HU 13 - Campos con incertidumbre

- ✅ Los campos dudosos usan estado `Por revisar` y se resaltan visualmente.
- ✅ Existe estado individual por campo.
- ✅ El registro queda `Por revisar` si tiene al menos un campo dudoso.
- ✅ Se puede continuar revisando los demás campos.
- 🟡 La certeza no es configurable y se representa con valores 100 o inferiores. -> No existe modelo OCR real ni umbral computado.
- 🔴 Los campos correctamente vacíos se generan manualmente. -> No existe flujo OCR que detecte blancos.

**Estado: parcialmente cumplida.**

### HU 14 - Validación de formato

- ✅ Documento, celulares y correo tienen validadores.
- ✅ Los formatos inválidos conservan el valor y muestran un motivo.
- ✅ No permite confirmar un celular, correo o documento inválido.
- ✅ Un celular repetido se conserva una sola vez.
- 🟡 Los datos válidos se usan para contacto y prioridad. -> Parte de la prioridad sí usa validación; no hay servicio externo.

**Estado: cumplida parcialmente.**

### HU 15 - Retención de imágenes

- 🟡 Existe disponibilidad de imagen por estado de duda. -> La imagen es de demostración y no está cifrada ni almacenada en servidor.
- 🟡 La interfaz indica imágenes eliminadas por retención. -> No hay purga automática ni servicio de archivos.
- 🟡 Se muestra una retención configurable en administración. -> Es una configuración local visual, no persistida ni aplicada.
- 🔴 Las eliminaciones no se registran con datos del identificador. -> El historial no tiene acción completa de purga y el almacenamiento no existe.

**Estado: cumplida parcialmente.**

## Épica #4 - Revisión

### HU 16 - Comparación visual

- ✅ Vista dividida con foto y datos extraídos.
- ✅ Permite confirmar o sobrescribir valores.
- ✅ Confirmar/corregir cambia el estado a `Revisado manualmente`.
- ✅ El registro pasa a `Revisado` al resolver pendientes.
- ✅ Confirmaciones y correcciones quedan en el historial.
- ✅ Los enviados quedan de solo lectura.
- 🟡 La imagen original está disponible mientras hay dudas. -> Usa una imagen de prototipo compartida, no un archivo por registro.

**Estado: cumplida parcialmente.**

### HU 17 - Ediciones simultáneas

- 🟡 Los registros muestran un bloqueador por analista cuando están abiertos. -> El bloqueo existe en estado local y no hay tiempo de inactividad configurable compartido entre usuarios.
- 🔴 No existe un servidor que rechace guardados obsoletos. -> Puede haber escrituras concurrentes en sesiones o navegadores distintos.
- 🔴 No existe carga móvil que deba mantenerse operativa. -> La app móvil fue excluida del alcance.

**Estado: cumplida parcialmente.**

### HU 18 - Pendientes y filtro

- ✅ Muestra cuántos campos pendientes tiene cada registro.
- ✅ Filtra por estado de revisión.
- ✅ Permite combinar evento, colegio y ciudad.
- 🔴 No mantiene el filtro por perfil de capturador. -> Se retiró el filtro móvil de embajadores.

**Estado: cumplida parcialmente.**

### HU 19 - Comentarios internos

- ✅ Permite agregar notas desde el detalle.
- ✅ Cada nota incluye usuario y fecha.
- ✅ Las notas aparecen entre analistas y administradores.
- ✅ Las notas no se incluyen en el envío simulado.
- 🔴 No existe una restricción backend. -> Un usuario con acceso no autorizado podría modificar almacenamiento local.

**Estado: cumplida parcialmente.**

### HU 20 - Imagen desde el detalle

- ✅ Abre la vista de comparación desde el registro.
- 🟡 Indica que no existe imagen para registros ciertos o eliminados. -> Depende de datos simulados y no de retención real.
- 🟡 Reutiliza la misma vista de comparación. -> La imagen no pertenece a cada formulario.

**Estado: cumplida parcialmente.**

## Épica #5 - Organización

### HU 21 - Detección de duplicados

- ✅ Detecta coincidencia por documento o correo.
- ✅ Excluye celular como criterio.
- ✅ Compara solo campos resueltos.
- ✅ Marca como nuevo el registro más reciente.
- ✅ Agrupa casos conectados.
- ✅ Tiene apartado exclusivo web.
- ✅ Participan registros enviados.
- 🟡 Se registra la detección y resolución en historial. -> Solo la resolución queda detallada; la detección inicial no genera una entrada separada.
- 🔴 No consulta el CRM. -> Sí cumple el criterio por ausencia de integración real.

**Estado: cumplida parcialmente.**

### HU 22 - Resolver duplicados

- ✅ Tiene apartado `Duplicados`.
- ✅ Muestra coincidencia y campos diferentes.
- ✅ Permite conservar anterior, nuevo o campo por campo.
- ✅ Sugiere el registro reciente.
- ✅ Aplica un único registro y manda descartados a la Papelera.
- ✅ Los enviados pasan a pendiente de actualización.
- ✅ Registra la decisión.

**Estado: cumplida totalmente.**

### HU 23 - Clasificación incontactable

- ✅ Mueve a Papelera los registros sin canal.
- ✅ Conserva registros con al menos un canal.
- ✅ Espera a que se resuelvan campos pendientes.
- ✅ Reevalúa al cambiar contacto.
- ✅ Guarda motivo y fecha.
- ✅ Excluye registros de la fila.
- ✅ Registra el movimiento automático.

**Estado: cumplida totalmente.**

### HU 24 - Papelera

- ✅ Guarda duplicados e incontactables.
- ✅ Muestra motivo, fecha y días restantes.
- ✅ Permite restaurar individualmente.
- ✅ Aplica reglas básicas al restaurar.
- ✅ Guarda restauración en historial.
- ✅ Excluye la Papelera de la fila.
- 🔴 No purga de forma automática persistente a los 30 días. -> La aplicación no ejecuta una tarea de servidor.

**Estado: cumplida parcialmente.**

### HU 25 - Filtrar y restaurar en lote

- 🟡 Permite seleccionar varios registros y restaurarlos. -> Sí funciona.
- 🔴 No existen filtros específicos por motivo y colegio en la Papelera. -> Solo se muestra el listado completo.

**Estado: cumplida parcialmente.**

### HU 26 - Recuperación automática

- ✅ Reevalúa al corregir contactos.
- ✅ Permite editar desde el detalle de la Papelera.
- ✅ Recupera incontactables con canal válido.
- ✅ Asigna estado de revisión.
- ✅ Permite editar el plazo sin reiniciar.
- ✅ No recupera duplicados automáticamente.
- ✅ Envía cambios de enviados a pendiente de actualización.
- 🟡 Registra recuperación automática. -> Solo registra el movimiento general de restauración.
- 🔴 No impide recuperación pasada la purga real. -> No existe purga persistente.

**Estado: cumplida parcialmente.**

### HU 27 - Priorización

- ✅ Calcula prioridad Alta, Media y Baja.
- ✅ Detecta pendiente de prioridad.
- ✅ Recalcula al cambiar datos.
- ✅ Ordena por prioridad, diligenciamiento y captura.
- ✅ Excluye incontactables.
- 🟡 Envía prioridad al lote CRM. -> El lote simulado usa el campo en memoria, no mapeo CRM real.

**Estado: cumplida parcialmente.**

### HU 28 - Archivo de enviados

- ✅ Los enviados se mantienen separados.
- ✅ No participan en conteos de trabajo.
- ✅ Tiene sección `Enviados`.
- ✅ Permite consultar filtros generales.
- ✅ Participan en detección de duplicados.
- ✅ Son de solo lectura.
- ✅ Conservan estado, fecha e identificador simulado.

**Estado: cumplida totalmente.**

## Épica #6 - Eventos y CRM

### HU 29 - Filtros

- ✅ Filtra por evento, colegio y ciudad.
- ✅ Permite combinar filtros.
- ✅ Busca texto parcial con normalización básica.
- ✅ Mantiene filtros al navegar.
- ✅ Permite limpiar filtros.
- ✅ Muestra el total de filas.

**Estado: cumplida totalmente.**

### HU 30 - Resumen por evento y colegio

- 🔴 No existe tabla agrupada de avance. -> El resumen general solo usa tarjetas.
- 🔴 No muestra estado de envío agrupado. -> No hay vista de tabla por evento/colegio.
- 🔴 No permite ordenar por pendientes ni aplicar filtros al seleccionar. -> No existe esta vista.

**Estado: no cumplida.**

### HU 31 - Unificar nombres

- ✅ Sugiere variantes similares.
- ✅ Permite elegir valor final.
- ✅ Actualiza registros no enviados.
- ✅ Deja registro de la unificación.
- ✅ Respeta registros enviados.

**Estado: cumplida totalmente.**

### HU 32 - Configuración CRM

- 🟡 Permite configurar organización y ambiente en una vista de demostración.
- ✅ Tiene acción `Probar conexión`.
- 🟡 Muestra estado y permite reintento. -> No guarda credenciales reales ni fecha persistente.
- 🔴 Las credenciales no se almacenan cifradas. -> No se aceptan credenciales reales.
- 🔴 Toda modificación no queda registrada. -> Falta auditoría específica de configuración.

**Estado: cumplida parcialmente.**

### HU 33 - Mapeo CRM

- 🟡 Expone el conjunto base de campos. -> Es informativo en administración.
- 🔴 No permite editar el mapeo campo por campo. -> No hay persistencia ni equivalencias configurables.
- 🔴 No valida campos disponibles en un CRM real. -> La integración es simulada.
- ✅ Las notas e imágenes no forman parte del envío de demostración.

**Estado: cumplida parcialmente.**

### HU 34 - Preparar lote

- 🟡 Permite seleccionar registros listos desde una lista.
- ✅ Excluye pendientes, duplicados, papelera y sin consentimiento.
- ✅ Muestra listos y bloqueados.
- ✅ El envío es manual.
- ✅ Excluye enviados.
- 🟡 No genera archivo. -> Sí cumple por diseño.
- 🔴 No permite seleccionar varios eventos como lote único. -> No existe preparación por evento/colegio.

**Estado: cumplida parcialmente.**

### HU 35 - Advertencia de pendientes

- 🟡 Señala registros bloqueados antes del envío.
- 🔴 No ofrece acceso directo a pendientes por combinación. -> Sí permite navegar al envío, pero no con la combinación aplicada.
- 🔴 No recalcula al volver ni confirma explícitamente envíos con pendientes. -> Los pendientes se excluyen automáticamente.
- 🟡 Los pendientes quedan fuera y quedan disponibles. -> Sí.

**Estado: cumplida parcialmente.**

### HU 36 - Envío CRM

- 🟡 Simula envío directo por registros individuales.
- 🔴 Los datos no viajan cifrados hacia un CRM real. -> Es procesamiento local.
- ✅ Evita pendientes y duplicados.
- ✅ Envía registros con validación individual.
- ✅ Los exitosos quedan enviados y no se seleccionan de nuevo.
- ✅ Muestra enviados y errores.
- ✅ Los duplicados no se consultan contra CRM.
- ✅ Registra el lote en historial.

**Estado: cumplida parcialmente.**

### HU 37 - Estado de envío

- ✅ Cada registro muestra estado.
- ✅ Enviados muestran fecha e ID.
- ✅ Errores muestran el motivo.
- ✅ Permite filtro por estado, evento y colegio.
- ✅ El estado es independiente de la revisión.

**Estado: cumplida totalmente.**

### HU 38 - Reintento

- ✅ Permite reintentar errores individualmente o por selección.
- ✅ Evita reenviar enviados.
- 🟡 Conserva datos ante caída simulada. -> Es estado local; no hay reanudación persistente en CRM.
- 🔴 No usa identificador externo real contra CRM. -> Usa un ID generado de demostración.

**Estado: cumplida parcialmente.**

### HU 39 - Actualización CRM

- ✅ Marca cambios enviados como pendiente de actualización.
- 🟡 Permite enviar registros y lote preparados. -> Envía el listado disponible, no todos los pendientes por evento.
- 🔴 No modifica un registro real en CRM. -> Solo cambia el estado local.

**Estado: cumplida parcialmente.**

### HU 40 - Alerta de integración

- ✅ Muestra alertas de desconexión y errores.
- 🟡 Permite reintentar desde la vista. -> La notificación al administrador no está separada.
- 🔴 La alerta no persiste ni se sincroniza. -> Solo permanece mientras el estado local lo mantiene.

**Estado: cumplida parcialmente.**

## Épica #7 - Administración

### HU 41 - Usuarios y roles

- 🟡 Lista usuarios, muestra estado y rol. -> Es información local de demostración.
- 🟡 Permite activar/inhabilitar, cambiar clave visual y asignar roles. -> No persiste ni usa base de usuarios.
- 🔴 No revoca sesiones ni mantiene historial asociado. -> No existe gestión real de cuentas.
- 🔴 No gestiona perfiles móviles ni operaciones externas. -> Fue excluido del alcance web.

**Estado: cumplida parcialmente.**

### HU 42 - Revocación y borrado remoto

- 🔴 No existe funcionalidad móvil ni dispositivo embajador. -> Fuera del alcance solicitado.

**Estado: no cumplida.**

### HU 43 - Métricas de digitación

- 🔴 No calcula tiempo de digitación ni reducción de errores. -> No existe medición ni línea base.

**Estado: no cumplida.**

## Épica #8 - Seguridad

### HU 44 - Inicio de sesión

- ✅ Solicita correo y contraseña.
- ✅ Requiere sesión para abrir el portal.
- ✅ Bloquea temporalmente después de tres fallos.
- 🟡 Exige complejidad en contraseñas de demostración. -> No existe un flujo de creación que valide complejidad.
- ✅ El acceso corresponde a usuarios web; no se incluye operación móvil.

**Estado: cumplida parcialmente.**

### HU 45 - Recuperación de contraseña

- 🔴 No existe solicitud desde login ni correo. -> No hay proveedor de correo ni vínculo de uso único.

**Estado: no cumplida.**

### HU 46 - Cierre automático

- 🟡 Detecta inactividad en el navegador y redirige al login. -> La sesión puede permanecer activa en el servidor hasta expirar.
- ✅ Tiene botón explícito de cerrar sesión.
- 🟡 El límite se configuró en 15 minutos. -> No es configurable desde administración.

**Estado: cumplida parcialmente.**

## Épica #9 - Auditoría

### HU 47 - Historial por usuario

- ✅ Registra usuario, fecha, acción y registro afectado en la mayoría de movimientos.
- 🟡 Registra correcciones, confirmaciones, duplicados, restauraciones, envíos y unificaciones. -> Faltan cargas reales, purgas completas y cambios administrativos persistentes.
- ✅ El historial se muestra de solo lectura.
- ✅ Analistas ven sus acciones y administradores pueden seleccionar todos los usuarios.
- 🔴 No permite filtro por rango de fechas. -> Solo filtra por usuario y tipo.

**Estado: cumplida parcialmente.**
​