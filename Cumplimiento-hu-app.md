# Cumplimiento de historias de usuario — LexiGrid

## Resumen

Evaluación del código disponible en **App movil lexigrid**, contrastado criterio por criterio con [historias_de_usuario_app_m_vil_embajadores.md](<C:/Users/DELL/Downloads/historias_de_usuario_app_m_vil_embajadores.md>). El proyecto es un prototipo: algunas funciones de captura, calidad, sincronización y procesamiento son simulaciones locales. Por tanto, una simulación visual no demuestra el cumplimiento de una integración real con cámara, servidor, cifrado o IA.

- ✅ **Cumplidas en el prototipo:** HU 3 y HU 5.
- 🟡 **Parcialmente cumplidas:** HU 1, HU 2, HU 4, HU 6, HU 7, HU 8, HU 9, HU 10 y HU 11.
- 🔴 **No cumplidas en su totalidad:** ninguna HU; los criterios no satisfechos se identifican individualmente abajo.

**Leyenda por criterio:** ✅ cumplido en el prototipo; 🟡 parcial; 🔴 no cumplido. Después de cada criterio parcial o no cumplido se indica `->` y la razón.

## Épica #1: Captura de datos

### HU 1: Captura de formularios — 🟡 Parcial

- 🟡 Se pueden tomar múltiples fotos de distintos formularios y cargarlas en una sola sesión de captura; cada foto corresponde a un formulario.
  -> Se pueden agregar varios elementos a la cola, pero se utiliza una imagen fija; no se capturan formularios distintos de verdad.
- 🔴 Se puede tomar la foto directamente con la cámara integrada en la aplicación, sin tener que salir de la app.
  -> El botón de captura cambia el estado de la interfaz, pero no invoca la cámara ni obtiene una foto.
- 🟡 Después de tomar la foto y superar la evaluación de calidad, el sistema muestra una vista previa antes de confirmar la carga, permitiendo repetirla si no quedó conforme.
  -> La vista previa y la opción de repetir existen, pero muestran la imagen fija del prototipo y dependen de una evaluación simulada.
- 🟡 Cada foto queda asociada al perfil general autenticado y a los datos del lote (evento, colegio y ciudad).
  -> Los datos del lote se conservan al capturar, pero el perfil se asigna al procesar la cola; si cambia la sesión antes de sincronizar, no se garantiza que corresponda al perfil que capturó la foto.
- 🔴 Las fotos viajan cifradas desde la app hacia el servidor.
  -> No hay una transferencia de fotos a un servidor ni una implementación de cifrado para esa transferencia.
- 🔴 Una vez completa la carga, las fotos no quedan almacenadas de forma visible o accesible en el dispositivo (ni en la galería).
  -> No se administra el ciclo de vida de fotos reales; los datos de la aplicación se guardan en `localStorage`, sin cifrado.
- 🟡 Solo los roles autorizados pueden visualizar las imágenes cargadas: el analista y el administrador, las de cualquier registro. El embajador no visualiza los formularios cargados; solo verifica que la carga fue exitosa mediante el estado de sincronización (HU 7) y el historial de cargas (HU 9).
  -> La app del embajador no ofrece una vista de formularios cargados, pero no se implementan ni verifican permisos para analistas y administradores.
- 🔴 La conservación y eliminación de las imágenes en el servidor se rige exclusivamente por la HU 15.
  -> No hay servidor de imágenes ni integración con la HU 15 en este prototipo móvil.

### HU 2: Evaluar la calidad de la foto — 🟡 Parcial

- 🟡 La evaluación de calidad se realiza en el dispositivo y funciona sin conexión a internet.
  -> La interfaz puede simular una evaluación local sin conexión, pero no analiza una imagen real.
- 🟡 Si la foto tiene baja calidad (borrosa, con poca luz, incompleta o con reflejos que impidan leer el texto), la app no la agrega a la cola de carga ni la envía al servidor.
  -> La simulación rechaza la captura antes de agregarla a la cola; no evalúa fotos reales ni realiza un envío real.
- 🟡 Si una foto tiene baja calidad, la app muestra una advertencia en pantalla antes de continuar.
  -> La advertencia se muestra cuando el modo de demostración simula una foto de baja calidad.
