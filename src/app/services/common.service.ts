import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { storedCurrMatch, storedTeamsArr } from '../constants/global';
import { ExtraRunType, OutStatus, CurrentMatch } from '../models/match.model';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  activeMatch = new BehaviorSubject<CurrentMatch>(storedCurrMatch);
  allTeamSquad = new BehaviorSubject<Team[]>(storedTeamsArr);
  closeUnwantedDialog = new BehaviorSubject<boolean>(false);

  constructor(private _snackBar: MatSnackBar) {}

  ballsToOvers(totalBalls: number) {
    if (totalBalls % 6 == 0) return totalBalls / 6;
    else {
      let num = Math.floor(totalBalls / 6);
      return (totalBalls % 6) / 10 + num;
    }
  }

  ballsToWhichOver(totalBalls: number) {
    return Math.floor(totalBalls / 6);
  }

  batsmanStrikeRate(runsScored: number, ballsFaced: number) {
    return ((runsScored / ballsFaced) * 100).toFixed(2);
  }

  openEndMatchSnackbar(message = 'Match is Over!') {
    this._snackBar.open(message, '', {
      duration: 30000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: 'snackbar-failure',
    });
  }

  openSuccessSnackbar(message = 'Success!') {
    this._snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: 'snackbar-success',
    });
  }

  openFailureSnackbar(message = 'Something went wrong!') {
    this._snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: 'snackbar-failure',
    });
  }
}
