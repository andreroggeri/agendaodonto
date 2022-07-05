import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnChanges, ViewContainerRef } from '@angular/core';

import { LoadingOverlayComponent } from '../components/loading-overlay/loading-overlay.component';

@Directive({
    selector: '[appLoadingOverlay]',
})
export class LoadingOverlayDirective implements OnChanges {
    @Input('appLoadingOverlay') trigger: any;
    overlayComponentRef: ComponentRef<LoadingOverlayComponent>;

    constructor(
        private viewContainerRef: ViewContainerRef,
        private componentFactoryResolver: ComponentFactoryResolver,
    ) {
    }

    ngOnChanges() {
        if (this.trigger === 'true' || this.trigger === true) {
            this.destroy();
            const factory = this.componentFactoryResolver.resolveComponentFactory(LoadingOverlayComponent);
            this.overlayComponentRef = this.viewContainerRef.createComponent(factory);
        } else {
            this.destroy();
        }
    }

    destroy() {
        if (this.overlayComponentRef) {
            this.overlayComponentRef.destroy();
        }
    }
}
