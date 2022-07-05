import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from 'ng-bullet';

import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {

    let fixture: ComponentFixture<EmptyStateComponent>;
    let component: EmptyStateComponent;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [EmptyStateComponent],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EmptyStateComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render with the image as parameter', () => {
        component.image = 'some-image';
        fixture.detectChanges();

        const img = fixture.debugElement.query(By.css('img'));

        expect(img.nativeElement.getAttribute('src')).toEqual('/assets/images/some-image.png');
    });
});
