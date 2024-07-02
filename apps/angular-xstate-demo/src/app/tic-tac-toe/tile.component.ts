import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tile',
  standalone: true,
  template: ` <div class="tile" [attr.data-player]="player()"></div> `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 10vmin;
      background: white;
    }

    .tile:before {
      content: attr(data-player);
    }

  `,
})
export class TileComponent {
  player = input<'x' | 'o' | null>(null);
}
