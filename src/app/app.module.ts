import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NewMatchComponent } from './pages/new-match/new-match.component';
import { ActiveMatchComponent } from './pages/active-match/active-match.component';
import { TeamsComponent } from './pages/teams/teams.component';
import { MatchHistoryComponent } from './pages/match-history/match-history.component';
import { SidenavComponent } from './shared/components/sidenav/sidenav.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { SmallCardComponent } from './shared/components/small-card/small-card.component';
import { ScoreboardComponent } from './shared/components/scoreboard/scoreboard.component';
import { OversComponent } from './shared/components/overs/overs.component';
import { ScoreTableComponent } from './shared/components/scoreboard/score-table/score-table.component';
import { TeamListCardComponent } from './pages/teams/team-list-card/team-list-card.component';
import { PlayerListCardComponent } from './pages/teams/player-list-card/player-list-card.component';
import { MatDialogComponent } from './shared/components/mat-dialog/mat-dialog.component';
import { PartnershipsComponent } from './shared/components/partnerships/partnerships.component';
import { AnalyticsComponent } from './shared/components/analytics/analytics.component';
import { MatchListCardComponent } from './pages/match-history/match-list-card/match-list-card.component';
import { OnlyNumbersDirective } from './shared/directives/only-numbers.directive';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgApexchartsModule } from 'ng-apexcharts';
import { OrdinalPipe } from './shared/pipes/ordinal.pipe';

@NgModule({
  declarations: [
    AppComponent,
    NewMatchComponent,
    ActiveMatchComponent,
    TeamsComponent,
    MatchHistoryComponent,
    SidenavComponent,
    SettingsComponent,
    HeaderComponent,
    TeamListCardComponent,
    PlayerListCardComponent,
    MatDialogComponent,
    SmallCardComponent,
    ScoreboardComponent,
    OversComponent,
    ScoreTableComponent,
    PartnershipsComponent,
    AnalyticsComponent,
    MatchListCardComponent,
    OnlyNumbersDirective,
    OrdinalPipe,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatDialogModule,
    MatSelectModule,
    MatTabsModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatTableModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatProgressBarModule,
    MatSnackBarModule,
    NgApexchartsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