- ✅ La advertencia debe indicar claramente el motivo del rechazo.
- ✅ La app debe ofrecer la opción de repetir la foto directamente desde la advertencia, sin tener que reiniciar todo el proceso de carga.
- ✅ Si la foto tiene buena calidad, la app continúa automáticamente con la vista previa y la confirmación de la carga.
- 🔴 Superar la evaluación de calidad no garantiza que todos los campos sean legibles para la IA: los campos que el modelo no logre interpretar con certeza se marcan “Por revisar”.
  -> No hay análisis de la foto capturada por un modelo de IA; los datos de procesamiento son generados por la simulación.

### HU 3: Definir evento, colegio y ciudad del lote — ✅ Cumplida en el prototipo

- ✅ Antes de la primera captura, la app solicita evento, colegio y ciudad como campos de texto obligatorios.
- ✅ La app no permite capturar formularios mientras falte alguno de los tres datos.
- ✅ Los valores se limpian automáticamente (espacios sobrantes al inicio, al final y duplicados); no se aceptan valores vacíos ni solo espacios.
- ✅ Cada formulario queda asociado a los tres valores vigentes en el momento de la captura.
- ✅ No se exige que el evento o el colegio existan previamente en el sistema.
- ✅ Los valores permanecen guardados al cerrar la app y se reutilizan hasta que el embajador los cambie.
- ✅ Todo el flujo funciona sin conexión; los datos viajan con los formularios al sincronizar.

### HU 4: Cambiar evento, colegio o ciudad fácilmente — 🟡 Parcial

- ✅ Los datos activos se muestran siempre visibles en la pantalla de captura.
- 🟡 Se pueden editar en máximo 2 toques desde la pantalla de captura.
  -> Se abre la edición, se elige un campo y luego se guarda; completar el cambio no queda garantizado en dos toques.
- ✅ Se puede cambiar un solo dato (por ejemplo, solo el colegio) conservando los otros dos.
- ✅ El cambio aplica solo a los formularios que se capturen después; los anteriores conservan sus valores.
- ✅ Mientras un formulario no se haya sincronizado, el embajador puede corregir sus datos de lote (por ejemplo, un error de digitación).

### HU 5: Sugerencias de valores usados anteriormente — ✅ Cumplida en el prototipo

- ✅ Al escribir en cada campo, la app muestra sugerencias de valores usados previamente en ese dispositivo.
- ✅ La coincidencia ignora mayúsculas y tildes.
- ✅ El embajador puede ignorar la sugerencia y escribir un valor nuevo.
- ✅ Las sugerencias funcionan sin conexión.

### HU 6: Modo offline — 🟡 Parcial

- 🔴 La app guarda las fotos tomadas localmente (de forma cifrada e inaccesible desde la galería) mientras no haya conexión.
  -> No se guardan archivos de foto reales; la base de datos de la demo se persiste en `localStorage` sin cifrado.
- 🟡 La evaluación de calidad, el registro de los datos del lote y la vista previa funcionan sin conexión.
  -> El lote y la vista previa funcionan en el modo offline simulado, pero la evaluación no analiza fotos reales.
- 🟡 Al recuperar la conexión, la app las sube automáticamente, sin que el embajador tenga que hacer nada, siempre que exista una sesión activa; si la sesión expiró, la app solicita iniciar sesión y luego sube las fotos pendientes.
  -> La cola se procesa automáticamente cuando la demo vuelve a estar online y hay sesión, pero no hay una subida real ni una gestión completa de expiración de sesión.
- ✅ La app le informa al embajador cuántas fotos están pendientes por cargar.
- ✅ La app muestra una confirmación cuando se suben las fotos pendientes correctamente.
- 🔴 Una vez confirmada la subida de una foto, esta se elimina del dispositivo.
  -> Se elimina el elemento simulado de la cola después de un tiempo, pero no se elimina un archivo de foto real porque no se captura ni almacena uno.

### HU 7: Estado de sincronización, fallos y reintento de cada foto — 🟡 Parcial

