# **Actividades para la Estimación:**

## **Épica #1: Captura de datos**

### **HU 1: Captura de formularios**

AC 1: [Frontend/Mobile] Habilitar la cámara integrada de la app para permitir la captura continua de múltiples fotos de formularios por sesión, sin salir de la aplicación.

AC 2: [Frontend/Mobile] Implementar la vista previa de la foto evaluada para permitir confirmar o repetir antes de agregarla a la cola de carga.

AC 3: [Backend] Crear endpoints seguros para recibir las imágenes cifradas, asociándolas al perfil general, evento, colegio y ciudad correspondientes.

AC 4: [Frontend/Mobile] Asegurar que las imágenes no queden visibles ni accesibles en la galería del dispositivo una vez completada la carga.

AC 5: [Backend] Implementar control de permisos y roles para restringir la visualización de imágenes (analista y administrador, cualquier registro; embajador, sin acceso a las imágenes cargadas).

AC 6: [DevOps] Configurar el almacenamiento seguro y cifrado de imágenes en el servidor y el cifrado en tránsito (TLS).

AC 7: [UX] Diseñar las pantallas de captura continua y de vista previa de la foto.

AC 8: [QA] Realizar pruebas de integración para validar el cifrado en tránsito, el almacenamiento temporal y el control de acceso.

### **HU 2: Evaluar la calidad de la foto**

AC 1: [Frontend/Mobile] Integrar un motor de procesamiento de imagen en el dispositivo que funcione offline para evaluar borrosidad, iluminación, reflejos e imagen incompleta.

AC 2: [Frontend/Mobile] Desarrollar la lógica de bloqueo de la cola de carga ante imágenes de baja calidad y mostrar advertencias que indiquen claramente el motivo del rechazo.

AC 3: [Frontend/Mobile] Implementar el flujo directo para repetir la foto desde la misma alerta de rechazo, sin reiniciar el proceso de carga.

AC 4: [UX] Diseñar las advertencias de rechazo y los mensajes explicativos por cada motivo de baja calidad.

AC 5: [QA] Ejecutar pruebas unitarias y de rendimiento del algoritmo de calidad con diferentes escenarios de iluminación, enfoque, reflejos y formularios incompletos.

### **HU 3: Definir evento, colegio y ciudad del lote**

AC 1: [UX] Diseñar la pantalla/modal de datos del lote (3 campos).

AC 2: [Mobile] Implementar formulario con validaciones y limpieza de texto.

AC 3: [Mobile] Persistir localmente los datos del lote activo.

AC 4: [Mobile] Asociar los datos activos a cada formulario capturado.

AC 5: [Backend] Agregar campos evento, colegio y ciudad al modelo del formulario/aspirante y al endpoint de carga.

AC 6: [QA] Probar captura y sincronización con y sin conexión.

### **HU 4: Cambiar evento, colegio o ciudad fácilmente**

AC 1: [UX] Diseñar el indicador de lote activo y el acceso rápido a edición.

AC 2: [Mobile] Implementar edición individual de cada dato y actualización del contexto activo.

AC 3: [Mobile] Implementar corrección de datos de lote en formularios pendientes de sincronizar.

AC 4: [QA] Probar cambios en mitad de una sesión y que no alteren formularios ya capturados.

### **HU 5: Sugerencias de valores usados anteriormente**

AC 1: [Mobile] Guardar localmente el historial de valores usados por campo.

AC 2: [Mobile] Implementar autocompletado con búsqueda insensible a tildes y mayúsculas.

AC 3: [UX] Diseñar la lista de sugerencias.

AC 4: [QA] Probar sugerencias offline y entrada de valores nuevos.

### **HU 6: Modo offline**

AC 1: [Frontend/Mobile] Implementar una base de datos local cifrada (como SQLite o Realm) para almacenar de forma segura y oculta las fotos pendientes.

AC 2: [Frontend/Mobile] Configurar el motor de sincronización automática en segundo plano para detectar la recuperación de conectividad y enviar la cola local.

AC 3: [Frontend/Mobile] Desarrollar la validación del estado de la sesión activa al reintentar la sincronización; si expiró, solicitar inicio de sesión y luego subir las pendientes.

AC 4: [Frontend/Mobile] Gestionar la limpieza y eliminación segura de las fotos locales una vez el servidor confirme su recepción.

AC 5: [Frontend/Mobile] Mostrar el contador de fotos pendientes por cargar y la confirmación al completarse la subida.

AC 6: [Backend] Aceptar y asociar a sus datos de lote originales (evento, colegio y ciudad) las fotos capturadas y sincronizadas después.

