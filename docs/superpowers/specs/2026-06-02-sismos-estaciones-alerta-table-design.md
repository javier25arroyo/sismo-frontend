# Tabla de estaciones y alerta sísmica en la pantalla de sismos

## Objetivo

Agregar debajo del mapa de la pantalla de sismos una tabla con el resumen acelerográfico por estación del último evento.

## Datos

La tabla usará `SismoService.getUltimosSismos()`, que consume `/api/sismos/ultimo/resumen`. Ese resumen contiene nombre de estación, código de estación, aceleración, desplazamiento y distancia hipocentral.

Para la columna `Alerta Sísmica`, la pantalla cargará `ValorAlertaService.getAlertas()` desde `/api/alertas`. La alerta se calculará por estación comparando `vaAceleracion` con los campos `nivel0`, `nivel1`, `nivel2` y `nivel3`. Se mostrará el nivel más alto alcanzado. Si falta aceleración o no hay valores de alerta para la estación, se mostrará `Sin alerta`.

## Columnas

- Nombre
- Código Estación
- Aceleración (cm/ss)
- Desplazamiento (cm)
- Distancia Hipocentral (km)
- Alerta Sísmica

## Diseño

La tabla se colocará después de la sección principal de mapa y panel de magnitud. Usará tabla HTML semántica con `caption`, encabezados `th scope="col"` y un contenedor con `overflow-x-auto` para pantallas estrechas.

## Verificación

- Agregar prueba de regresión de plantilla para la estructura y columnas.
- Agregar prueba de lógica para el cálculo de alerta sísmica.
- Ejecutar prueba focalizada, suite completa, lint y build.
