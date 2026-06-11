import { Pipe, PipeTransform } from '@angular/core';
import { teamFifaRank } from '../../../domain/data/teams';
import { TeamId } from '../../../domain/models';

/** Identifiant d'équipe → classement FIFA (lecture pure depuis le domaine). */
@Pipe({ name: 'fifaRank' })
export class FifaRankPipe implements PipeTransform {
  transform(id: TeamId | null | undefined): number | null {
    return teamFifaRank(id);
  }
}