- ✅ La app móvil muestra un indicador visual o etiqueta clara en cada foto tomada con su estado actual: Pendiente (en la cola local), Subiendo, Subida (recibida por el servidor) o Error.
- 🟡 Si la foto falla en subirse (por pérdida de conexión, tiempo de espera agotado o error del servidor), la app cambia el estado a Error, muestra una alerta en pantalla con la causa específica del fallo (ej. “Sin conexión a internet”, “Error de respuesta del servidor”) y habilita la acción explícita “Reintentar”, que es la única acción de reintento manual de la app.
  -> La interfaz cambia el estado, informa causas predefinidas y ofrece reintentar, pero los fallos no provienen de una petición real al servidor.
- 🟡 Las fotos con estado Error permanecen almacenadas localmente en la cola offline hasta que el reintento sea exitoso.
  -> Se conserva el elemento de cola simulado en `localStorage`, pero no la foto real ni una copia cifrada.
- 🟡 Al presionar “Reintentar” (desde la alerta o desde el listado), la app intenta subir únicamente las fotos con estado Error o Pendiente, sin duplicar las fotos con estado Subida; el servidor descarta cualquier reenvío de una foto ya recibida mediante su identificador único (HU 8).
  -> El prototipo reintenta elementos de la cola y evita duplicados en la base de datos local; no existe validación de reenvíos por un servidor.
- ✅ Al completarse la carga de todas las fotos asociadas a un evento y colegio, la app muestra una notificación general de éxito.
- 🟡 La app actualiza el estado en tiempo real a medida que cada imagen completa su envío al servidor.
  -> Se actualizan estados y progreso mediante temporizadores de simulación, no al completarse transferencias reales.
- 🟡 El estado “Subida” indica únicamente que la foto llegó al servidor.
  -> El prototipo marca “Subida” al completar su flujo local simulado; no confirma recepción de un servidor.

### HU 8: Carga simultánea — 🟡 Parcial

- 🟡 Varios embajadores pueden asociar sus cargas a un mismo evento y a un mismo colegio, sin que el sistema les obligue a trabajar en sesiones separadas.
  -> Los datos del lote no imponen una sesión exclusiva por evento/colegio, pero la app no coordina embajadores en dispositivos distintos.
- 🔴 El sistema no genera bloqueos de concurrencia al recibir imágenes de múltiples usuarios en paralelo.
  -> No hay un servidor que reciba cargas concurrentes ni pruebas de concurrencia.
- 🟡 Cada foto obtiene un identificador único, generado en el dispositivo al capturarla y validado por el servidor, evitando que se sobrescriban o se mezclen registros y permitiendo descartar reenvíos de una misma foto.
  -> Se genera un ID local único y se evita duplicar un registro en la simulación, pero ningún servidor valida el ID.
- 🔴 Si dos o más embajadores suben formularios al mismo tiempo para el mismo evento o colegio, el sistema los procesa de forma independiente.
  -> No existe una carga simultánea real ni procesamiento de servidor para verificar este comportamiento.
- ✅ Cada registro conserva el perfil general y el dispositivo desde los que se capturó el formulario.
- 🔴 El rendimiento de carga no debe degradarse significativamente cuando varios usuarios cargan al mismo tiempo, dentro de los volúmenes definidos para un evento típico.
  -> No se implementa ni mide rendimiento bajo carga concurrente.

### HU 9: Historial de cargas — 🟡 Parcial

- ✅ La app incluye una vista de “Historial de Cargas” que muestra el listado de formularios enviados por el embajador autenticado, sin mostrar los de otros embajadores.
- 🟡 Cada ítem del historial detalla la hora de captura, el evento y el colegio indicados por el embajador y su estado actual: Subida (recibida por el servidor), En procesamiento, Verificado (la IA identificó todos los campos con certeza del 100%), Por revisar (tiene campos que requieren revisión manual), Revisado (todos sus campos por revisar ya fueron resueltos) o Error (la subida falló y se puede reintentar, HU 7).
  -> Se muestran esos tipos de estados a partir de datos locales simulados; no hay recepción real del servidor ni procesamiento real de IA.
- ✅ El historial muestra únicamente los estados de procesamiento del formulario. Los estados de duplicado y de papelera son internos del analista y no se muestran al embajador.
- ✅ El historial permite filtrar por evento y por colegio.

