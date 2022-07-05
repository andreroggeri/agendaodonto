import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, Sort } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

import { IPatientResponse } from '../shared/interfaces/services/patient.model';
import { getMatchedField, getReversedMatchField, IMatcher } from '../shared/util';
import { CustomFB, CustomFG } from '../shared/validation';
import { PatientDatasource } from './patient.datasource';
import { PatientFilter } from './patient.filter';
import { PatientService } from './patient.service';

@Component({
    selector: 'app-patient',
    templateUrl: './patient.component.html',
    styleUrls: ['./patient.component.scss'],
})
export class PatientComponent implements OnInit {
    patients: IPatientResponse[] = [];
    isLoading = true;
    patientCount = 0;
    sortBy = 'name';
    filterForm: CustomFG;
    patientFilter = new PatientFilter();
    pageLimit = 10;
    urlFilters: IMatcher[] = [
        { prettyName: 'nome', name: 'fullName' },
        { prettyName: 'telefone', name: 'phone' },
    ];
    columnsToDisplay = ['name', 'lastName', 'clinic'];
    datasource: PatientDatasource;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sorter: MatSort;

    constructor(private patientService: PatientService, private router: Router, private route: ActivatedRoute) {
        const fb = new CustomFB();
        this.filterForm = fb.group({
            field: ['fullName'],
            value: [''],
        });
    }

    ngOnInit() {
        this.datasource = new PatientDatasource(this.patientService, this.paginator);
        this.setupUrlFilterListener();
    }

    filter() {
        const field = getReversedMatchField(this.filterForm.value.field, this.urlFilters);
        this.router.navigate(['/pacientes', field, this.filterForm.value.value]);
    }

    setupUrlFilterListener() {
        this.route.params.subscribe(
            params => {
                this.datasource.patientFilter.reset();
                if (params.field !== undefined && params.value !== undefined) {
                    const field = getMatchedField(params.field, this.urlFilters);
                    this.datasource.patientFilter.setFilterValue(field, params.value);
                    this.filterForm.controls.field.setValue(field);
                    this.filterForm.controls.value.setValue(params.value);
                    this.datasource.filterChanges.next(null);
                }
            },
        );
    }

    rowClicked(rowData: IPatientResponse) {
        this.router.navigate([`/pacientes/${rowData.id}`]);
    }

    sorted(evt: Sort) {
        const sortMap = {
            name: 'name',
            lastName: 'last_name',
        };
        const prefix = evt.direction === 'desc' ? '-' : '';
        const fieldName = sortMap[evt.active];
        this.datasource.patientFilter.setFilterValue('orderBy', `${prefix}${fieldName}`);
        this.datasource.filterChanges.next(null);
    }
}
