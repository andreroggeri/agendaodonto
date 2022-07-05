import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map, startWith, switchMap } from 'rxjs/operators';

import { IClinicResponse } from '../shared/interfaces/services/clinic.model';
import { ClinicFilter } from './clinic.filter';
import { ClinicService } from './clinic.service';

@Component({
    selector: 'app-clinic',
    templateUrl: './clinic.component.html',
    styleUrls: ['./clinic.component.scss'],
})
export class ClinicComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    isLoading = false;
    count = 0;
    dataSource: MatTableDataSource<IClinicResponse>;
    displayedColumns = ['name', 'actions'];
    watcher: Observable<any>;

    constructor(private clinicService: ClinicService, private router: Router) {
    }

    ngOnInit() {
        this.dataSource = new MatTableDataSource();
        this.watcher = this.paginator.page
            .pipe(
                startWith(null),
                switchMap(() => {
                    this.isLoading = true;
                    const clinicFilter = new ClinicFilter();
                    if (this.paginator.pageSize) {
                        const offset = this.paginator.pageSize * this.paginator.pageIndex;
                        clinicFilter.setFilterValue('pageSize', this.paginator.pageSize.toString());
                        clinicFilter.setFilterValue('offset', offset.toString());
                    }
                    return this.clinicService.getAll(clinicFilter).pipe(
                        finalize(() => this.isLoading = false),
                        map(response => {
                            this.count = response.count;
                            return response.results;
                        }),
                    );
                }));
        this.watcher.subscribe(response => {
            this.dataSource.data = response;
        });

    }

    view(clinic: IClinicResponse) {
        this.router.navigate(['/clinicas/' + clinic.id]);
    }
}
