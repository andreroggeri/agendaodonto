import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialAppModule } from '../../material.app.module';
import { DataTablePagerComponent } from './datatable-pager.component';

@NgModule({
    imports: [CommonModule, FlexLayoutModule, MaterialAppModule],
    declarations: [DataTablePagerComponent],
    exports: [DataTablePagerComponent],

})
export class DataTablePagerModule {

}
