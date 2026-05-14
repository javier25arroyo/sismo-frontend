export type ConsecutivoSismo = 1 | 2 | 3 | 4;

export interface CriterioSismo {
  consecutivo: ConsecutivoSismo;
  magnitudMin: number;
  distanciaHipocentralMax: number;
}

export const CRITERIOS_SISMO: readonly CriterioSismo[] = [
  { consecutivo: 1, magnitudMin: 3.5, distanciaHipocentralMax: 20 },
  { consecutivo: 2, magnitudMin: 4.0, distanciaHipocentralMax: 70 },
  { consecutivo: 3, magnitudMin: 5.0, distanciaHipocentralMax: 400 },
  { consecutivo: 4, magnitudMin: 6.0, distanciaHipocentralMax: 600 }
] as const;

const CRITERIOS_SISMO_DESC = [...CRITERIOS_SISMO].sort(
  (a, b) => b.consecutivo - a.consecutivo
);

function esNumeroFinito(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor);
}

export function categorizarSismo(
  magnitud: number | null | undefined,
  distanciaHipocentral: number | null | undefined
): CriterioSismo | null {
  if (!esNumeroFinito(magnitud) || !esNumeroFinito(distanciaHipocentral)) {
    return null;
  }

  return CRITERIOS_SISMO_DESC.find(
    (criterio) =>
      magnitud >= criterio.magnitudMin &&
      distanciaHipocentral <= criterio.distanciaHipocentralMax
  ) ?? null;
}
