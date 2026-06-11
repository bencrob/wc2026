import { Pipe, PipeTransform } from '@angular/core';
import { teamName } from '../../../domain/data/teams';
import { TeamId } from '../../../domain/models';

/** Identifiant d'équipe → nom (lecture pure depuis le domaine). */
@Pipe({ name: 'teamName' })
export class TeamNamePipe implements PipeTransform {
  transform(id: TeamId | null | undefined): string | null {
    return teamName(id);
  }
}
