import { NgModule } from '@angular/core';
import { MatSpinner } from '@angular/material';

import { LoadingOverlayComponent } from '../components/loading-overlay/loading-overlay.component';
import { SharedComponentsModule } from '../components/shared-components.module';
import { AutoFocusDirective } from './auto-focus.directive';
import { ButtonLoaderDirective } from './button-loader.directive';
import { LoadingOverlayDirective } from './loading-overlay-directive';

@NgModule({
    imports: [SharedComponentsModule],
    exports: [AutoFocusDirective, ButtonLoaderDirective, LoadingOverlayDirective],
    declarations: [AutoFocusDirective, ButtonLoaderDirective, LoadingOverlayDirective],
    entryComponents: [MatSpinner, LoadingOverlayComponent],
})
export class DirectivesModule {

}
