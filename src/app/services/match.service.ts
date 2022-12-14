import { Injectable } from '@angular/core';
import {
  BattingElements,
  ExtraRunType,
  OneBallElement,
  OutStatus,
  ScoreRunDetails,
  CurrentMatch,
  OneInning,
  OneOver,
} from '../models/match.model';
import { CommonService } from './common.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  lastBallObj = new BehaviorSubject<ScoreRunDetails>(null);

  constructor(private readonly commonService: CommonService) {}

  scoreOneBall(scoreRunObj: ScoreRunDetails) {
    // Make all the changes on object
    const tempActiveMatch: CurrentMatch = JSON.parse(
      JSON.stringify(this.commonService.activeMatch.value)
    );
    const tempCurrentInning = tempActiveMatch.currentInnings[0];

    const score = tempCurrentInning.score;
    const thisOver = tempCurrentInning.thisOver;
    const tempTotalBalls = score.totalBalls;
    // Update general score object
    const isValidBall = !scoreRunObj.noBall && !scoreRunObj.wideType;
    if (isValidBall) score.totalBalls++;
    else {
      if (scoreRunObj.noBall) score.extraRuns.noBall++;
      else if (scoreRunObj.wideType) score.extraRuns.wide++;

      // Implement settings value
      score.totalRuns += 1;
    }
    if (scoreRunObj.wicket) score.totalWickets++;
    score.totalRuns += scoreRunObj.runScored;

    const totalOvers = this.commonService.ballsToOvers(score.totalBalls);
    const runRate = (score.totalRuns / totalOvers).toFixed(2);
    score.currRunrate = runRate;

    // Update this over
    const currentBall = new OneBallElement(
      1,
      scoreRunObj.runScored,
      scoreRunObj.wicket,
      isValidBall,
      !isValidBall ? 1 : 0,
      !isValidBall
        ? scoreRunObj.noBall
          ? ExtraRunType.NoBall
          : ExtraRunType.Wide
        : null
    );
    const thisOverNo = this.commonService.ballsToWhichOver(tempTotalBalls);
    const currOverIndex = thisOver.findIndex((el) => el.overNo === thisOverNo);
    if (currOverIndex !== -1) {
      const currOverObj = thisOver[currOverIndex];
      currOverObj.runsConceded += scoreRunObj.runScored;
      currOverObj.allBalls.push(currentBall);
    } else {
      const newOver = {
        overNo: thisOverNo,
        runsConceded: scoreRunObj.runScored,
        allBalls: [currentBall],
      };
      thisOver.push(newOver);
    }

    // Update Batsman
    this.updateScoreBatsman(tempCurrentInning, scoreRunObj, isValidBall);

    // Update Bowler
    this.updateScoreBowler(
      tempCurrentInning,
      scoreRunObj,
      isValidBall,
      currOverIndex
    );

    // Push the changes on subject
    this.commonService.activeMatch.next(tempActiveMatch);

    // Update & push player stats subject

    return true;
  }

  addNewInnings(tempActiveMatch: CurrentMatch) {
    const currentInningTeamId = tempActiveMatch.currentInnings[0].teamId;
    const newInningTeam = {
      id: tempActiveMatch.hostTeamId,
      name: tempActiveMatch.hostTeam,
    };
    if (currentInningTeamId === tempActiveMatch.hostTeamId) {
      newInningTeam.id = tempActiveMatch.visitorTeamId;
      newInningTeam.name = tempActiveMatch.visitorTeam;
    }
    const newInningsObj: OneInning = {
      teamId: newInningTeam.id,
      teamName: newInningTeam.name,
      inningNo: 2,
      score: {
        totalRuns: 0,
        totalWickets: 0,
        totalBalls: 0,
        currRunrate: (0.0).toFixed(2),
        extraRuns: { wide: 0, noBall: 0 },
      },
      thisOver: [],
      batsman: [],
      bowler: [],
    };
    tempActiveMatch.currentInnings.unshift(newInningsObj);
    this.commonService.activeMatch.next(tempActiveMatch);
  }

  undoOneBall(undoRunObj: ScoreRunDetails) {
    // Make all the changes on object
    const tempActiveMatch: CurrentMatch = JSON.parse(
      JSON.stringify(this.commonService.activeMatch.value)
    );
    const tempCurrentInning = tempActiveMatch.currentInnings[0];
    const score = tempCurrentInning.score;
    const thisOver = tempCurrentInning.thisOver;

    // Update general score object
    const isValidBall = !undoRunObj.noBall && !undoRunObj.wideType;
    if (isValidBall) score.totalBalls--;
    else {
      if (undoRunObj.noBall) score.extraRuns.noBall--;
      else if (undoRunObj.wideType) score.extraRuns.wide--;

      // Implement settings value
      score.totalRuns -= 1;
    }
    if (undoRunObj.wicket) score.totalWickets--;
    score.totalRuns -= undoRunObj.runScored;

    const totalOvers = this.commonService.ballsToOvers(score.totalBalls);
    const runRate = (score.totalRuns / totalOvers).toFixed(2);
    score.currRunrate = runRate;

    // Update this over
    let lastActiveOver = thisOver[0];
    let isNewEmptyOver = false;
    if (lastActiveOver.allBalls.length !== 0) {
      this.removeBall(lastActiveOver, undoRunObj);
    } else {
      isNewEmptyOver = true;
      thisOver.shift();
      lastActiveOver = thisOver[0];
      this.removeBall(lastActiveOver, undoRunObj);
    }

    // Update Batsman
    this.updateUndoBatsman(
      tempCurrentInning,
      undoRunObj,
      isValidBall,
      isNewEmptyOver
    );

    // Update Bowler
    this.updateUndoBowler(
      tempCurrentInning,
      undoRunObj,
      isValidBall,
      isNewEmptyOver
    );

    // Push the changes on subject
    this.commonService.activeMatch.next(tempActiveMatch);

    // Update & push player stats subject

    return true;
  }

  private removeBall(lastActiveOver, undoRunObj) {
    lastActiveOver.allBalls.pop();
    lastActiveOver.runsConceded -= undoRunObj.runScored;
  }

  // Update batsman
  private updateScoreBatsman(
    tempCurrentInning: OneInning,
    scoreRunObj: ScoreRunDetails,
    isValidBall: boolean
  ) {
    const batsman = tempCurrentInning.batsman;
    const onStrikeBatsman = batsman.find(
      (el) => el.isOnStrike === true && el.outStatus === OutStatus.NOT_OUT
    );
    if (onStrikeBatsman) {
      onStrikeBatsman.runsScored += scoreRunObj.runScored;
      if (isValidBall) onStrikeBatsman.ballsPlayed++;
      if (scoreRunObj.runScored == 4) onStrikeBatsman.fours++;
      else if (scoreRunObj.runScored == 6) onStrikeBatsman.sixes++;
      if (scoreRunObj.wicket == true) {
        onStrikeBatsman.isOnStrike = false;
        onStrikeBatsman.outStatus = OutStatus.OUT;
      }
      onStrikeBatsman.strikeRate = this.commonService.batsmanStrikeRate(
        onStrikeBatsman.runsScored,
        onStrikeBatsman.ballsPlayed
      );
    }
    if (scoreRunObj.runScored == 1 || scoreRunObj.runScored == 3)
      this.rotateStrike(batsman);
  }

  private updateUndoBatsman(
    tempCurrentInning: OneInning,
    undoRunObj: ScoreRunDetails,
    isValidBall: boolean,
    isNewEmptyOver: boolean
  ) {
    const batsman = tempCurrentInning.batsman;

    // Rotate strike as previous
    if (isNewEmptyOver) this.rotateStrike(batsman);
    if (undoRunObj.runScored == 1 || undoRunObj.runScored == 3)
      this.rotateStrike(batsman);

    const newBatsmanIdx = batsman.findIndex(
      (el) => el.ballsPlayed === 0 && el.isOnStrike === true
    );
    if (newBatsmanIdx !== -1) batsman.splice(newBatsmanIdx, 1);
    batsman.sort((a, b) => b.outStatus.length - a.outStatus.length);

    const oldBatsmanIdx = batsman.findIndex(
      (el, i) => el.outStatus == OutStatus.OUT
    );
    const onStrikeBatsman = batsman[oldBatsmanIdx];
    if (onStrikeBatsman) {
      onStrikeBatsman.runsScored -= undoRunObj.runScored;
      if (isValidBall) onStrikeBatsman.ballsPlayed--;
      if (undoRunObj.runScored == 4) onStrikeBatsman.fours--;
      else if (undoRunObj.runScored == 6) onStrikeBatsman.sixes--;
      if (undoRunObj.wicket == true) {
        onStrikeBatsman.isOnStrike = true;
        onStrikeBatsman.outStatus = OutStatus.NOT_OUT;
      }
      onStrikeBatsman.strikeRate = this.commonService.batsmanStrikeRate(
        onStrikeBatsman.runsScored,
        onStrikeBatsman.ballsPlayed
      );
    }
  }

  // Update Bowler
  private updateScoreBowler(
    tempCurrentInning: OneInning,
    scoreRunObj: ScoreRunDetails,
    isValidBall: boolean,
    currOverIndex: number
  ) {
    const bowler = tempCurrentInning.bowler;
    const thisOver = tempCurrentInning.thisOver;
    const currentBowler = bowler.find((el) => el.isBowlingCurr === true);
    if (currentBowler) {
      if (isValidBall) {
        currentBowler.ballsThrowed++;
        currentBowler.overs = this.commonService.ballsToOvers(
          currentBowler.ballsThrowed
        );
        if (currOverIndex !== -1) {
          const currOverObj = thisOver[currOverIndex];
          if (
            currOverObj.allBalls.length === 6 &&
            currOverObj.runsConceded == 0
          )
            currentBowler.maidens++;
        }
        if (scoreRunObj.wicket) currentBowler.wickets++;
      } else currentBowler.runsConceded += 1;
      currentBowler.runsConceded += scoreRunObj.runScored;
      currentBowler.economyRate = (
        currentBowler.runsConceded / currentBowler.overs
      ).toFixed(2);
    }
  }

  private updateUndoBowler(
    tempCurrentInning: OneInning,
    scoreRunObj: ScoreRunDetails,
    isValidBall: boolean,
    isNewEmptyOver: boolean
  ) {
    const bowler = tempCurrentInning.bowler;
    if (isNewEmptyOver) {
      bowler.shift();
      bowler[0].isBowlingCurr = true;
    }
    const lastBowler = bowler[0];
    if (lastBowler) {
      if (isValidBall) {
        lastBowler.ballsThrowed--;
        lastBowler.overs = this.commonService.ballsToOvers(
          lastBowler.ballsThrowed
        );
        if (isNewEmptyOver) {
          lastBowler.maidens--;
          if (lastBowler.maidens < 0) lastBowler.maidens = 0;
        }
        if (scoreRunObj.wicket) lastBowler.wickets--;
      } else lastBowler.runsConceded -= 1;
      lastBowler.runsConceded -= scoreRunObj.runScored;
      lastBowler.economyRate = (
        lastBowler.runsConceded / lastBowler.overs
      ).toFixed(2);
    }
  }

  rotateStrike(batsman: BattingElements[]) {
    if (batsman[0].outStatus == OutStatus.NOT_OUT)
      batsman[0].isOnStrike = !batsman[0].isOnStrike;
    if (batsman[1].outStatus == OutStatus.NOT_OUT)
      batsman[1].isOnStrike = !batsman[1].isOnStrike;
  }
}
