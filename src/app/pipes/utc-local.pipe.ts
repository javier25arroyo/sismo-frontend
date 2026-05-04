import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

export function normalizeUtcString(value: string): string {
  return /[Zz]$|[+-]\d{2}:?\d{2}$/.test(value.trim()) ? value : value + 'Z';
}

export function parseUtcDate(value: string): Date {
  return new Date(normalizeUtcString(value));
}

@Pipe({ name: 'utcLocal', standalone: true })
export class UtcLocalPipe implements PipeTransform {
  private datePipe = new DatePipe('es');

  transform(value: string | Date | null | undefined, format = 'dd MMM yyyy · HH:mm'): string | null {
    if (!value) return null;
    const date = typeof value === 'string' ? parseUtcDate(value) : value;
    return this.datePipe.transform(date, format);
  }
}