AC 7: [Arquitecto] Diseñar la arquitectura del modo offline y del mecanismo de sincronización (cola, reintentos y resolución de conflictos).

AC 8: [QA] Ejecutar pruebas de sincronización con cortes de red, reconexión, sesión expirada y cierre del evento.

### **HU 7: Estado de sincronización, fallos y reintento de cada foto**

AC 1: [Frontend/Mobile] Desarrollar indicadores visuales y etiquetas dinámicas para los estados de cada foto (Pendiente, Subiendo, Subida, Error), actualizados en tiempo real.

AC 2: [Frontend/Mobile] Implementar el manejo de excepciones de red, tiempo de espera y servidor para pasar automáticamente el estado a Error, mostrar la alerta con la causa específica y habilitar el botón explícito de “Reintentar”.

AC 3: [Frontend/Mobile] Desarrollar la notificación general de éxito al completarse la carga del evento y el colegio.

AC 4: [Backend] Asegurar que el servidor valide el identificador único de la foto para descartar duplicados ante reintentos.

AC 5: [Frontend/Mobile] Asegurar que la persistencia local mantenga los metadatos y estados correctos sin duplicar envíos exitosos previos.

AC 6: [UX] Diseñar las etiquetas, íconos y colores de los estados de sincronización.

AC 7: [QA] Ejecutar pruebas de transiciones de estado, de fallos simulados (sin conexión, tiempo de espera, error de servidor), de reintento sin pérdida de fotos y de no duplicación de fotos ya subidas.

### **HU 8: Carga simultánea**

AC 1: [Backend] Diseñar e implementar una arquitectura de microservicios o endpoints concurrentes capaces de procesar múltiples cargas simultáneas por evento y colegio.

AC 2: [Frontend/Mobile] Generar un identificador único (UUID) en el dispositivo al capturar cada foto para garantizar la trazabilidad.

AC 3: [Backend] Validar la unicidad de las imágenes en el servidor para evitar sobreescrituras o mezclas de registros entre distintos embajadores.

AC 4: [DevOps] Configurar el ambiente de pruebas de carga y el escalado de la infraestructura para cargas en paralelo.

AC 5: [QA] Realizar pruebas de estrés y concurrencia simulando múltiples embajadores subiendo formularios en paralelo a un mismo evento y colegio.

### **HU 9: Historial de cargas**

AC 1: [Backend] Crear endpoint para consultar el historial de formularios filtrado por el embajador autenticado, por evento y por colegio, incluyendo los estados de procesamiento (En procesamiento, Verificado, Por revisar, Revisado).

AC 2: [Frontend/Mobile] Desarrollar la vista de “Historial de Cargas” con el listado detallado de hora, evento, colegio y estado actual (Subida, En procesamiento, Verificado, Por revisar, Revisado, Error).

AC 3: [Frontend/Mobile] Implementar filtros interactivos por evento y por colegio dentro de la interfaz del historial.

AC 4: [UX] Diseñar la vista de historial y las etiquetas de cada estado.

AC 5: [QA] Ejecutar pruebas del historial, de los filtros y del aislamiento de datos entre embajadores.

## **Épica #2: Seguridad e inicio de sesión en la app móvil**

### **HU 10: Inicio de sesión en la app móvil con perfil general**

AC 1: [Backend] Servicio de autenticación de perfiles generales activos (validación de perfil y clave).

AC 2: [Backend] Control de sesión única por perfil: registrar dispositivo activo y rechazar ingresos simultáneos del mismo perfil.

AC 3: [Backend] Política de bloqueo temporal por 3 intentos fallidos durante 10 minutos, informando el tiempo restante.

AC 4: [Backend] Definir vigencia del token de sesión y de la sesión offline, y exigencia de conexión en el primer ingreso por dispositivo.

AC 5: [Backend] Registrar el perfil y el dispositivo en cada carga de formularios.

AC 6: [Frontend/Mobile] Implementar login con clave enmascarada y almacenamiento cifrado.

AC 7: [Frontend/Mobile] Protección de rutas, cierre de sesión y persistencia segura del token para modo offline.

AC 8: [UX] Diseñar la pantalla de login y los mensajes de bloqueo, error y “perfil en uso”.

AC 9: [QA] Pruebas de sesiones simultáneas con distintos perfiles, rechazo del mismo perfil en dos dispositivos, bloqueo por intentos y protección de rutas.

### **HU 11: Cierre de sesión automático en la app móvil**

AC 1: [Frontend/Mobile] Implementar un temporizador de inactividad configurable (ej. 15 minutos) que detecte ausencia de toques en pantalla o de actividad en segundo plano.

