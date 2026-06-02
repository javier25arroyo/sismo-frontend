# Panel lateral de magnitud en la pantalla de sismos

## Objetivo

Mover el banner oscuro de magnitud y datos sísmicos desde la parte inferior del mapa hacia el costado derecho del mapa en escritorio. Eliminar las tarjetas laterales actuales porque el banner contiene la información necesaria.

## Alcance

- Modificar únicamente la composición visual de la pantalla de sismos.
- Mantener sin cambios la carga de datos, las acciones de compartir y PDF, y el componente Leaflet.
- Eliminar las tarjetas de estado de ubicación y hora/coordenadas.
- Reutilizar el banner oscuro existente como panel lateral.

## Diseño responsive

- En escritorio, desde el breakpoint `lg`, mostrar dos columnas: mapa flexible y panel oscuro lateral de `320px`.
- En tablet y móvil, mostrar una sola columna: mapa primero y panel oscuro debajo.
- Mantener la altura responsive existente del mapa.
- Adaptar el contenido del banner a una composición vertical en escritorio y compacta en pantallas estrechas.

## Estructura visual

La sección principal contendrá:

1. La tarjeta del mapa con su encabezado actual y el componente `app-sismo-map`.
2. El panel oscuro de magnitud momento con magnitud, latitud, longitud, profundidad y hora local.

El panel oscuro conservará su jerarquía visual, colores según magnitud y fondo decorativo. Sus datos se mostrarán en una cuadrícula de dos columnas para evitar una columna lateral excesivamente alta.

## Verificación

- Comprobar que la compilación de Angular finaliza correctamente.
- Verificar en la plantilla que no permanecen las tarjetas laterales eliminadas.
- Comprobar que el panel se ubica a la derecha en `lg` y debajo del mapa antes de `lg`.
