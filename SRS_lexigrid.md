<div style="text-align:center; padding-top:20vh;">

<div style="font-size:4.5em; font-weight:bold; line-height:1.1;">ERS</div>

<div style="font-size:2.2em; margin-top:0.5em;">Especificación de Requisitos de Software</div>

<div style="font-size:3.5em; font-weight:bold; margin-top:1.5em;">LexiGrid</div>

<div style="font-size:1.2em; margin-top:3em;">

Danna Isabella Ramos<br>
Juliana Hoyos Rueda<br>
Valeria Robles Torres
</div>

</div>

<div style="page-break-after: always;"></div>

---

# **Índice de Contenidos**

- **1. Introducción**
  - 1.1 Propósito del Documento
  - 1.2 Alcance del Proyecto
    - 1.2.1 Alcance en el contexto de negocio
    - 1.2.2 Alcance en el contexto de uso
    - 1.2.3 Alcance en el contexto de desarrollo
    - 1.2.4 Alcance en el contexto de I.T
  - 1.3 Stakeholders del proyecto
    - 1.3.1 Equipo de desarrollo
  - 1.4 Definiciones, Acrónimos y Abreviaciones
  - 1.5 Referencias

- **2. Visión General del Producto**
  - 2.1 Perspectiva del Producto
  - 2.2 Funciones del Producto
  - 2.3 Restricciones del Producto
  - 2.4 Características del Usuario
  - 2.5 Supuestos y Dependencias

- **3.** Historias de Usuario

  - 3.1 División de sprints

# **1. Introducción**

Esta sección presenta el propósito, el alcance y el contexto general del documento SRS para LexiGrid.

## **1.1 Propósito del Documento**

LexiGrid es una solución de dos componentes, una app móvil para los embajadores y una plataforma web para analistas de mercadeo y administradores, que digitaliza los formularios manuscritos de los aspirantes que el área de Mercadeo de la Universidad de San Buenaventura (USB) recoge en ferias universitarias y visitas a colegios.

El embajador fotografía cada formulario; un modelo de IA (OCR) extrae los datos y marca los campos que no logra leer con certeza; solo esos campos se revisan; los registros se organizan (duplicados, incontactables, prioridad) y se envían directamente a Salesforce

De esta forma, LexiGrid reduce el tiempo de digitación manual y facilita que los analistas prioricen el contacto con los aspirantes de mayor potencial.

## **1.2 Alcance del Proyecto**

El alcance de Lexigrid está dividido en los cuatro siguientes contextos:

### **1.2.1 Alcance en el contexto del negocio:**

El área de Mercadeo de la Universidad de San Buenaventura (USB) se encarga de la atracción, captación e ingesta de datos de aspirantes y futuros estudiantes matriculados; principalmente mediante la participación en ferias universitarias y visitas presenciales a colegios.

Actualmente, este proceso implica digitación manual y carga posterior al CRM Salesforce, lo que genera tiempos elevados, errores de transcripción y duplicidad de registros. LexiGrid busca optimizar este proceso mediante el uso de IA para el reconocimiento de letra manuscrita, reduciendo drásticamente los tiempos de procesamiento y mejorando la calidad de los datos capturados.

### **1.2.2 Alcance en el contexto del uso:**

- Perfil analítico (analista de mercadeo)

Rol: Utiliza la plataforma web para registrar colegios, crear y cerrar jornadas, revisar registros, depurar duplicados, preparar y enviar el lote a Salesforce, sacar reportes.

- Perfil operativo (embajadores): Iniciar sesión en la app móvil, elegir una jornada y sus respectivos colegios, poder subir los registros con o sin conexión, ver los estados de los registros, revisar los campos con la etiqueta de “por revisar”

- Perfil administrador: Usa la plataforma web para gestionar usuarios y permisos, parámetros, conexión y mapeo con Salesforce, dashboard, métricas, historial completo y supresión de dato

Flujo resumido:

1.  El analista registra los colegios y crea la jornada (feria o visita).

2.  El embajador inicia sesión, elige la jornada y el colegio activos y fotografía cada formulario; la app evalúa la calidad y guarda en una cola cifrada si no hay conexión.

3.  La foto se sube; la IA extrae los campos y marca como “Por revisar” los dudosos.

4.  Un analista (en la web) o el propio embajador confirma o corrige solo esos campos.

5.  La plataforma elimina duplicados, etiqueta incontactables, calcula la prioridad y excluye los registros sin autorización de datos.

6.  El analista revisa el resumen y envía el lote de la jornada a Salesforce; cada registro queda “Enviado” o “Error de envío”.

7.  El administrador supervisa métricas, seguridad y auditoría.

### **1.2.3 Alcance en el contexto del desarrollo:**

Software propuesto: sistema que digitaliza los formularios físicos de aspirantes, estructura y prioriza la información y la envía directo al CRM, sin pasar por Excel.

Componentes:

1.  App móvil (embajador): captura de fotos con evaluación de calidad en el dispositivo, modo offline con cola cifrada, y registro libre de jornada, colegio y ciudad.

2.  Plataforma web (analista y administrador): revisión en pantalla dividida, duplicados, papelera, prioridad y envío por jornada y colegio.

3.  Backend con IA/OCR: lectura de letra manuscrita y marcado de campos con certeza menor al 100 % como “Por revisar”.

4.  Integración directa con el CRM: envío registro por registro, con reintento y actualización.

5.  Almacenamiento seguro: imágenes cifradas y retención limitada.

Resultado esperado: menos digitación manual y menos errores. Cada

### **1.2.4 Alcance en el contexto de I.T:**

- **Despliegue:** backend contenerizado con Docker (API, modelo de IA y base de datos), en la red de la universidad o en un servicio cloud de bajo costo. La app móvil y la web consumen la misma API.

- **Backend:** Python (Flask o FastAPI) con el modelo de OCR/IA. La prioridad de los leads se calcula con reglas (grado, contacto y carrera), no con el modelo. Expone la integración con la API del CRM.

- **Base de datos:** PostgreSQL o MySQL, para la cola de procesamiento, los campos dudosos, la detección de duplicados y los estados de envío. Los casos dudosos permanecen ahí hasta que un **analista** los corrija en la web. Solo se envían los registros Verificados o Revisados.

- **Imágenes:** se conservan cifradas solo si hay campos por revisar, y se eliminan automáticamente un plazo después del envío. Viajan por TLS.

- **Seguridad y acceso:** roles fijos (embajador en app, analista y administrador en web), con bloqueo tras 3 intentos fallidos y cierre por inactividad. El embajador entra con un perfil general. La auditoría es inmutable y cumple Habeas Data, porque hay datos de menores de edad.

## **1.3 Stakeholders del proyecto:**

|   |   |
|---|---|
| **Project sponsor** | Área de mercadeo de la Universidad de San Buenaventura Cali |
| **Clientes** | Analistas, administrador y personal del área de mercadeo y embajadores |
| **Contractors** | Estudiantes de ingeniería de sistemas de la Universidad de San Buenaventura Cali |

## **1.4 Definiciones, Acrónimos y Abreviaciones**

| **Término** | **Definición**                                                                                                                        |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------|
| SRS         | Documento de especificación de Requisitos de Software                                                                                 |
| USB         | Universidad de San Buenaventura                                                                                                       |
| OCR         | Reconocimiento Óptico de Caracteres                                                                                                   |
| CRM         | Customer Relationship Management                                                                                                      |
| I.T         | Information Technology                                                                                                                |
| Habeas Data | Derecho que tiene toda persona a conocer, actualizar, rectificar y suprimir la información que las organizaciones guardan sobre ella. |

## **1.5 Referencias**