AC 2: [Frontend/Mobile] Configurar la destrucción del token de sesión activo y la redirección inmediata a la pantalla de login ante inactividad o cierre manual.

AC 3: [Frontend/Mobile] Implementar la validación offline de credenciales (perfil y clave) mediante una huella cifrada almacenada en el dispositivo, mientras no haya vencido la vigencia offline.

AC 4: [Frontend/Mobile] Aislar la cola local de fotos por cada perfil general, impidiendo que otro perfil vea o suba datos ajenos en el mismo dispositivo.

AC 5: [Frontend/Mobile] Agregar el botón explícito de “Cerrar sesión” accesible desde el perfil o menú principal.

AC 6: [Frontend/Mobile] Bloquear el inicio de sesión cuando venció la vigencia offline y no hay conexión, manteniendo las fotos pendientes cifradas.

AC 7: [QA] Ejecutar pruebas de inactividad, cierre de sesión manual, validación offline y aislamiento de la cola por perfil en un mismo dispositivo.

## **Épica #3: Procesamiento del reconocimiento óptico de caracteres (OCR)**

### **HU 12: Identificación de campos**

AC 1: [Backend/AI] Configurar OCR para extracción de texto libre (Nombre, Documento, Celulares, Correo, Acudiente) y opción múltiple (T.I./C.C., Grado, Calendario, Carreras, Tratamiento).

AC 2: [Backend] Asociar las etiquetas extraídas al registro.

AC 3: [Frontend] Desplegar en la web los campos identificados con sus etiquetas y estados inmediatamente después de finalizar el procesamiento OCR.

AC 4: [QA] Ejecutar pruebas unitarias e integradas probando formularios físicos reales con distintos tipos de letra, casillas vacías y marcas múltiples.

### **HU 13: Campos con incertidumbre**

AC 1: [Backend] Implementar regla fija del 100% de certeza, manejo de ambigüedad en opción múltiple, regla de campo en blanco verificado y propagación del estado “Por revisar” al registro.

AC 2: [Backend] Asegurar procesamiento asíncrono no bloqueante.

AC 3: [Frontend/Web] Implementar resaltado en color amarillo para campos “Por revisar” en la plataforma web.

AC 4: [QA] Validar umbrales de certeza, regla de campo en blanco y verificación de no detención del flujo.

### **HU 14: Validación de formato de los datos extraídos**

AC 1: [Backend] Desarrollar reglas de formato para documento (solo dígitos), celular (10 dígitos) y correo (usuario@dominio), asignando motivo de error si falla.

AC 2: [Fullstack] Impedir que un usuario guarde como “Revisado manualmente” un campo con formato erróneo desde la web.

AC 3: [Backend] Unificar celular principal y de acudiente cuando son iguales.

AC 4: [QA] Probar ingresos con formatos erróneos en email/teléfono, mensajes de error esperados, restricciones de guardado en la interfaz y unificación de celulares iguales.

### **HU 15: Almacenamiento selectivo y retención de imágenes**

AC 1: [Backend] Eliminación inmediata de la imagen cuando todos los campos quedan “Verificados”, incluyendo copias y miniaturas.

AC 2: [Backend] Bloqueo de eliminación mientras existan campos “Por revisar”.

AC 3: [Backend] Tarea programada que elimina imágenes de registros “Enviados” al cumplirse el plazo.

AC 4: [Backend] Parámetro de configuración del plazo de retención.

AC 5: [Backend] Registro de cada eliminación en auditoría.

AC 6: [Frontend] Pantalla de configuración del plazo (administrador).

AC 7: [Frontend] Mostrar “imagen no disponible” en el registro cuando ya fue eliminada, indicando el motivo: “Imagen no conservada: todos los campos fueron identificados con certeza del 100%” o plazo de retención vencido.

AC 8: [QA] Probar eliminación inmediata, conservación con campos pendientes, eliminación por plazo, integridad del registro y auditoría.

## **Épica #4: Revisión manual de transcripciones**

### **HU 16: Interfaz de comparación en la plataforma web**

AC 1: [Frontend] Diseñar e implementar el componente web para visualizar el formulario físico frente a los campos extraídos por IA.

AC 2: [Fullstack] Lógica para edición/confirmación de valores, actualización del resaltado visual a verde y cambio del registro a “Revisado”.

AC 3: [Backend] Registrar en bitácora (usuario, valor anterior, valor nuevo).

AC 4: [QA] Probar interacción en pantalla dividida, actualización de colores de amarillo a verde y persistencia en auditoría.

### **HU 17: Prevención de ediciones simultáneas sobre un registro**

