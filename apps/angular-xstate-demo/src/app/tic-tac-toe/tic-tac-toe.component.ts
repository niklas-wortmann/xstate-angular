import { Component, inject } from '@angular/core';
import { TicTacToeSerice } from './ticTacToeMachine';
import { TileComponent } from './tile.component';

@Component({
  selector: 'app-tic-tac-toe-component',
  template: `<div class="root"> <div class="game">
      <h1>Tic-Tac-Toe</h1>
      @if (hasWinner()) {
      <div>
        @if (isWinner()) {
        <h2>Winner: {{ ticTacToeService.snapshot().context.winner }}</h2>
        } @else if (isDraw()) {
        <h2>Draw</h2>
        }
        <button (click)="ticTacToeService.send({ type: 'RESET' })">
          Reset
        </button>
      </div>
      }
    </div>
    <div class="board">
      @for (tile of board; track $index) {
        <app-tile (click)="tileClicked($index)" [player]="ticTacToeService.snapshot().context.board[$index]"/>
      }
    </div>
  </div>`,
  styles: `
  `,
  providers: [TicTacToeSerice],
  standalone: true,
  imports: [TileComponent],
})
export class TicTacToeComponent {
  protected ticTacToeService = inject(TicTacToeSerice);
  protected board = this.range(0, 9);

  protected hasWinner = this.ticTacToeService.matches('gameOver');
  protected isWinner = this.ticTacToeService.hasTag('winner');
  protected isDraw = this.ticTacToeService.hasTag('draw');

  private range(start: number, end: number) {
    return Array(end - start)
      .fill(null)
      .map((_, i) => i + start);
  }

  tileClicked(index: number) {
    this.ticTacToeService.send({ type: 'PLAY', value: index });
  }
}