- Prototipo:[https://uxpilot.ai/s/3b7b780cb3f410b8ea91f95f0009a2fc](https://uxpilot.ai/s/3b7b780cb3f410b8ea91f95f0009a2fc)

- Tablero trello: [https://trello.com/b/gC6IGO50/lexigrid](https://trello.com/b/gC6IGO50/lexigrid)

- Entrevistas: [https://drive.google.com/file/d/1I3Kr_vajBmk_emgBtmO8NubbiLqrlIru/view?usp=sharing](https://drive.google.com/file/d/1I3Kr_vajBmk_emgBtmO8NubbiLqrlIru/view?usp=sharing)

[https://drive.google.com/file/d/1HAYflZE3PSuhdEMJaAoeLudbZK69N5VH/view?usp=sharing](https://drive.google.com/file/d/1HAYflZE3PSuhdEMJaAoeLudbZK69N5VH/view?usp=sharing)
[https://drive.google.com/file/d/1iWT3Y6CxMyRxMOCUhvTGk7clwr0paMME/view?usp=sharing](https://drive.google.com/file/d/1iWT3Y6CxMyRxMOCUhvTGk7clwr0paMME/view?usp=sharing)

# **2. Visión General del Producto**

## **2.1 Perspectiva del Producto**

El sistema es una aplicación móvil orientada a la digitalización y priorización de formularios de aspirantes captados por el área de mercadeo de la Universidad, en ferias y visitas a colegios. El producto reemplaza el proceso manual actual de transcripción en Excel, integrándose de forma directa con el CRM Salesforce que la Universidad ya utiliza para la gestión comercial

LexiGrid se compone de los siguientes módulos principales:

● **Módulo de autenticación:** gestiona el acceso seguro de usuarios
● **Módulo de escaneo:** permite fotografiar los formularios en físico
● **Módulo de transcripción:** procesa las imágenes capturadas mediante un modelo de inteligencia artificial para transcribir la información manuscrita y estimar el nivel de certeza de cada campo.
● **Módulo de revisión - corrección:** permite a los usuarios comparar la foto original con los campos transcritos y corregirlos manualmente
● **Módulo de priorización**: organiza los registros según la completitud de sus datos de contacto y grado escolar.
● **Módulo de detección de duplicados:** identifica y elimina aspirantes duplicados en base a su documento de identidad, guardando la información más completa.
● **Módulo de integración con Salesforce:** exporta de forma directa y automática los registros consolidados al CRM, sin pasos intermedios en Excel
● **Módulo de historial de cambios:** registra y almacena las acciones de cada usuario sobre el lote de registros.

## **2.2 Funciones del Producto**

El sistema incluye las siguientes funcionalidades principales:

● Autenticación de usuarios (inicio de sesión seguro)
● Captura de formularios físicos mediante fotografía desde dispositivo móvil
● Reconocimiento automático de escritura manuscrita mediante IA
● Validación de certeza en el escaneo de los registros sin interrumpir su carga.
● Revisión y comparación de campos dudosos
● Detección de aspirantes duplicados
● Priorización de los estudiantes según la completitud de su información
● Exportación directa de los registros con salesforce
● Trazabilidad de las acciones realizadas por los usuarios

## **2.3 Restricciones del Producto**

- El sistema depende de la disponibilidad y calidad de las fotografías tomadas por los embajadores.

- Se requiere conexión a internet para el funcionamiento de la aplicación y la sincronización con Salesforce.

- Solo usuarios registrados y autenticados con un perfil pueden acceder al sistema; no se permite el uso anónimo o compartido de cuentas.

- El sistema no debe exponer ni compartir información confidencial de los aspirantes fuera de los canales autorizados.

- El sistema no debe descartar aspirantes bajo ningún criterio automático.

- El sistema debe soportar el uso simultáneo de varios usuarios cargando información al mismo tiempo.

## **2.4 Características del Usuario**

El sistema contempla dos perfiles principales de usuario final:

- **Embajador:** encargado de la captura de formularios en campo mediante fotografía desde la aplicación móvil, y de la revisión y corrección de los campos marcados como dudosos por la IA. Es un usuario operativo, con acceso frecuente y simultáneo junto a otros embajadores durante eventos de alto volumen.

- **Analista:** encargado de la validación y corrección más detallada de los registros, así como de la resolución de casos de duplicados o inconsistencias que requieran mayor criterio. Su interacción con el sistema es más análitica.

## **2.5 Supuestos y Dependencias**

**Supuestos:**
- Los clientes cuentan con acceso a internet

- Los clientes cuentan con teléfonos móviles que cuentan con cámaras de buena resolución

- El equipo de mercadeo cuenta con acceso vigente y configurado a Salesforce.

- El sistema será utilizado principalmente durante eventos de captación (ferias, visitas a colegios) con volúmenes altos y simultáneos de carga.

**Dependencias:**
- Motor de base de datos relacional (PostgreSQL / MySQL) para la gestión de la cola de procesamiento y los casos dudosos.

- API de Salesforce para la integración y exportación directa de los registros.

- Modelo de inteligencia artificial de OCR para la transcripción de los formularios.

- Infraestructura de despliegue del backend mediante contenedores Docker, ya sea en la red local de la Universidad o en un servicio en la nube.

# **3. Historias de Usuario**

## **3.1 Historias de usuario**

Las historias de usuario de LexiGrid se organizan por épicas. Cada historia incluye su descripción (Como / Quiero / Para), sus criterios de aceptación y su prioridad según la técnica MoSCoW (Must, Should, Could, Won’t).

### **3.1.1 Épica \#1: Captura de datos**

#### **HU 1: Captura de formularios**

Como embajador

Quiero cargar fotos de los formularios de los aspirantes desde una aplicación móvil

Para evitar la digitalización manual de los colegios y ferias.

Criterios de aceptación:

- Se pueden tomar múltiples fotos de distintos formularios y cargarlas en una sola sesión de captura; cada foto corresponde a un formulario.

- Se puede tomar la foto directamente con la cámara integrada en la aplicación, sin tener que salir de la app.

- Después de tomar la foto y superar la evaluación de calidad, el sistema muestra una vista previa antes de confirmar la carga, permitiendo repetirla si no quedó conforme.

- Cada foto queda asociada al perfil general autenticado y a los datos del lote (evento, colegio y ciudad).

- Las fotos viajan cifradas desde la app hacia el servidor.

- Una vez completa la carga, las fotos no quedan almacenadas de forma visible o accesible en el dispositivo (ni en la galería).

- Solo los roles autorizados pueden visualizar las imágenes cargadas: el analista y el administrador, las de cualquier registro. El embajador no visualiza los formularios cargados; solo verifica que la carga fue exitosa mediante el estado de sincronización (HU 7) y el historial de cargas (HU 9).

- La conservación y eliminación de las imágenes en el servidor se rige exclusivamente por la HU 15.

MoSCoW: Must

#### **HU 2: Evaluar la calidad de la foto**

Como embajador

Quiero que al tomar la foto la app evalúe la calidad de la imagen en el propio dispositivo, antes de agregarla a la cola de carga

Para repetir la fotografía de inmediato si no es legible, incluso cuando no hay conexión a internet.

Criterios de aceptación:

- La evaluación de calidad se realiza en el dispositivo y funciona sin conexión a internet.

- Si la foto tiene baja calidad (borrosa, con poca luz, incompleta o con reflejos que impidan leer el texto), la app no la agrega a la cola de carga ni la envía al servidor.

- Si una foto tiene baja calidad, la app muestra una advertencia en pantalla antes de continuar.

- La advertencia debe indicar claramente el motivo del rechazo.

- La app debe ofrecer la opción de repetir la foto directamente desde la advertencia, sin tener que reiniciar todo el proceso de carga.

- Si la foto tiene buena calidad, la app continúa automáticamente con la vista previa y la confirmación de la carga.

- Superar la evaluación de calidad no garantiza que todos los campos sean legibles para la IA: los campos que el modelo no logre interpretar con certeza se marcan “Por revisar”.

MoSCoW: Should

#### **HU 3: Definir evento, colegio y ciudad del lote**

Como embajador

Quiero escribir el nombre del evento (feria o visita), el colegio y la ciudad del lote que voy a cargar

Para que cada formulario fotografiado quede asociado a su origen real sin depender de listas predefinidas.

Criterios de aceptación:

- Antes de la primera captura, la app solicita evento, colegio y ciudad como campos de texto obligatorios.

- La app no permite capturar formularios mientras falte alguno de los tres datos.

- Los valores se limpian automáticamente (espacios sobrantes al inicio, al final y duplicados); no se aceptan valores vacíos ni solo espacios.

- Cada formulario queda asociado a los tres valores vigentes en el momento de la captura.

- No se exige que el evento o el colegio existan previamente en el sistema.

- Los valores permanecen guardados al cerrar la app y se reutilizan hasta que el embajador los cambie.

- Todo el flujo funciona sin conexión; los datos viajan con los formularios al sincronizar.

MoSCoW: Must

#### **HU 4: Cambiar evento, colegio o ciudad fácilmente**

Como embajador

Quiero cambiar rápidamente cualquiera de los tres datos del lote

Para seguir cargando formularios cuando cambio de colegio o de evento sin interrumpir mi trabajo.

Criterios de aceptación:

- Los datos activos se muestran siempre visibles en la pantalla de captura.

- Se pueden editar en máximo 2 toques desde la pantalla de captura.

- Se puede cambiar un solo dato (por ejemplo, solo el colegio) conservando los otros dos.

- El cambio aplica solo a los formularios que se capturen después; los anteriores conservan sus valores.

- Mientras un formulario no se haya sincronizado, el embajador puede corregir sus datos de lote (por ejemplo, un error de digitación).

MoSCoW: Must

#### **HU 5: Sugerencias de valores usados anteriormente**

Como embajador

Quiero que la app me sugiera eventos, colegios y ciudades que ya escribí antes

Para evitar escribirlos de nuevo y reducir variantes del mismo nombre.

Criterios de aceptación:

- Al escribir en cada campo, la app muestra sugerencias de valores usados previamente en ese dispositivo.

- La coincidencia ignora mayúsculas y tildes.

- El embajador puede ignorar la sugerencia y escribir un valor nuevo.

- Las sugerencias funcionan sin conexión.

MoSCoW: Should

#### **HU 6: Modo offline**

Como embajador

Quiero que la app funcione en modo offline con una cola local de fotos pendientes

Para no perder trabajo por falta de conexión.

Criterios de aceptación:

- La app guarda las fotos tomadas localmente (de forma cifrada e inaccesible desde la galería) mientras no haya conexión.

- La evaluación de calidad, el registro de los datos del lote y la vista previa funcionan sin conexión.

- Al recuperar la conexión, la app las sube automáticamente, sin que el embajador tenga que hacer nada, siempre que exista una sesión activa; si la sesión expiró, la app solicita iniciar sesión y luego sube las fotos pendientes.

- La app le informa al embajador cuántas fotos están pendientes por cargar.

- La app muestra una confirmación cuando se suben las fotos pendientes correctamente.

- Una vez confirmada la subida de una foto, esta se elimina del dispositivo.

MoSCoW: Must

#### **HU 7: Estado de sincronización, fallos y reintento de cada foto**

Como embajador

Quiero ver el estado de sincronización de cada foto (Pendiente, Subiendo, Subida, Error) y recibir una notificación clara cuando una carga falla

Para saber si es necesario reintentar el proceso, sin perder las fotos tomadas localmente.

Criterios de aceptación:

- La app móvil muestra un indicador visual o etiqueta clara en cada foto tomada con su estado actual: Pendiente (en la cola local), Subiendo, Subida (recibida por el servidor) o Error.

- Si la foto falla en subirse (por pérdida de conexión, tiempo de espera agotado o error del servidor), la app cambia el estado a Error, muestra una alerta en pantalla con la causa específica del fallo (ej. “Sin conexión a internet”, “Error de respuesta del servidor”) y habilita la acción explícita “Reintentar”, que es la única acción de reintento manual de la app.

- Las fotos con estado Error permanecen almacenadas localmente en la cola offline hasta que el reintento sea exitoso.

- Al presionar “Reintentar” (desde la alerta o desde el listado), la app intenta subir únicamente las fotos con estado Error o Pendiente, sin duplicar las fotos con estado Subida; el servidor descarta cualquier reenvío de una foto ya recibida mediante su identificador único (HU 8).

- Al completarse la carga de todas las fotos asociadas a un evento y colegio, la app muestra una notificación general de éxito.

- La app actualiza el estado en tiempo real a medida que cada imagen completa su envío al servidor.

- El estado “Subida” indica únicamente que la foto llegó al servidor.

MoSCoW: Should

#### **HU 8: Carga simultánea**

Como embajador

Quiero escanear y cargar formularios al mismo tiempo que otros embajadores

Para agilizar lo máximo posible el proceso de escaneo.

Criterios de aceptación:

- Varios embajadores pueden asociar sus cargas a un mismo evento y a un mismo colegio, sin que el sistema les obligue a trabajar en sesiones separadas.

- El sistema no genera bloqueos de concurrencia al recibir imágenes de múltiples usuarios en paralelo.

- Cada foto obtiene un identificador único, generado en el dispositivo al capturarla y validado por el servidor, evitando que se sobrescriban o se mezclen registros y permitiendo descartar reenvíos de una misma foto.

- Si dos o más embajadores suben formularios al mismo tiempo para el mismo evento o colegio, el sistema los procesa de forma independiente.

- Cada registro conserva el perfil general y el dispositivo desde los que se capturó el formulario.

- El rendimiento de carga no debe degradarse significativamente cuando varios usuarios cargan al mismo tiempo, dentro de los volúmenes definidos para un evento típico.

MoSCoW: Must

#### **HU 9: Historial de cargas**

Como embajador

Quiero consultar un historial de los formularios y fotos que he cargado durante el evento

Para verificar que todo mi trabajo quedó registrado correctamente en la plataforma.

Criterios de aceptación:

- La app incluye una vista de “Historial de Cargas” que muestra el listado de formularios enviados por el embajador autenticado, sin mostrar los de otros embajadores.

- Cada ítem del historial detalla la hora de captura, el evento y el colegio indicados por el embajador y su estado actual: Subida (recibida por el servidor), En procesamiento, Verificado (la IA identificó todos los campos con certeza del 100%), Por revisar (tiene campos que requieren revisión manual), Revisado (todos sus campos por revisar ya fueron resueltos) o Error (la subida falló y se puede reintentar, HU 7).

- El historial muestra únicamente los estados de procesamiento del formulario. Los estados de duplicado y de papelera son internos del analista y no se muestran al embajador.

- El historial permite filtrar por evento y por colegio.

MoSCoW: Could

### **3.1.2 Épica \#2: Seguridad e inicio de sesión en la app móvil**

#### **HU 10: Inicio de sesión en la app móvil con perfil general**

Como embajador

Quiero iniciar sesión en la app móvil usando uno de los perfiles generales disponibles

Para poder cargar formularios sin necesitar una cuenta personal, mientras otros embajadores usan otros perfiles al mismo tiempo.

Criterios de aceptación:

- La app presenta una pantalla de inicio de sesión donde el embajador ingresa con un perfil general (por ejemplo, seleccionando el perfil e ingresando su clave).

- Solo pueden ingresar perfiles generales activos, creados por el administrador; el embajador no puede crear ni modificar perfiles desde la app.

- Si las credenciales son válidas, la app permite el acceso y asocia las cargas de la sesión al perfil autenticado y al dispositivo.

- Varios perfiles distintos pueden tener sesión activa al mismo tiempo en dispositivos diferentes sin interferir entre sí.

- Un perfil no puede tener sesión activa en dos dispositivos a la vez; si se intenta, la app informa que el perfil está en uso y no permite el ingreso.

- Al cerrar sesión, el perfil queda libre para que otro embajador lo use.

- Si un perfil quedó ocupado por un dispositivo perdido o sin conexión, el administrador puede liberarlo (HU 41).

- Bloqueo de seguridad: tras 3 intentos fallidos consecutivos sobre un perfil, el sistema lo bloquea temporalmente por 10 minutos e informa el tiempo de espera.

- Protección de rutas: toda función de la app (captura, cola offline, historial) requiere sesión activa; sin sesión, redirige al login.

- La clave del perfil se oculta al digitarse y se almacena cifrada.

- La sesión se mantiene en el dispositivo aunque se pierda la conexión, mientras el token local siga vigente; el primer inicio de sesión en un dispositivo requiere conexión.

MoSCoW: Must

#### **HU 11: Cierre de sesión automático en la app móvil**

Como embajador

Quiero que la aplicación cierre mi sesión automáticamente tras un periodo de inactividad o permitirme cerrarla manualmente

Para proteger los datos recolectados y prevenir accesos no autorizados en caso de pérdida o robo del dispositivo móvil.

Criterios de aceptación:

- La app detecta la inactividad del usuario (sin toques en pantalla ni capturas en segundo plano) y cierra la sesión automáticamente tras un tiempo límite configurable (ej. 15 minutos).

- Ante un cierre por inactividad, la app elimina el token de acceso activo y redirige inmediatamente a la pantalla de login solicitando credenciales nuevamente.

- Si no hay conexión al volver a iniciar sesión, la app valida el perfil y la clave contra una huella cifrada de las credenciales guardada en el dispositivo, mientras no haya vencido la vigencia offline; así el embajador puede continuar su trabajo sin señal.

- La interfaz incluye una opción o botón explícito de “Cerrar sesión” accesible en todo momento desde el perfil o menú principal.

- Al cerrar sesión manualmente o por inactividad, las fotos de la cola local pendientes de envío se mantienen resguardadas de forma cifrada e inaccesibles desde la galería del dispositivo, y se suben cuando el mismo perfil general inicie sesión y haya conexión.

- Si venció la vigencia offline y no hay conexión, la app no permite iniciar sesión hasta recuperar la conexión; las fotos pendientes permanecen cifradas.

MoSCoW: Should

### **3.1.3 Épica \#3: Procesamiento del reconocimiento óptico de caracteres (OCR)**

#### **HU 12: Identificación de campos**

Como analista de mercadeo

Quiero que la plataforma web identifique automáticamente los campos legibles de cada formulario mediante OCR

Para hacer más eficiente el proceso de transcripción y reducir la digitación manual.

Criterios de aceptación:

- El sistema identifica y extrae el nombre y apellidos del aspirante (campo de texto libre).

- El sistema identifica y extrae el número de documento de identificación del aspirante (campo de texto libre).

- El sistema identifica y extrae el número de celular del aspirante y, si existe, el del acudiente (campos de texto libre).

- El sistema identifica y extrae el correo electrónico del aspirante y el nombre del acudiente (campos de texto libre).

- El sistema identifica el tipo de documento (T.I. o C.C.), el grado (9, 10, 11, 12 o graduado), el tipo de calendario (A o B), la o las carreras de interés marcadas y la autorización de tratamiento de datos personales (campos de opción múltiple o de marca).

- Cada campo identificado queda asociado correctamente a su etiqueta dentro del registro y es visible en la plataforma web apenas termina el procesamiento, junto con su estado (definido en la HU 13).

MoSCoW: Must

#### **HU 13: Campos con incertidumbre**

Como analista de mercadeo

Quiero que el sistema procese de forma continua los formularios y marque los campos donde el modelo de IA no logre interpretar con certeza (por ejemplo, por letra manuscrita ilegible)

Para que un analista los verifique o modifique manualmente antes de enviar el lote al CRM.

Criterios de aceptación:

- Un campo se marca “Verificado” cuando la IA lo identifica con un nivel de certeza del 100%; cualquier campo con certeza inferior al 100% se marca “Por revisar”. El umbral del 100% es fijo y no es configurable.

- Un campo que viene en blanco en el formulario físico y que la IA identifica como vacío con certeza se registra como vacío y “Verificado”; no se marca “Por revisar”.

- Si el OCR no logra identificar con certeza el valor de un campo de texto libre, el campo queda marcado como “Por revisar”.

- En campos de opción múltiple, si existe ambigüedad (ej. dos casillas marcadas o ninguna marcada cuando debería haber una), el sistema marca el campo como “Por revisar”.

- El estado “Por revisar” queda asociado solo al campo dudoso, no al formulario completo; el campo se resalta en color amarillo en la plataforma web.

- El registro queda “Verificado” cuando todos sus campos están “Verificados” y “Por revisar” cuando al menos un campo lo está.

- La conservación o eliminación de la imagen según este resultado se rige por la HU 15.

- El procesamiento no se detiene cuando encuentra un campo dudoso; continúa con el resto del formulario y los siguientes sin interrupción.

MoSCoW: Must

#### **HU 14: Validación de formato de los datos extraídos**

Como analista de mercadeo

Quiero que la plataforma valide el formato de los datos extraídos (documento, celulares y correo electrónico)

Para evitar que lleguen al CRM datos de contacto o de identificación con formato inválido.

Criterios de aceptación:

- El sistema valida que el número de documento contenga solo dígitos, que cada celular tenga un formato válido de 10 dígitos y que el correo electrónico tenga una estructura válida (usuario@dominio).

- Si un valor no cumple el formato, el campo se marca “Por revisar” indicando el motivo (ej. “formato de correo inválido”) para que el revisor lo corrija; el valor no se descarta.

- El sistema no permite guardar como “Revisado manualmente” un celular, un correo o un documento con formato inválido: el revisor debe corregirlo o dejarlo vacío.

- Para efectos de contacto y priorización, un dato se considera válido cuando está presente y cumple el formato.

- Si dentro de un mismo registro el celular del aspirante y el del acudiente son iguales, el sistema conserva un solo número como celular principal y deja vacío el del acudiente.

MoSCoW: Must

#### **HU 15: Almacenamiento selectivo y retención de imágenes**

Como administrador del sistema

Quiero que la plataforma conserve las imágenes solo mientras sean necesarias para la revisión y la auditoría, y las elimine después

Para optimizar el almacenamiento y limitar el tiempo que se conservan los documentos originales de los aspirantes.

Criterios de aceptación:

- Si tras el procesamiento todos los campos del registro son “Verificados”, el sistema elimina la imagen del servidor automáticamente y no conserva ninguna copia.

- Si el registro tiene al menos un campo “Por revisar”, el sistema conserva la imagen cifrada y asociada al registro; mientras haya campos “Por revisar”, la imagen no se elimina.

- Una vez que el registro queda “Enviado” al CRM, la imagen se conserva durante un plazo configurable (por ejemplo, 10 días) y luego se elimina automáticamente.

- Un registro “Revisado” que aún no ha sido enviado conserva su imagen de forma indefinida: el plazo de retención corre solo desde el envío.

- Si el registro ya fue enviado y su imagen ya fue eliminada, el registro permanece completo; solo se pierde la imagen.

- La imagen de un registro en la Papelera se elimina junto con el registro al cumplirse sus 30 días (HU 24).

- El administrador puede consultar y modificar el plazo de retención; el cambio aplica a los envíos futuros.

- Cada eliminación de imagen queda registrada en el historial de auditoría, sin contener datos personales del aspirante.

- Esta es la única HU que define las reglas de conservación y eliminación de imágenes; las demás la referencian.

MoSCoW: Must

### **3.1.4 Épica \#4: Revisión manual de transcripciones**

#### **HU 16: Interfaz de comparación en la plataforma web**

Como analista de mercadeo

Quiero visualizar en pantalla dividida, desde la plataforma web, la imagen del formulario físico frente a los datos extraídos por la IA

Para verificar o corregir manualmente los campos marcados como “Por revisar” antes de enviar el lote al CRM.

Criterios de aceptación:

- Mientras el registro tenga campos “Por revisar”, la imagen original está disponible para revisarse en cualquier momento, no solo al final de la sesión de escaneo (conservación según HU 15).

- El analista accede a la imagen original desde el campo marcado como “Por revisar”, visualizándola en pantalla dividida junto al valor extraído por la IA.

- El sistema permite sobrescribir el campo (editar manualmente el valor) o confirmar el texto ya identificado por la IA, sin necesidad de transcribir el formulario completo.

- Al confirmar o corregir un campo, el sistema lo marca como “Revisado manualmente” y actualiza su resaltado a color verde, reemplazando el amarillo de “Por revisar”.

- Cuando ya no queda ningún campo “Por revisar”, el registro pasa a estado “Revisado” y queda listo para envío al CRM.

- Cada confirmación o corrección queda registrada en el historial con el usuario, el valor anterior y el valor nuevo.

- Los registros “Enviados” se muestran en solo lectura y no admiten confirmación ni corrección (HU 28).

MoSCoW: Must

#### **HU 17: Prevención de ediciones simultáneas sobre un registro**

Como analista de mercadeo

Quiero que el sistema impida que dos analistas modifiquen al mismo tiempo el mismo registro

Para evitar que una corrección sobreescriba a otra.

Criterios de aceptación:

- Cuando un analista abre un registro en la plataforma web para revisarlo o corregirlo, el registro queda marcado como “en revisión” por ese analista.

- Mientras esté “en revisión”, los demás analistas pueden consultarlo en solo lectura pero no editarlo. La web indica quién lo tiene abierto y desde cuándo.

- La marca aplica a cualquier registro abierto para edición en la web, incluidos los de la papelera y los que están en resolución de duplicados.

- La marca se libera al guardar los cambios, al cerrar el registro o tras un tiempo de inactividad configurable. Si el analista cierra sesión o pierde la conexión, se libera por inactividad.

- El sistema rechaza el guardado de quien no tenga la marca, aunque la interfaz esté desactualizada.

- El bloqueo de edición no impide la carga de nuevas fotos desde la app ni el procesamiento de los formularios (OCR).

MoSCoW: Should

#### **HU 18: Ver campos pendientes por registro y filtrar por embajador**

Como analista de mercadeo

Quiero ver cuántos campos “Por revisar” tiene cada registro y filtrar los registros por el perfil general (embajador) que los capturó

Para organizar mi cola de trabajo sin tener que recorrer todos los registros del evento.

Criterios de aceptación:

- El filtro por estado “Por revisar” (HU 29) muestra únicamente los registros con al menos un campo “Por revisar”, e indica cuántos campos pendientes tiene cada registro listado.

- El analista puede filtrar además por el perfil general (embajador) que capturó el formulario y combinarlo con el evento y el colegio (HU 29).

MoSCoW: Should

#### **HU 19: Comentarios internos en un registro dudoso**

Como analista de mercadeo

Quiero dejar una nota interna sobre un registro que me generó dudas al corregirlo

Para que otro analista que revise el mismo caso más adelante tenga el contexto necesario.

Criterios de aceptación:

- El sistema permite agregar una nota de texto libre a cualquier registro desde su vista de detalle.

- Cada nota queda asociada al usuario que la escribió y a la fecha y hora en que se registró.

- Las notas son visibles para cualquier analista o administrador que abra ese registro, pero no son visibles en la app móvil.

- Las notas son de uso interno de LexiGrid: nunca forman parte de los datos que se envían al CRM.

MoSCoW: Could

#### **HU 20: Visualización de la imagen original desde un registro**

Como analista de mercadeo

Quiero acceder a la imagen original de un formulario desde el detalle del registro, incluso si ya quedó “Revisado” o “Enviado”

Para poder auditar o resolver dudas posteriores sin depender del flujo inicial de revisión.

Criterios de aceptación:

- El sistema permite abrir la imagen original desde el detalle del registro en cualquier momento mientras esta se conserve, no solo mientras el campo está “Por revisar”.

- Si el registro quedó “Verificado” desde el procesamiento, no existe imagen; el detalle lo indica claramente (“Imagen no conservada: todos los campos fueron identificados con certeza del 100%”).

- Si la imagen ya fue eliminada por cumplirse el plazo de retención, el detalle lo indica.

- La imagen se muestra en la misma vista de comparación usada durante la revisión inicial.

MoSCoW: Could

### **3.1.5 Épica \#5: Organización de registros**

#### **HU 21: Detección de duplicados y estado “Por revisar duplicado”**

Como analista de mercadeo

Quiero que la plataforma web detecte a los aspirantes duplicados y los deje en estado “Por revisar duplicado” sin descartar ni modificar nada

Para mantener el control de lo que se carga al CRM.

Criterios de aceptación:

- El sistema identifica duplicados cuando coincide el número de documento o el correo electrónico entre dos o más registros de LexiGrid, del mismo evento o de otros, incluidos los ya enviados al CRM.

- La coincidencia de celular no se considera duplicado, porque varios aspirantes pueden compartir el celular de un mismo acudiente.

- La comparación solo usa campos que no estén “Por revisar”; cuando un campo se resuelve, el sistema reevalúa los duplicados.

- Al detectar una coincidencia, el registro de captura más reciente (“nuevo”) pasa a “Por revisar duplicado”; el registro de captura más antigua (“anterior”) conserva su estado. Nada se descarta ni se sobrescribe automáticamente.

- Si un registro coincide con varios (por ejemplo, con B por documento y con C por correo), todos se agrupan en un mismo caso que el analista resuelve en conjunto.

- “Por revisar duplicado” es un estado del registro, independiente del “Por revisar” de los campos: un registro puede estar “Verificado” por el OCR y aun así estar en “Por revisar duplicado”.

- Este estado y el apartado de duplicados son exclusivos del analista en la plataforma web; no se muestran en la app móvil.

- La detección queda registrada en el historial de auditoría.

- La deduplicación se hace solo dentro de LexiGrid; la plataforma no consulta registros del CRM.

MoSCoW: Must

#### **HU 22: Resolver duplicados desde el apartado Duplicados**

Como analista de mercadeo

Quiero ver qué información difiere entre los registros duplicados y decidir cuál conservar

Para tener el control de lo que se carga al CRM.

Criterios de aceptación:

- La plataforma web tiene un apartado “Duplicados”, exclusivo del analista, con los casos en “Por revisar duplicado”.

- Para cada caso muestra los registros coincidentes, por qué campo coincidieron (documento o correo) y qué campos difieren (valor anterior y valor nuevo).

- El analista puede resolver el caso de tres formas: conservar el registro anterior, conservar el nuevo, o elegir campo por campo qué valor queda.

- El sistema sugiere como opción por defecto la información más reciente, pero nada se aplica hasta que el analista la confirme.

- Al resolver, queda un único registro con los valores elegidos, sale de “Por revisar duplicado” y continúa su flujo normal. El registro que no se conserva pasa a la Papelera con el motivo “Duplicado descartado” (HU 24).

- Un registro ya “Enviado” nunca se modifica automáticamente: si el analista conserva información nueva, el registro enviado queda “Pendiente de actualización”. El envío de esa actualización corresponde a la HU 39.

- La decisión del analista (qué valores conservó) queda en el historial de auditoría.

MoSCoW: Must

#### **HU 23: Clasificación de aspirantes incontactables**

Como analista de mercadeo

Quiero que la plataforma retire de la fila de trabajo los registros que no tienen ningún canal de contacto y los mande a la papelera

Para que mi cola solo tenga aspirantes que el equipo comercial puede contactar.

Criterios de aceptación:

- Si un registro no tiene celular del aspirante, celular del acudiente ni correo, el sistema lo quita de la fila (por revisar y listos) y lo mueve a la papelera.

- Si el registro tiene al menos uno de los tres datos de contacto, permanece en la fila.

- Si alguno de los tres campos de contacto está en estado “Por revisar”, el registro no se mueve hasta que ese campo se resuelva. Cuando se resuelve y sigue sin ningún canal, se mueve.

- El sistema reevalúa esta regla cada vez que cambia alguno de los tres datos de contacto.

- Al moverse, el registro guarda la fecha de eliminación y el motivo “Incontactable (sin canal de contacto)”.

- Los registros en la Papelera no se incluyen en los conteos de la fila.

- Cada movimiento queda en el historial de acciones, indicando que fue una acción automática del sistema.

MoSCoW: Should

#### **HU 24: Papelera de registros descartados**

Como analista de mercadeo

Quiero consultar y restaurar los registros que el sistema sacó de la fila (“Duplicado descartado” e “Incontactable”) durante 30 días

Para corregir errores del sistema sin perder aspirantes y sin conservar datos personales más tiempo del necesario.

Criterios de aceptación:

- Los registros descartados por “Duplicado descartado” o por “Incontactable (sin canal de contacto)” se guardan en una sección “Papelera” durante 30 días.

- Cada registro muestra su motivo, la fecha de eliminación y los días restantes. Si es un duplicado, también indica con qué registro coincidió y por qué campo.

- El analista puede restaurar un registro. No se descarta de nuevo automáticamente por la misma causa mientras no cambie su información.

- Un registro restaurado con motivo “Duplicado descartado” queda en “Por revisar duplicado” si no tiene campos “Por revisar”; si tiene algún campo “Por revisar”, queda en “Por revisar”. Un registro restaurado con motivo “Incontactable” vuelve a la fila con el estado que le corresponde por sus campos.

- Cada restauración queda en el historial con el usuario, la fecha y el motivo original.

- Los registros en la Papelera no cuentan en la fila.

- Al cumplirse los 30 días, el sistema elimina definitivamente el registro y su imagen, y registra solo el identificador y la fecha de la purga.

MoSCoW: Must

#### **HU 25: Filtrar y restaurar en lote la Papelera**

Como analista de mercadeo

Quiero filtrar la Papelera por motivo y por colegio y restaurar varios registros a la vez

Para encontrar rápido los registros a recuperar y corregir errores del sistema en bloque.

Criterios de aceptación:

- La Papelera se puede filtrar por motivo y por colegio.

- El analista puede restaurar varios registros a la vez; cada uno sigue las reglas de restauración de la HU 24.

MoSCoW: Should

#### **HU 26: Recuperación automática de incontactables al corregir su contacto**

Como analista de mercadeo

Quiero que un registro que está en la papelera por ser incontactable vuelva solo a la fila de trabajo cuando corrijo alguno de sus datos de contacto en la plataforma web

Para no perder aspirantes recuperables sin tener que buscarlos y restaurarlos manualmente.

Criterios de aceptación:

- El sistema reevalúa el registro cada vez que el analista edita un dato de contacto (celular del aspirante, celular del acudiente o correo) en la plataforma web.

- El analista puede editar los datos de contacto de un registro desde la Papelera (movido desde la HU 22).

- Si el registro está en la papelera con motivo “Incontactable” y tras la edición tiene al menos un canal de contacto, el sistema lo saca de la papelera y lo devuelve a la fila de trabajo sin acción adicional.

- Al volver a la fila, el sistema le asigna su prioridad según las reglas vigentes. Si tiene campos “Por revisar”, entra a esa cola.

- Si tras la edición sigue sin ningún canal de contacto, permanece en la papelera y su plazo de 30 días no se reinicia.

- Un registro cuyo plazo de 30 días ya venció y fue eliminado definitivamente no se puede recuperar.

- Un registro con motivo “Duplicado descartado” no se recupera automáticamente al editarlo; solo se puede restaurar manualmente (HU 24).

- Si el registro ya había sido enviado al CRM y se edita su dato de contacto, queda como “Pendiente de actualización”.

- La recuperación automática queda en el historial, con el analista que hizo la corrección y la fecha.

MoSCoW: Should

#### **HU 27: Priorización de leads**

Como analista de mercadeo

Quiero que la plataforma priorice automáticamente a los aspirantes según su grado, su carrera de interés y la completitud de sus datos de contacto

Para facilitar la gestión comercial, dando prioridad a estudiantes de grado 11 o graduados con datos de contacto válidos.

Criterios de aceptación:

- Contacto completo: al menos un celular válido (del aspirante o del acudiente) y un correo electrónico válido. Contacto parcial: solo celular o solo correo. Carrera definida: al menos una carrera de interés marcada, sin ambigüedad.

- Prioridad Alta: grado 11 o graduado, con contacto completo y carrera definida.

- Prioridad Media: grado 11 o graduado con contacto parcial o sin carrera definida; o grado 9, 10 o 12 con contacto completo.

- Prioridad Baja: grado 9, 10 o 12 con contacto parcial.

- Si el grado está en blanco y “Verificado”, el registro tiene prioridad Baja.

- Dentro de cada nivel, el sistema ordena primero los registros con más campos diligenciados y, en caso de empate, los capturados más recientemente.

- Los aspirantes “Incontactables” no aparecen porque están en la Papelera.

- Si el grado, un dato de contacto o la carrera están “Por revisar”, el registro queda como “Pendiente de prioridad” hasta que se resuelvan; el sistema recalcula la prioridad cada vez que cambia alguno de esos datos.

- La prioridad se aplica de forma consistente en todas las listas y se envía al CRM como un campo del mapeo (HU 33).

MoSCoW: Should

#### **HU 28: Conservar registros enviados en un archivo aparte**

Como analista de mercadeo

Quiero que los aspirantes ya enviados al CRM permanezcan guardados en la plataforma, separados de los que están en trabajo

Para conservar el respaldo de lo enviado sin que estorbe en la revisión diaria.

Criterios de aceptación:

- Los registros “Enviados” no se eliminan ni se anonimizan por el paso del tiempo.

- Los registros enviados no aparecen en las vistas de trabajo (por revisar, listos, incontactables) ni en los conteos de pendientes.

- Existe una sección o filtro de “Enviados” donde el analista puede consultarlos por evento, colegio y ciudad (reutiliza los filtros de la HU 29).

- Los registros enviados siguen participando en la detección de duplicados: si llega un aspirante nuevo igual a uno ya enviado, el sistema lo señala.

- Los registros enviados son de solo lectura; los únicos cambios posibles ocurren por la resolución de duplicados (HU 22) o la edición de contacto (HU 26) y los dejan “Pendiente de actualización”.

- Un registro enviado conserva todos sus datos, el estado y la fecha de envío, aunque su imagen haya sido eliminada.

MoSCoW: Must

### **3.1.6 Épica \#6: Eventos e integración directa con el CRM**

#### **HU 29: Filtrar aspirantes por evento, colegio y ciudad**

Como analista de mercadeo

Quiero filtrar los aspirantes por evento, colegio y ciudad

Para revisar y exportar la información de un evento o colegio específico sin buscar manualmente.

Criterios de aceptación:

- La plataforma ofrece filtros por evento, colegio y ciudad, combinables entre sí y con el estado (por revisar, verificados, revisados, duplicados).

- Las opciones de cada filtro se generan a partir de los valores existentes en los formularios cargados.

- Cada filtro permite búsqueda por texto parcial, ignorando mayúsculas y tildes.

- Los filtros se mantienen al navegar entre vistas y se pueden limpiar con una sola acción.

- La vista muestra el total de resultados del filtro aplicado.

MoSCoW: Must

#### **HU 30: Ver avance de revisión y de envío por evento y colegio**

Como analista de mercadeo

Quiero ver un resumen de cuántos aspirantes hay en cada estado por evento y colegio

Para saber qué falta por revisar antes de exportar al CRM.

Criterios de aceptación:

- La plataforma muestra una tabla agrupada por evento y colegio con la cantidad de aspirantes en cada estado de revisión.

- La tabla muestra también la cantidad de registros en cada estado de envío (Pendiente de envío, Enviado, Error de envío, Pendiente de actualización).

- Se puede ordenar por cantidad de “Por revisar”.

- Al seleccionar una fila, se aplica automáticamente el filtro de evento y colegio correspondiente (HU 29).

- Los conteos se actualizan al cambiar el estado de un aspirante.

MoSCoW: Should

#### **HU 31: Unificar variantes de nombre de colegio, evento o ciudad**

Como analista de mercadeo

Quiero unificar variantes escritas distinto del mismo colegio, evento o ciudad

Para que los filtros y reportes no queden fragmentados.

Criterios de aceptación:

- El sistema sugiere valores similares entre sí (por ejemplo, “Col. San José” y “Colegio San Jose”).

- El analista puede seleccionar dos o más variantes y elegir el valor final.

- La unificación actualiza todos los registros afectados.

- La unificación queda registrada en el historial de auditoría.

- No modifica registros ya enviados al CRM (son de solo lectura, HU 28).

MoSCoW: Could

#### **HU 32: Configuración de la conexión con el CRM**

Como administrador del sistema

Quiero configurar y autorizar la conexión entre LexiGrid y el CRM

Para que la plataforma envíe los registros directamente al CRM, sin intervención manual de archivos.

Criterios de aceptación:

- El administrador registra los datos de conexión (organización y credenciales o autorización de acceso) y selecciona el ambiente de destino (pruebas o producción).

- La plataforma incluye la acción “Probar conexión”, que informa claramente si la conexión es exitosa o la causa del fallo.

- Las credenciales se almacenan cifradas y no se muestran una vez guardadas.

- La plataforma muestra el estado de la conexión (Conectado o Con error) y la fecha de la última verificación.

- Mientras no exista una conexión configurada y vigente, el envío al CRM permanece deshabilitado y la plataforma lo indica.

- Toda modificación de la configuración queda registrada en el historial de auditoría.

MoSCoW: Must

#### **HU 33: Mapeo de campos hacia el CRM**

Como administrador del sistema

Quiero definir la correspondencia entre los campos de LexiGrid y los campos del objeto del CRM

Para que cada dato llegue al campo correcto del CRM sin transformaciones manuales.

Criterios de aceptación:

- El administrador define el mapeo de, como mínimo, los siguientes datos: nombre y apellidos, tipo y número de documento, celular del aspirante, celular del acudiente, correo electrónico, nombre del acudiente, grado, calendario, carreras de interés, evento de origen, colegio, ciudad y prioridad (cuando esté disponible, HU 27).

- Para los campos de opción múltiple, el administrador define la equivalencia entre los valores de LexiGrid y los valores aceptados por el CRM.

- Para cada campo requerido por el CRM, el administrador define qué hacer si queda vacío (dejarlo en blanco o enviar un valor por defecto), de modo que el envío no falle ni se corrompa.

- Las notas internas, las imágenes y los datos de auditoría no forman parte del mapeo y nunca se envían al CRM.

- La plataforma valida el mapeo contra los campos disponibles en el CRM y alerta si algún campo mapeado no existe.

- Los cambios de mapeo aplican a los envíos futuros, no modifican los registros ya enviados y quedan registrados en el historial de auditoría.

MoSCoW: Must

#### **HU 34: Preparar el lote por evento y colegio y ver su resumen**

Como analista de mercadeo

Quiero preparar el lote de envío de un evento y un colegio y ver un resumen de su contenido antes de enviarlo al CRM

Para transmitir la información validada sin manipular archivos individuales.

Criterios de aceptación:

- El analista selecciona un evento y un colegio (valores existentes en los formularios) para preparar el lote, y puede seleccionar explícitamente varios eventos para enviarlos juntos.

- Un registro está listo para envío cuando es “Verificado” o “Revisado”, cuenta con autorización de tratamiento de datos, no está en la Papelera y no está en “Por revisar duplicado”.

- El sistema reúne en un solo lote todos los registros listos para envío de esa combinación, aplicando el mapeo definido.

- El sistema excluye automáticamente del lote los registros “Por revisar”, los registros en “Por revisar duplicado”, los de la Papelera y los registros sin autorización de tratamiento de datos. Esta es la única HU que define las exclusiones del lote.

- Antes de enviar, el sistema muestra un resumen con la cantidad de registros: listos para envío, “Por revisar” que quedarían pendientes, sin autorización y ya enviados.

- El envío es manual: el analista lo dispara cuando lo decide, y se ejecuta según la HU 36.

- Un registro ya enviado no vuelve a incluirse en lotes posteriores de la misma combinación.

- El lote se prepara dentro del sistema: no se genera ningún archivo.

MoSCoW: Must

#### **HU 35: Advertencia de pendientes antes de enviar el lote**

Como analista de mercadeo

Quiero que antes de enviar un lote la plataforma me señale los registros de ese evento y colegio que aún están “Por revisar” y me dé la oportunidad de resolverlos

Para no dejar información sin consolidar fuera del envío.

Criterios de aceptación:

- Si la combinación seleccionada tiene registros “Por revisar”, el sistema los señala con su cantidad antes de permitir el envío.

- La advertencia ofrece un acceso directo a la lista de pendientes con el filtro de evento y colegio ya aplicado.

- Al volver de la revisión, el resumen se recalcula e incluye los registros recién resueltos.

- Si el analista decide enviar con pendientes, debe confirmarlo explícitamente.

- Los pendientes quedan fuera del lote y disponibles para un envío posterior de la misma combinación.

- El envío confirmado con pendientes queda registrado en el historial de auditoría.

MoSCoW: Should

#### **HU 36: Envío directo al CRM**

Como analista de mercadeo

Quiero que la plataforma envíe directamente al CRM los registros del lote preparado de un evento

Para cargar de forma masiva la información al CRM sin generar ni subir archivos manualmente.

Criterios de aceptación:

- El envío se realiza de forma directa mediante la integración con el CRM, no se requiere una carga manual.

- Los datos viajan cifrados desde LexiGrid hacia al CRM.

- Se envía únicamente el lote preparado según la HU 34; un registro “Por revisar” nunca se envía.

- Cada envío corresponde al evento y colegio del lote preparado, salvo que el analista seleccione explícitamente varios eventos para enviarlos juntos.

- Los datos se envían según el mapeo definido; si algún campo requerido queda vacío, el sistema lo maneja según lo configurado, sin que el envío falle o se corrompa.

- Cada registro se envía y se confirma de forma individual: el fallo de un registro no cancela el envío de los demás.

- Los registros enviados correctamente quedan “Enviado” y no se reenvían en envíos posteriores.

- Al finalizar, el sistema muestra una confirmación con el evento, la cantidad de registros enviados correctamente y la cantidad de registros con error.

- El envío no consulta ni deduplica contra registros existentes en el CRM; los duplicados se gestionan únicamente en LexiGrid.

- Cada envío queda registrado en el historial de auditoría.

MoSCoW: Must

#### **HU 37: Estado de envío de cada registro**

Como analista de mercadeo

Quiero ver el estado de envío de cada registro al CRM (Pendiente de envío, Enviado, Error de envío, Pendiente de actualización)

Para saber qué registros llegaron al CRM y cuáles requieren atención.

Criterios de aceptación:

- Cada registro muestra su estado de envío; cuando está “Enviado”, muestra la fecha y hora del envío y el identificador asignado por el CRM.

- Cuando está en “Error de envío”, el registro muestra el motivo informado por el CRM o por la conexión (ej. campo requerido vacío, valor no aceptado).

- El analista puede filtrar los registros por estado de envío, evento y colegio.

- El estado de envío es independiente del estado de revisión.

MoSCoW: Should

#### **HU 38: Reintento de envíos fallidos**

Como analista de mercadeo

Quiero reintentar el envío de los registros que fallaron

Para completar la carga al CRM sin duplicar los registros que ya se enviaron correctamente.

Criterios de aceptación:

- El analista puede reintentar el envío de los registros en “Error de envío”, de forma individual o por evento; los registros “Enviado” no se reenvían.

- Cada registro se envía con su identificador único como identificador externo en el CRM, de modo que un reintento no cree registros repetidos.

- Si el CRM no está disponible, los registros permanecen “Pendiente de envío” sin pérdida de datos y el envío se puede reanudar cuando la conexión se restablezca.

MoSCoW: Should

#### **HU 39: Actualización en el CRM de registros ya enviados**

Como analista de mercadeo

Quiero actualizar en el CRM un registro ya enviado cuando se corrija en LexiGrid

Para que el CRM no conserve datos desactualizados ni se creen registros repetidos.

Criterios de aceptación:

- Cuando un registro “Enviado” cambia por la resolución de un duplicado (HU 22) o por la edición de sus datos de contacto (HU 26), queda “Pendiente de actualización”.

- El analista puede enviar la actualización de un registro o de todos los pendientes de un evento.

- La actualización modifica el mismo registro en el CRM (identificado por su identificador externo) y no crea uno nuevo.

MoSCoW: Could

#### **HU 40: Alerta de falla en la integración con el CRM**

Como analista de mercadeo

Quiero recibir una alerta cuando la integración con el CRM falle

Para evitar que se queden registros sin enviar.

Criterios de aceptación:

- La plataforma muestra una alerta al analista cuando un envío completo falla, la conexión no es válida o las credenciales vencieron, indicando la causa.

- La misma alerta se notifica al administrador cuando la causa es de conexión o de credenciales.

- La alerta permanece visible hasta que el envío se complete o el problema se resuelva, y ofrece un acceso directo a la acción de reintento.

MoSCoW: Should

### **3.1.7 Épica \#7: Administración y supervisión**

#### **HU 41: Gestión de usuarios, roles y perfiles generales**

Como administrador del sistema

Quiero crear, editar e inhabilitar las cuentas de analistas y administradores y los perfiles generales de los embajadores, asignando a cada uno su rol

Para mantener actualizado el control de acceso a medida que el equipo cambia.

Criterios de aceptación:

- El sistema permite crear una cuenta asignándole un rol (Operativo, Analítico o Administrativo). Para los analistas y administradores se registra el correo institucional y una contraseña inicial sujeta a los requisitos de seguridad; para los embajadores se crea un perfil general (rol Operativo) con nombre y clave, sin relación con códigos estudiantiles ni cuentas personales.

- El correo institucional de analistas y administradores debe ser único en el sistema, y el nombre de cada perfil general también.

- Cada usuario o perfil general tiene un único rol activo, con permisos fijos. Operativo (embajador, solo app móvil): captura de formularios, cola, estados de sincronización e historial de cargas. Analítico (analista, solo plataforma web): revisión de registros, organización (duplicados, incontactables, Papelera, prioridad), filtros y resúmenes, preparación y envío del lote al CRM, e historial de sus propias acciones. Administrativo (administrador, solo plataforma web): gestión de usuarios y perfiles generales, parámetros del sistema, configuración y mapeo del CRM e historial completo.

- El sistema permite editar o inhabilitar una cuenta existente sin eliminar su historial de acciones asociado; al inhabilitarla se revocan sus sesiones activas.

- El administrador puede corregir la clave de un perfil general y desbloquear una cuenta o perfil bloqueado por intentos fallidos antes de que se cumplan los 10 minutos.

- El administrador puede liberar un perfil general que quedó con sesión activa en un dispositivo (por ejemplo, por pérdida del dispositivo o falta de conexión).

- El listado de usuarios muestra el estado (activo/inactivo) y el rol de cada uno.

MoSCoW: Must

#### **HU 42: Revocación de sesión y borrado remoto de datos del dispositivo**

Como administrador del sistema

Quiero revocar la sesión de un embajador y solicitar el borrado de los datos locales de su dispositivo

Para proteger los datos de los aspirantes si el dispositivo se pierde o es robado.

MoSCoW: Won’t

#### **HU 43: Métricas de tiempo de digitación y errores**

Como administrador del sistema

Quiero ver métricas del tiempo de digitación y de la reducción de errores manuales

Para medir el impacto del sistema frente al proceso manual anterior en Excel.

MoSCoW: Won’t

### **3.1.8 Épica \#8: Seguridad e inicio de sesión en la plataforma web**

#### **HU 44: Inicio de sesión seguro en la plataforma web**

Como analista de mercadeo

Quiero iniciar sesión en la plataforma web con mis credenciales individuales: correo institucional y contraseña

Para que todas mis correcciones, envíos y configuraciones queden trazados a mi usuario.

Criterios de aceptación:

- La plataforma presenta un formulario de inicio de sesión que solicita obligatoriamente correo institucional y contraseña.

- Toda funcionalidad de la plataforma requiere una sesión activa; sin sesión, se redirige al login.

- Tras 3 intentos fallidos consecutivos, el sistema bloquea temporalmente la cuenta por 10 minutos e informa al usuario del tiempo de espera.

- La contraseña debe cumplir requisitos mínimos de seguridad (longitud y complejidad) al crearse o restablecerse.

- Los embajadores (rol Operativo) no inician sesión en la plataforma web: su acceso es únicamente la app móvil.

MoSCoW: Must

#### **HU 45: Recuperación de contraseña**

Como analista de mercadeo

Quiero poder recuperar el acceso a mi cuenta si olvido mi contraseña

Para no quedar bloqueado en medio de una sesión de revisión.

Criterios de aceptación:

- El sistema permite solicitar la recuperación de contraseña desde la pantalla de login de la plataforma web mediante el correo institucional.

- El sistema envía un enlace o código de un solo uso, con vigencia limitada, al correo institucional registrado.

- Al restablecer la contraseña, la nueva clave debe cumplir los mismos requisitos mínimos de seguridad exigidos al crear la cuenta.

- Esta funcionalidad no aplica al rol Operativo; su acceso lo gestiona el administrador.

MoSCoW: Should

#### **HU 46: Cierre de sesión automático en la plataforma web**

Como analista de mercadeo

Quiero que la plataforma cierre mi sesión automáticamente tras un periodo de inactividad

Para proteger los datos personales de los aspirantes si dejo mi computador desatendido.

Criterios de aceptación:

- La plataforma detecta la inactividad del usuario y cierra la sesión automáticamente tras un tiempo límite configurable.

- Ante un cierre por inactividad, el sistema redirige a la pantalla de login solicitando credenciales nuevamente.

- La plataforma incluye un botón explícito de “Cerrar sesión” accesible desde el perfil en todo momento.

MoSCoW: Should

### **3.1.9 Épica \#9: Trazabilidad y auditoría**

#### **HU 47: Historial de cambios por usuario**

Como administrador del sistema

Quiero que la plataforma guarde un historial de las acciones realizadas por los usuarios

Para saber quién sube, edita, comprueba y envía la información de los aspirantes, en cumplimiento de Habeas Data.

Criterios de aceptación:

- El sistema registra en el historial el ID de usuario, la fecha, la hora, el tipo de acción y el registro afectado.

- Esta es la HU que enumera todos los eventos auditados; las demás solo la mencionan. Se registran como mínimo: cada carga de formularios; cada confirmación o corrección de un campo “Por revisar” (con el valor anterior y el nuevo, desde la web); cada detección de duplicados y cada decisión de resolución (valores conservados); cada restauración desde la Papelera y cada recuperación automática; cada movimiento automático a la Papelera (indicando que fue acción del sistema); cada eliminación de imágenes o de datos, incluida la purga definitiva (solo identificador y fecha, sin datos personales); cada visualización de una imagen; cada unificación de nombres de evento, colegio o ciudad; cada envío, reintento y actualización al CRM, incluido el envío confirmado con pendientes; cada cambio en la configuración de la conexión, del mapeo y del plazo de retención; y cada acción de gestión de usuarios y perfiles generales (creación, edición, inhabilitación, desbloqueo y liberación).

- El historial es de solo lectura: ningún usuario puede editar o eliminar entradas ya registradas.

- El acceso al historial completo está restringido al rol Administrativo; el rol Analítico solo ve el historial de sus propias acciones; el rol Operativo no tiene acceso.

- El historial permite filtrar por usuario, tipo de acción o rango de fechas, para facilitar auditorías puntuales.

MoSCoW: Must

## **3.2 División por sprints**

La planificación se organiza en 11 sprints, asumiendo una duración de dos semanas por sprint. Los criterios utilizados fueron:

- Prioridad MoSCoW: primero se desarrollan todas las historias Must (sprints 1 a 6), luego las Should (sprints 7 a 10) y finalmente las Could (sprint 11). Las historias Won’t quedan fuera de esta versión.

- Dependencias técnicas: la autenticación, los roles y la auditoría se construyen primero; la captura precede al OCR; la detección de duplicados precede a su resolución y a la Papelera; la conexión y el mapeo del CRM preceden a la preparación y al envío del lote.

- Entrega de valor: al terminar el sprint 6 el sistema ya permite capturar, procesar, revisar, depurar y enviar aspirantes al CRM (producto mínimo viable).

Resumen por prioridad MoSCoW

| **Prioridad** | **Cantidad de HU** | **Historias de usuario**                                                              |
|---------------|--------------------|---------------------------------------------------------------------------------------|
| Must          | 23                 | 1, 3, 4, 6, 8, 10, 12, 13, 14, 15, 16, 21, 22, 24, 28, 29, 32, 33, 34, 36, 41, 44, 47 |
| Should        | 17                 | 2, 5, 7, 11, 17, 18, 23, 25, 26, 27, 30, 35, 37, 38, 40, 45, 46                       |
| Could         | 5                  | 9, 19, 20, 31, 39                                                                     |
| Won’t         | 2                  | 42, 43                                                                                |
| Total         | 47                 |                                                                                       |

Plan de sprints

| **Sprint** | **Objetivo** | **Historias de usuario** | **MoSCoW** |
|---|---|---|---|
| Sprint 1 | Acceso, roles y trazabilidad (base de seguridad del sistema) | HU 41: Gestión de usuarios, roles y perfiles generales<br>HU 44: Inicio de sesión seguro en la plataforma web<br>HU 10: Inicio de sesión en la app móvil con perfil general<br>HU 47: Historial de cambios por usuario | Must |
| Sprint 2 | Captura móvil y carga concurrente de formularios | HU 3: Definir evento, colegio y ciudad del lote<br>HU 4: Cambiar evento, colegio o ciudad fácilmente<br>HU 1: Captura de formularios<br>HU 8: Carga simultánea | Must |
| Sprint 3 | Modo offline y extracción de datos con OCR | HU 6: Modo offline<br>HU 12: Identificación de campos<br>HU 13: Campos con incertidumbre<br>HU 14: Validación de formato de los datos extraídos | Must |
| Sprint 4 | Retención de imágenes, revisión manual, detección de duplicados y filtros | HU 15: Almacenamiento selectivo y retención de imágenes<br>HU 16: Interfaz de comparación en la plataforma web<br>HU 21: Detección de duplicados y estado “Por revisar duplicado”<br>HU 29: Filtrar aspirantes por evento, colegio y ciudad | Must |
| Sprint 5 | Resolución de duplicados, Papelera, archivo de enviados y conexión con el CRM | HU 22: Resolver duplicados desde el apartado Duplicados<br>HU 24: Papelera de registros descartados<br>HU 28: Conservar registros enviados en un archivo aparte<br>HU 32: Configuración de la conexión con el CRM | Must |
| Sprint 6 | Mapeo, preparación del lote y envío directo al CRM (cierre del MVP) | HU 33: Mapeo de campos hacia el CRM<br>HU 34: Preparar el lote por evento y colegio y ver su resumen<br>HU 36: Envío directo al CRM | Must |
| Sprint 7 | Mejoras de la app móvil: calidad de foto, sugerencias, estados de sincronización y cierre de sesión | HU 2: Evaluar la calidad de la foto<br>HU 5: Sugerencias de valores usados anteriormente<br>HU 7: Estado de sincronización, fallos y reintento de cada foto<br>HU 11: Cierre de sesión automático en la app móvil | Should |
| Sprint 8 | Organización avanzada del trabajo del analista | HU 17: Prevención de ediciones simultáneas sobre un registro<br>HU 18: Ver campos pendientes por registro y filtrar por embajador<br>HU 23: Clasificación de aspirantes incontactables<br>HU 25: Filtrar y restaurar en lote la Papelera | Should |
| Sprint 9 | Recuperación de incontactables, priorización, resumen de avance y advertencia previa al envío | HU 26: Recuperación automática de incontactables al corregir su contacto<br>HU 27: Priorización de leads<br>HU 30: Ver avance de revisión y de envío por evento y colegio<br>HU 35: Advertencia de pendientes antes de enviar el lote | Should |
| Sprint 10 | Seguimiento del envío al CRM y complementos de seguridad web | HU 37: Estado de envío de cada registro<br>HU 38: Reintento de envíos fallidos<br>HU 40: Alerta de falla en la integración con el CRM<br>HU 45: Recuperación de contraseña<br>HU 46: Cierre de sesión automático en la plataforma web | Should |
| Sprint 11 | Funcionalidades deseables (Could have) | HU 9: Historial de cargas<br>HU 19: Comentarios internos en un registro dudoso<br>HU 20: Visualización de la imagen original desde un registro<br>HU 31: Unificar variantes de nombre de colegio, evento o ciudad<br>HU 39: Actualización en el CRM de registros ya enviados | Could |
| Fuera de alcance | Backlog no planificado en esta versión | HU 42: Revocación de sesión y borrado remoto de datos del dispositivo<br>HU 43: Métricas de tiempo de digitación y errores | Won’t |

### **3.3.1 Validación con el cliente:**

La validación la realiza el área de Mercadeo (sponsor), que revisa cada historia de usuario del sprint y manifiesta su aceptación por medio de un correo electrónico.

![image2.png](recursos/image2.png)