AC 1: [Backend] Crear la API para marcar y liberar registros “en revisión”, con temporizador de inactividad configurable para la liberación automática.

AC 2: [Backend] Validar en el servidor que solo quien tiene la marca puede guardar cambios.

AC 3: [Frontend] Mostrar en la web quién tiene abierto el registro, deshabilitar la edición para los demás y liberar la marca al cerrar o guardar.

AC 4: [QA] Simular la apertura en paralelo por varios analistas, la caducidad por inactividad, el intento de guardado sin marca y que la carga de fotos y el OCR no se vean afectados.

### **HU 18: Ver campos pendientes por registro y filtrar por embajador**

AC 1: [Backend] Extender el listado para filtrar por perfil general y calcular el número de campos “Por revisar” de cada registro.

AC 2: [Frontend] Implementar en la consola web el selector de filtro por embajador y los contadores de campos pendientes por registro.

AC 3: [QA] Validar combinaciones de múltiples filtros, precisión de los contadores y tiempo de respuesta con volúmenes altos de datos.

### **HU 19: Comentarios internos en un registro dudoso**

AC 1: [Backend] Diseñar tabla de notas (autor, fecha/hora, contenido) y crear endpoints asegurando aislamiento estricto respecto al módulo de integración con el CRM.

AC 2: [Frontend] Construir la sección de historial de comentarios en el detalle del registro web (restringida y oculta para la app móvil).

AC 3: [QA] Verificar correcta asignación de autor/fecha, invisibilidad en la app móvil y confirmar que las notas no viajan en los lotes al CRM.

### **HU 20: Visualización de la imagen original desde un registro**

AC 1: [Backend] Crear endpoint para recuperar la imagen original o devolver el motivo de no conservación (Verificado 100% o plazo de retención vencido).

AC 2: [Frontend] Habilitar la apertura de la imagen original desde el detalle del registro usando la vista/modal de comparación inicial.

AC 3: [QA] Realizar pruebas unitarias e integradas para validar la visualización y los estados de expiración de imágenes.

## **Épica #5: Organización de registros**

### **HU 21: Detección de duplicados y estado “Por revisar duplicado”**

AC 1: [Backend] Detección de coincidencias por documento o correo entre registros de LexiGrid, incluidos los enviados, sin consultar el CRM y sin usar el celular.

AC 2: [Backend] Asignar “Por revisar duplicado” al registro nuevo usando solo campos resueltos. Definir “nuevo” y “anterior” por fecha de captura.

AC 3: [Backend] Reevaluar duplicados cada vez que se resuelve un campo “Por revisar”.

AC 4: [Database] Estructura para vincular el caso con todos sus registros coincidentes y guardar la causa (documento o correo). Soportar casos con más de dos registros.

AC 5: [Backend] Registrar la detección en auditoría.

AC 6: [QA] Casos borde: duplicados cruzados, celulares compartidos, dos embajadores fotografiando al mismo aspirante antes de resolver campos, duplicados contra enviados.

### **HU 22: Resolver duplicados desde el apartado Duplicados**

AC 1: [Database] Guardar las diferencias campo por campo y la decisión del analista.

AC 2: [Frontend] Apartado “Duplicados” con la lista de casos, la comparación y las tres opciones de resolución, con la sugerencia por defecto.

AC 3: [UX] Diseñar la vista de comparación y la confirmación de la decisión.

AC 4: [Backend] Aplicar la decisión, sacar el caso de “Por revisar duplicado”, enviar a la papelera el registro descartado y dejar “Pendiente de actualización” al enviado si corresponde.

AC 5: [Backend] Registrar la decisión en auditoría.

AC 6: [QA] Resolución con cada opción, casos de más de dos registros, duplicado contra registro enviado y verificación de que nada se descarta sin decisión.

### **HU 23: Clasificación de aspirantes incontactables**

AC 1: [Backend] Programar la regla que evalúa si un registro tiene los tres canales de contacto vacíos y resueltos.

AC 2: [Backend] Implementar la eliminación lógica (soft delete) con fecha de eliminación y motivo.

AC 3: [Backend] Excluir los registros en la Papelera de la fila y los conteos.

AC 4: [Backend] Registrar la acción automática en el historial.

AC 5: [QA] Probar los casos: sin canales, con un canal, con campo “Por revisar” que luego se resuelve vacío y con campo “Por revisar” que se resuelve con dato.

### **HU 24: Papelera de registros descartados**

AC 1: [Backend] Unificar la eliminación lógica con campo de motivo, fecha de eliminación y, en duplicados, referencia al registro coincidente y al campo.

AC 2: [Backend] Implementar la restauración individual con el estado inicial según las reglas del criterio y marca que evita el re-descarte.

