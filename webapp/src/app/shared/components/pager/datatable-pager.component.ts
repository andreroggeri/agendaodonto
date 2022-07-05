import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-datatable-pager',
    templateUrl: 'datatable-pager.component.html',
})

export class DataTablePagerComponent {
    @Output() change: EventEmitter<any> = new EventEmitter();

    @Input()
    count = 0;
    @Input()
    page = 1;
    @Input()
    size = 0;
    pages: any;

    get totalPages(): number {
        const count = this.size < 1 ? 1 : Math.ceil(this.count / this.size);
        return Math.max(count || 0, 1);
    }

    get startRange() {
        return ((this.page - 1) * (this.size)) + 1;
    }

    get endRange() {
        let endRange = this.startRange - 1 + this.size;
        endRange = endRange > this.count ? this.count : endRange;
        return endRange;
    }

    canPrevious(): boolean {
        return this.page > 1;
    }

    canNext(): boolean {
        return this.page < this.totalPages;
    }

    prevPage(): void {
        this.selectPage(this.page - 1);
    }

    nextPage(): void {
        this.selectPage(this.page + 1);
    }

    selectPage(page: number): void {
        if (page > 0 && page <= this.totalPages && page !== this.page) {
            this.page = page;

            this.change.emit({
                page,
            });
        }
    }
}

export interface IPaginateEvent {
    limit: number;
    offset: number;
}

export interface ISortEvent {
    newValue: string;
    column: { prop: string };
}

export interface IClickEvent<T> {
    type: string;
    value: any;
    row: T;
}