## Épica #2: Seguridad e inicio de sesión en la app móvil

### HU 10: Inicio de sesión en la app móvil con perfil general — 🟡 Parcial

- ✅ La app presenta una pantalla de inicio de sesión donde el embajador ingresa con un perfil general (por ejemplo, seleccionando el perfil e ingresando su clave).
- ✅ Solo pueden ingresar perfiles generales activos, creados por el administrador; el embajador no puede crear ni modificar perfiles desde la app.
- 🟡 Si las credenciales son válidas, la app permite el acceso y asocia las cargas de la sesión al perfil autenticado y al dispositivo.
  -> El registro simulado guarda el perfil y dispositivo activos al subir la cola, no necesariamente los activos cuando se capturó la foto.
- 🔴 Varios perfiles distintos pueden tener sesión activa al mismo tiempo en dispositivos diferentes sin interferir entre sí.
  -> El prototipo mantiene una única base local en el navegador; no implementa ni verifica sesiones coordinadas en varios dispositivos.
- 🟡 Un perfil no puede tener sesión activa en dos dispositivos a la vez; si se intenta, la app informa que el perfil está en uso y no permite el ingreso.
  -> Hay una comprobación del ID de dispositivo en los datos locales, pero no puede coordinar ni detectar sesiones reales en otros dispositivos.
- ✅ Al cerrar sesión, el perfil queda libre para que otro embajador lo use.
- 🔴 Si un perfil quedó ocupado por un dispositivo perdido o sin conexión, el administrador puede liberarlo (HU 41).
  -> No se implementa en la app móvil una función administrativa para liberar el perfil.
- ✅ Bloqueo de seguridad: tras 3 intentos fallidos consecutivos sobre un perfil, el sistema lo bloquea temporalmente por 10 minutos e informa el tiempo de espera.
- ✅ Protección de rutas: toda función de la app (captura, cola offline, historial) requiere sesión activa; sin sesión, redirige al login.
- 🟡 La clave del perfil se oculta al digitarse y se almacena cifrada.
  -> Se oculta por defecto al escribir, pero la clave de demostración está disponible en los datos locales y no se cifra.
- 🟡 La sesión se mantiene en el dispositivo aunque se pierda la conexión, mientras el token local siga vigente; el primer inicio de sesión en un dispositivo requiere conexión.
  -> Se comprueba que el primer ingreso tenga conexión y se mantiene el estado local de sesión, pero no se implementan un token ni su vigencia.

### HU 11: Cierre de sesión automático en la app móvil — 🟡 Parcial

- ✅ La app detecta la inactividad del usuario (sin toques en pantalla ni capturas en segundo plano) y cierra la sesión automáticamente tras un tiempo límite configurable (ej. 15 minutos).
- 🟡 Ante un cierre por inactividad, la app elimina el token de acceso activo y redirige inmediatamente a la pantalla de login solicitando credenciales nuevamente.
  -> Se limpia el estado local de sesión y el layout redirige al login, pero no existe un token de acceso implementado.
- 🔴 Si no hay conexión al volver a iniciar sesión, la app valida el perfil y la clave contra una huella cifrada de las credenciales guardada en el dispositivo, mientras no haya vencido la vigencia offline; así el embajador puede continuar su trabajo sin señal.
  -> No se implementan huella cifrada de credenciales ni vigencia offline.
- ✅ La interfaz incluye una opción o botón explícito de “Cerrar sesión” accesible en todo momento desde el perfil o menú principal.
- 🟡 Al cerrar sesión manualmente o por inactividad, las fotos de la cola local pendientes de envío se mantienen resguardadas de forma cifrada e inaccesibles desde la galería del dispositivo, y se suben cuando el mismo perfil general inicie sesión y haya conexión.
  -> La cola local se conserva, pero no cifrada ni como archivos de foto; tampoco se comprueba que solo el mismo perfil pueda subirla.
- 🔴 Si venció la vigencia offline y no hay conexión, la app no permite iniciar sesión hasta recuperar la conexión; las fotos pendientes permanecen cifradas.
  -> No se implementan vigencia offline ni cifrado de fotos pendientes.