AC 3: [Backend] Programar la tarea diaria de purga a los 30 días, incluida la imagen, con registro sin datos personales.

AC 4: [Frontend] Construir la vista “Papelera” con el listado, motivo, días restantes y acción “Restaurar” con confirmación.

AC 5: [QA] Probar restauración por motivo, estados iniciales tras restaurar, no re-descarte y purga a los 29 y 30 días.

### **HU 25: Filtrar y restaurar en lote la Papelera**

AC 1: [Backend] Implementar la restauración múltiple.

AC 2: [Frontend] Agregar a la vista “Papelera” los filtros por motivo y por evento/colegio y la selección múltiple con confirmación.

AC 3: [QA] Probar filtros y restauración múltiple por motivo.

### **HU 26: Recuperación automática de incontactables al corregir su contacto**

AC 1: [Backend] Implementar el listener/trigger que reevalúe el registro tras cualquier edición de datos de contacto hecha desde la web.

AC 2: [Backend] Programar la salida automática de la papelera y la reasignación de estado y prioridad cuando el registro recupera un canal de contacto.

AC 3: [Backend] Garantizar que, si sigue sin canales, el registro conserva su fecha de eliminación original.

AC 4: [Backend] Marcar como “Pendiente de actualización” los registros ya enviados al CRM cuando cambie su contacto.

AC 5: [Backend] Registrar la recuperación automática en el historial.

AC 6: [Frontend] Actualizar dinámicamente la vista tras guardar: el registro desaparece de la papelera y aparece en la fila con su prioridad.

AC 7: [Frontend] Permitir editar los datos de contacto desde la vista “Papelera”.

AC 8: [QA] Validar en la web: recupera un canal, sigue sin canales, plazo vencido, registro ya enviado al CRM y registro con motivo “Duplicado descartado”.

### **HU 27: Priorización de leads**

AC 1: [Backend] Programar el motor de cálculo de prioridad (Alta, Media, Baja) basado en grado, completitud de contacto y carrera definida.

AC 2: [Backend] Aplicar criterios de ordenamiento interno por nivel de prioridad, cantidad de campos diligenciados y fecha de captura.

AC 3: [Backend] Manejar el estado “Pendiente de prioridad” para registros con datos clave “Por revisar”.

AC 4: [Backend/Frontend] Configurar el recálculo dinámico ante ediciones y asegurar consistencia visual del ordenamiento en las listas.

AC 5: [Backend] Mapear la prioridad calculada como un campo de salida en la integración con el CRM.

AC 6: [QA] Realizar pruebas de la matriz de prioridad con combinaciones de grados (incluido grado en blanco), datos de contacto y carreras.

### **HU 28: Conservar registros enviados en un archivo aparte**

AC 1: [Backend] Exponer los registros enviados en un endpoint separado, con los mismos filtros.

AC 2: [Backend] Excluir los enviados de los conteos y listados de trabajo.

AC 3: [Backend] Mantener los enviados en el índice de detección de duplicados.

AC 4: [Frontend] Sección “Enviados” de solo lectura.

AC 5: [UX] Diseñar la separación entre trabajo y archivo.

AC 6: [QA] Probar que no hay borrado por tiempo, separación de vistas, duplicados contra enviados y solo lectura.

## **Épica #6: Eventos e integración directa con el CRM**

### **HU 29: Filtrar aspirantes por evento, colegio y ciudad**

AC 1: [Backend] Endpoints de listado con filtros combinables y paginación.

AC 2: [Backend] Endpoint de valores distintos de evento, colegio y ciudad para poblar filtros.

AC 3: [Frontend] Barra de filtros persistente entre vistas.

AC 4: [UX] Diseñar la barra de filtros y el estado de “sin resultados”.

AC 5: [QA] Probar combinaciones de filtros, tildes/mayúsculas y rendimiento con volumen alto.

### **HU 30: Ver avance de revisión y de envío por evento y colegio**

AC 1: [Backend] Endpoint de conteo agrupado por evento, colegio y estado (de revisión y de envío).

AC 2: [Frontend] Vista de resumen con ordenamiento y acceso directo al filtro.

AC 3: [UX] Diseñar la vista de resumen.

AC 4: [QA] Verificar exactitud de los conteos tras cambios de estado.

### **HU 31: Unificar variantes de nombre de colegio, evento o ciudad**

AC 1: [Backend] Detección de valores similares.

AC 2: [Backend] Endpoint de unificación masiva con registro de auditoría.

AC 3: [Frontend/UX] Pantalla de revisión y unificación.

