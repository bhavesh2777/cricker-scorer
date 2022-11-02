import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DialogType } from 'src/app/models/common-dialog.model';
import {
  BattingElements,
  BowlingElements,
  OutStatus,
  TempMatch,
} from 'src/app/models/match.model';
import { Player } from 'src/app/models/player.model';
import { Team } from 'src/app/models/team.model';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-mat-dialog',
  templateUrl: './mat-dialog.component.html',
  styleUrls: ['./mat-dialog.component.css'],
})
export class MatDialogComponent implements OnInit, OnDestroy {
  enteredPlayerName = '';
  enteredTeamName = '';
  chooseNewBowler = null;
  replacedBatsman = '';
  playerFile: File | null = null;
  teamFile: File | null = null;
  activeMatchSub: Subscription;
  allTeamSquadSub: Subscription;
  activeMatch: TempMatch;

  openingPlayerForm: FormGroup;
  allTeamsSquads: { battingSquad: Player[]; bowlingSquad: Player[] };

  constructor(
    private readonly commonService: CommonService,
    public dialogRef: MatDialogRef<MatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogType
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    if (
      this.data.dType == 'choose-opening-players' ||
      this.data.dType == 'next-bowler'
    ) {
      this.activeMatchSub = this.commonService.activeMatch.subscribe((item) => {
        this.activeMatch = item;
        const tempAllSquad = this.commonService.allTeamSquad.value;
        this.allTeamsSquads = this.getCurrentSquads(
          tempAllSquad,
          this.activeMatch
        );
      });

      this.openingPlayerForm = new FormGroup({
        strikeBatsman: new FormControl(null, {
          validators: [Validators.required],
        }),
        nonStrikeBatsman: new FormControl(null, {
          validators: [Validators.required],
        }),
        bowler: new FormControl(null, {
          validators: [Validators.required],
        }),
      });
    }
  }

  getCurrentSquads(allSquads: Team[], activeMatch: TempMatch) {
    let battingSquad: Player[] = [];
    let bowlingSquad: Player[] = [];

    allSquads.forEach((item) => {
      if (activeMatch.hostTeamId == item.teamId) {
        if (activeMatch.currentInnings.teamId == activeMatch.hostTeamId)
          battingSquad = item.teamSquad;
        else bowlingSquad = item.teamSquad;
      }
      if (activeMatch.visitorTeamId == item.teamId) {
        if (activeMatch.currentInnings.teamId == activeMatch.visitorTeamId)
          battingSquad = item.teamSquad;
        else bowlingSquad = item.teamSquad;
      }
    });
    return { battingSquad, bowlingSquad };
  }

  saveOpeningPlayers() {
    if (this.openingPlayerForm?.valid && this.allTeamsSquads) {
      const strikeBatsmanId =
        this.openingPlayerForm.controls['strikeBatsman'].value;
      const nonStrikeBatsmanId =
        this.openingPlayerForm.controls['nonStrikeBatsman'].value;
      const bowlerId = this.openingPlayerForm.controls['bowler'].value;
      if (strikeBatsmanId == nonStrikeBatsmanId) {
        this.commonService.openFailureSnackbar(
          'Select unique non-strike batsman!'
        );
        return null;
      }
      const tempActiveMatch = { ...this.activeMatch };
      const strikeBatsman = this.allTeamsSquads.battingSquad.find(
        (item) => item.playerId === strikeBatsmanId
      );
      const nonStrikeBatsman = this.allTeamsSquads.battingSquad.find(
        (item) => item.playerId === nonStrikeBatsmanId
      );
      const bowler = this.allTeamsSquads.bowlingSquad.find(
        (item) => item.playerId === bowlerId
      );

      const strikeBatsmanObj: BattingElements = {
        playerName: strikeBatsman.playerName,
        playerId: strikeBatsman.playerId,
        ballsPlayed: 0,
        isOnStrike: true,
        runsScored: 0,
        outStatus: OutStatus.NOT_OUT,
        fours: 0,
        sixes: 0,
        strikeRate: '0',
      };
      const nonStrikeBatsmanObj: BattingElements = {
        playerName: nonStrikeBatsman.playerName,
        playerId: nonStrikeBatsman.playerId,
        ballsPlayed: 0,
        isOnStrike: false,
        runsScored: 0,
        outStatus: OutStatus.NOT_OUT,
        fours: 0,
        sixes: 0,
        strikeRate: '0',
      };
      const bowlerObj: BowlingElements = {
        playerName: bowler.playerName,
        playerId: bowler.playerId,
        overs: 0.0,
        isBowlingCurr: true,
        ballsThrowed: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        economyRate: '0.0',
      };
      tempActiveMatch.currentInnings.batsman = [
        strikeBatsmanObj,
        nonStrikeBatsmanObj,
      ];
      tempActiveMatch.currentInnings.bowler = [bowlerObj];
      this.commonService.activeMatch.next(tempActiveMatch);
      this.commonService.openSuccessSnackbar('Successfully selected!');
      this.dialogRef.close();
    } else this.commonService.openFailureSnackbar('All fields are required!');
  }

  saveNextBowler() {
    if (!this.allTeamsSquads) {
      this.commonService.openFailureSnackbar();
      return null;
    }
    if (this.chooseNewBowler) {
      const tempActiveMatch = { ...this.activeMatch };
      const score = tempActiveMatch.currentInnings.score;
      const thisOver = tempActiveMatch.currentInnings.thisOver;

      // Check last over bowler
      const lastBowler = tempActiveMatch.currentInnings.bowler.find(
        (item) => item.isBowlingCurr === true
      );
      if (lastBowler.playerId === this.chooseNewBowler) {
        this.commonService.openFailureSnackbar(
          'Please select different bowler from last over!'
        );
        return null;
      }
      lastBowler.isBowlingCurr = false;

      // Process new selected bowler
      const bowler = this.allTeamsSquads.bowlingSquad.find(
        (item) => item.playerId === this.chooseNewBowler
      );
      const selectedBowlerThisMatch =
        tempActiveMatch.currentInnings.bowler.find(
          (item) => item.playerId === this.chooseNewBowler
        );
      if (selectedBowlerThisMatch) selectedBowlerThisMatch.isBowlingCurr = true;
      else {
        const bowlerObj: any = {
          playerName: bowler.playerName,
          playerId: bowler.playerId,
          isBowlingCurr: true,
          overs: 0.0,
          ballsThrowed: 0,
          maidens: 0,
          runsConceded: 0,
          wickets: 0,
          economyRate: '0.0',
        };
        tempActiveMatch.currentInnings.bowler.unshift(bowlerObj);
      }

      // Create new empty over
      const thisOverNo = this.commonService.ballsToWhichOver(score.totalBalls);
      const newOver = {
        overNo: thisOverNo,
        runsConceded: 0,
        allBalls: [],
      };
      thisOver.push(newOver);

      // Push new changes
      this.commonService.activeMatch.next(tempActiveMatch);
      this.commonService.openSuccessSnackbar('Successfully selected!');
      this.dialogRef.close();
    } else this.commonService.openFailureSnackbar('Please select a bowler!');
  }

  uploadPlayerImg(files: FileList) {
    this.playerFile = files?.item(0);
  }

  uploadTeamImg(files: FileList) {
    this.teamFile = files?.item(0);
  }

  ngOnDestroy() {
    this.activeMatchSub?.unsubscribe();
    this.allTeamSquadSub?.unsubscribe();
  }
}
