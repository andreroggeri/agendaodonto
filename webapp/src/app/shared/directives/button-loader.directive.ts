import {
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    Input,
    OnChanges,
    Renderer2,
    SimpleChange,
    ViewContainerRef,
} from '@angular/core';
import { MatButton, MatSpinner } from '@angular/material';

@Directive({
    selector: 'button[appBtnLoader]',
})
export class ButtonLoaderDirective implements OnChanges {
    private static DEFAULT_BTN_DIAMETER = 32;

    @Input('appBtnLoader') btnLoader: boolean;
    spinner: MatSpinner;
    componentRef: ComponentRef<{}>;

    constructor(
        private viewContainerRef: ViewContainerRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private renderer: Renderer2,
        private button: MatButton) { }

    ngOnChanges() {
        if (this.btnLoader) {
            this.button.disabled = true;
            const factory = this.componentFactoryResolver.resolveComponentFactory(MatSpinner);
            this.componentRef = this.viewContainerRef.createComponent(factory);
            this.spinner = this.componentRef.instance as MatSpinner;
            this.spinner.diameter = ButtonLoaderDirective.DEFAULT_BTN_DIAMETER;
            this.renderer.setStyle(this.spinner._elementRef.nativeElement, 'margin', '0 auto');
            this.renderer.appendChild(this.viewContainerRef.element.nativeElement, this.spinner._elementRef.nativeElement);
        } else {
            this.button.disabled = false;
            if (this.componentRef) {
                this.componentRef.destroy();
            }
        }
    }
}
