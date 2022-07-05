import { Component } from '@angular/core';

@Component({
    selector: 'app-loading-overlay',
    styleUrls: ['loading-overlay.component.scss'],
    template: `
                <div class="overlay">
                    <mat-spinner style="margin: 0 auto"></mat-spinner>
                </div>
                `,
})
export class LoadingOverlayComponent {

}