AC 4: [QA] Probar unificación y trazabilidad.

### **HU 32: Configuración de la conexión con el CRM**

AC 1: [Backend] Implementar el almacenamiento cifrado de credenciales y datos de conexión por ambiente (Sandbox/Prod).

AC 2: [Backend] Crear el servicio “Probar conexión” para verificar la autenticación con el CRM y retornar el diagnóstico.

AC 3: [Backend/Frontend] Deshabilitar envíos si no hay conexión válida y registrar cualquier cambio de configuración en auditoría.

AC 4: [Frontend] Diseñar la vista de administración de la integración para configurar credenciales, ambiente y probar la conexión.

AC 5: [QA] Validar el cifrado de datos, el manejo de errores de autenticación y los bloqueos de seguridad.

### **HU 33: Mapeo de campos hacia el CRM**

AC 1: [Backend/Database] Crear la estructura de datos para definir y almacenar la correspondencia de campos entre LexiGrid y el CRM (datos personales, contacto, carrera, prioridad, evento, colegio y ciudad).

AC 2: [Backend] Implementar la lógica de equivalencias para campos de opción múltiple entre los valores de LexiGrid y los aceptados por el CRM.

AC 3: [Backend] Programar el manejo de campos requeridos vacíos (envío en blanco o valor por defecto configurable).

AC 4: [Backend] Aplicar filtros de seguridad para garantizar que notas internas, imágenes y logs de auditoría queden excluidos del mapeo y nunca se envíen.

AC 5: [Backend] Implementar el servicio de validación del mapeo contra la API del CRM con alertas de inconsistencia o campos inexistentes.

AC 6: [Frontend] Diseñar la interfaz de administración para crear, editar y visualizar las reglas de mapeo de campos y equivalencias.

AC 7: [Backend] Conectar las modificaciones de mapeo con el historial de auditoría y asegurar que solo apliquen a envíos futuros.

AC 8: [QA] Realizar pruebas integradas del motor de mapeo con datos completos, nulos, opciones múltiples y campos por defecto.

### **HU 34: Preparar el lote por evento y colegio y ver su resumen**

AC 1: [Backend] Servicio que arma el lote por evento y colegio aplicando el mapeo y las exclusiones definidas.

AC 2: [Backend] Servicio de resumen con conteos por categoría (listos, por revisar, sin autorización, ya enviados).

AC 3: [Frontend] Pantalla de preparación del lote: selección de evento y colegio, resumen y botón de envío.

AC 4: [UX] Diseñar la pantalla de preparación y el resumen previo al envío.

AC 5: [QA] Probar exclusiones, conteos del resumen y mapeo.

### **HU 35: Advertencia de pendientes antes de enviar el lote**

AC 1: [Backend] Servicio que cuente y liste los registros “Por revisar” de la combinación seleccionada.

AC 2: [Backend] Registro en auditoría del envío confirmado con pendientes.

AC 3: [Frontend] Advertencia con conteo, acceso directo a la lista filtrada y confirmación explícita.

AC 4: [Frontend] Recalcular el resumen al regresar de la revisión.

AC 5: [UX] Diseñar el flujo de advertencia y regreso desde la revisión.

AC 6: [QA] Probar señalización, navegación con filtro, recálculo, confirmación y auditoría.

### **HU 36: Envío directo al CRM**

AC 1: [Backend] Implementar el cliente de integración HTTPS cifrado para transmitir los lotes de datos directamente a la API del CRM sin generación de archivos.

AC 2: [Backend] Aplicar el procesamiento registro por registro de forma individual para asegurar que un fallo no cancele la transacción de los demás.

AC 3: [Backend] Implementar la lógica de empaquetado multi-evento opcional cuando el analista seleccione explícitamente más de un evento.

AC 4: [Backend] Control de idempotencia: marcar los registros enviados y evitar reenvíos (movido desde la HU 34).

AC 5: [Backend] Conectar el resultado del envío con el log de auditoría guardando el resumen de la transacción.

AC 6: [Frontend] Diseñar la pantalla/modal de confirmación final con las métricas de registros enviados con éxito y registros con error.

AC 7: [QA] Probar envíos masivos directos cifrados, control de errores individuales y registro de auditoría.

### **HU 37: Estado de envío de cada registro**

AC 1: [Database/Backend] Extender el modelo de datos para registrar el estado de envío (Pendiente de envío, Enviado, Error de envío, Pendiente de actualización), fecha/hora, ID externo del CRM y mensaje de error.

AC 2: [Backend] Exponer los servicios de consulta con soporte para filtros combinados por estado de envío, evento y colegio.

