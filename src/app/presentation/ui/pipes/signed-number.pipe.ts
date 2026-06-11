import { Pipe, PipeTransform } from '@angular/core';

/** Formate un entier signé : `+3`, `-1`, `0`. */
@Pipe({ name: 'signedNumber' })
export class SignedNumberPipe implements PipeTransform {
  transform(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }
}