AC 3: [Frontend] Actualizar la vista de registros para mostrar badges de estado, detalles de confirmación del CRM y causa detallada en caso de error.

AC 4: [QA] Probar la persistencia y precisión de los estados de envío tras simulaciones de éxito y error.

### **HU 38: Reintento de envíos fallidos**

AC 1: [Backend] Crear el servicio de reintento de envío que procese únicamente registros en estado “Error de envío” (individual o por evento completo) usando el identificador único como ID externo.

AC 2: [Backend] Programar la persistencia en estado “Pendiente de envío” ante caídas de red o indisponibilidad del CRM para evitar pérdida de datos.

AC 3: [Frontend] Agregar botones de acción para “Reintentar envío” de forma individual y masiva desde las vistas de detalle y resumen de evento.

AC 4: [QA] Validar que los reintentos no generen registros duplicados en el CRM mediante el ID externo.

### **HU 39: Actualización en el CRM de registros ya enviados**

AC 1: [Backend] Crear un disparador que cambie el estado de envío a “Pendiente de actualización” cuando un registro “Enviado” sea modificado por la resolución de duplicados o la edición de contacto.

AC 2: [Backend] Implementar la lógica de envío de actualización (PATCH/PUT) al CRM utilizando el ID externo sin duplicar el registro.

AC 3: [Frontend] Permitir la ejecución manual del envío de actualizaciones de forma individual o por lote de evento.

AC 4: [QA] Verificar que la edición de un registro ya enviado active el flujo de actualización correctamente en el CRM.

### **HU 40: Alerta de falla en la integración con el CRM**

AC 1: [Backend] Programar el servicio de detección de fallos críticos de integración (fallo completo de lote, conexión no válida o credenciales vencidas).

AC 2: [Backend] Implementar el sistema de notificaciones/alertas en tiempo real dirigidas a analistas y administradores según la causa del error.

AC 3: [Frontend] Diseñar el banner/modal de alerta persistente con el detalle de la falla y un botón de acceso directo a la acción de reintento.

AC 4: [QA] Simular caídas de token y fallas de red para probar la activación y resolución de las alertas.

## **Épica #7: Administración y supervisión**

### **HU 41: Gestión de usuarios, roles y perfiles generales**

AC 1: [Backend] Crear los servicios CRUD para administración de usuarios y perfiles generales validando la unicidad del correo institucional y del nombre de perfil.

AC 2: [Backend] Implementar las políticas de contraseñas iniciales y la lógica de inhabilitación de cuenta con revocación de tokens/sesiones activas.

AC 3: [Backend] Programar la función administrativa para corregir la clave de perfiles generales y desbloquear cuentas o perfiles por intentos fallidos antes de los 10 minutos.

AC 4: [Backend] Implementar la liberación administrativa de un perfil general con sesión activa en otro dispositivo.

AC 5: [Backend] Crear el esquema fijo de control de acceso por rol (Operativo, Analítico, Administrativo) e implementar middlewares de autorización en los endpoints.

AC 6: [Frontend] Diseñar el panel de gestión de usuarios con tabla de estado (activo/inactivo), rol asignado, edición y acciones de desbloqueo y liberación.

AC 7: [QA] Validar la unicidad de datos, bloqueo/desbloqueo, liberación de perfiles, inhabilitación con cierre de sesión y aislamiento de funciones entre roles en la API y en las interfaces web y móvil.

### **HU 42: Revocación de sesión y borrado remoto de datos del dispositivo**

AC 1: [Backend] Crear endpoint para solicitar la revocación de sesión y la orden de borrado de la base de datos local cifrada del dispositivo.

AC 2: [Backend] Integrar el registro de auditoría para almacenar las acciones de revocación y borrado remoto.

AC 3: [Frontend] Diseñar la vista de confirmación con advertencia explícita sobre la pérdida de fotos pendientes antes de ejecutar el borrado remoto.

AC 4: [Mobile App] Implementar en la app móvil la escucha de la orden de borrado local y la eliminación inmediata del token y la cola cifrada.

AC 5: [QA] Simular pérdida de dispositivo para validar la inactivación de token y la purga de datos locales cifrados al conectar.

### **HU 43: Métricas de tiempo de digitación y errores**

AC 1: [Backend/Database] Crear la estructura para registrar el valor de referencia del tiempo de digitación manual en Excel.

AC 2: [Backend] Implementar el motor de cálculo de métricas: tiempo promedio de revisión, % de campos “Por revisar” frente al total IA, y % de campos corregidos vs confirmados.

AC 3: [Backend] Exponer servicio de métricas con filtros por rango de fechas y evento.

AC 4: [Frontend] Diseñar el dashboard de métricas con gráficos comparativos e indicadores clave de rendimiento (KPIs).

AC 5: [QA] Validar la precisión de las fórmulas de agregación de métricas y el funcionamiento de los filtros.

## **Épica #8: Seguridad e inicio de sesión en la plataforma web**

### **HU 44: Inicio de sesión seguro en la plataforma web**

AC 1: [Backend] Implementar servicio de autenticación para plataforma web mediante correo institucional y contraseña cifrada.

AC 2: [Backend] Programar el mecanismo de bloqueo temporal de cuenta por 10 minutos tras 3 intentos fallidos consecutivos.

AC 3: [Backend] Validar el cumplimiento de políticas de seguridad en la estructura de contraseñas (longitud y complejidad).

AC 4: [Backend/Frontend] Configurar restricciones para evitar el inicio de sesión de usuarios con rol Operativo en la plataforma web.

AC 5: [Frontend] Diseñar el formulario de login y la lógica de redirección obligatoria para rutas protegidas sin sesión activa.

AC 6: [QA] Validar bloqueos temporales por intentos fallidos, restricciones de rol y seguridad en credenciales.

### **HU 45: Recuperación de contraseña**

AC 1: [Backend] Crear el servicio para solicitar la recuperación de contraseña generando un token/código de un solo uso con tiempo de expiración.

AC 2: [Backend/Services] Configurar el servicio de envío de correos electrónicos transaccionales para entregar el enlace de restablecimiento al correo institucional.

AC 3: [Backend] Implementar el endpoint para definir la nueva contraseña validando los requisitos mínimos de seguridad y la vigencia del token.

AC 4: [Frontend] Diseñar las pantallas de solicitud de recuperación y de creación de nueva contraseña.

AC 5: [QA] Probar el flujo completo de recuperación, expiración de tokens y restricción para el rol Operativo.

### **HU 46: Cierre de sesión automático en la plataforma web**

AC 1: [Frontend] Implementar el detector de inactividad del usuario basado en eventos de ratón/teclado con un temporizador límite configurable.

AC 2: [Frontend] Programar la destrucción del token/sesión local y la redirección automática al login tras cumplirse el tiempo de inactividad.

AC 3: [Frontend] Incluir el botón explícito “Cerrar sesión” en la barra de perfil accesible desde cualquier pantalla.

AC 4: [QA] Validar el comportamiento del temporizador de inactividad y la invalidez de la sesión tras el cierre automático.

## **Épica #9: Trazabilidad y auditoría**

### **HU 47: Historial de cambios por usuario**

AC 1: [Database/Backend] Diseñar el modelo de datos inmutable de auditoría para registrar ID de usuario, timestamp, tipo de acción y registro afectado.

AC 2: [Backend] Interceptar y registrar todos los eventos enumerados en los criterios de aceptación de esta HU.

AC 3: [Backend] Configurar permisos de consulta: rol Administrativo (historial completo), rol Analítico (solo sus acciones) y rol Operativo (sin acceso).

AC 4: [Frontend] Diseñar la vista de tabla de auditoría con filtros avanzados por usuario, tipo de acción y rango de fechas.

AC 5: [QA] Probar la inmutabilidad de los registros de auditoría y la correcta aplicación de los filtros y permisos por rol.

**Exel de las actividades para importar al Kollabe**

[https://docs.google.com/spreadsheets/d/1KL2eUwqAYhNqTRMW-sAQNhqsxyZEo9jOFfZSeOxTPbE/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1KL2eUwqAYhNqTRMW-sAQNhqsxyZEo9jOFfZSeOxTPbE/edit?usp=sharing)

**Kollabe**

[https://kollabe.com/room?roomKey=7436e648543a42c28ed64ceb35c29d32](https://kollabe.com/room?roomKey=7436e648543a42c28ed64ceb35c29d32)

**Excel con planning poker exportado**

[https://docs.google.com/spreadsheets/d/1yZtlcy20R1-ZheS_5k78ZyZqZyWwKiGkUS8qq2SQdOI/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1yZtlcy20R1-ZheS_5k78ZyZqZyWwKiGkUS8qq2SQdOI/edit?usp=sharing)

**Excel con planning poker organizado**

[https://docs.google.com/spreadsheets/d/1N5fI3mFEnL-StLq16aFEX2XtjIW5PspW/edit?usp=sharing&ouid=103293696764452596241&rtpof=true&sd=true](https://docs.google.com/spreadsheets/d/1N5fI3mFEnL-StLq16aFEX2XtjIW5PspW/edit?usp=sharing&ouid=103293696764452596241&rtpof=true&sd=true)
