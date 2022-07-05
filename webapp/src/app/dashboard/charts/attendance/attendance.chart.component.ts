// import {Component, Input} from "@angular/core";
//
//
// @Component({
//     selector: 'sc-attendance-chart',
//     templateUrl: './attendance.chart.component.html',
// })
// export class AttendanceChartComponent {
//
//     @Input()
//     lineChartData: Array<any> = [{data: [], label: ''},];
//     lineChartLabels = [
//         'Janeiro', 'Fevereiro', 'Março',
//         'Abril', 'Maio', 'Junho',
//         'Julho', 'Agosto', 'Setembro',
//         'Outubro', 'Novembro', 'Dezembro'
//     ];
//     lineChartOptions = {responsive: true, maintainAspectRatio: false};
//     lineChartType: string = 'line';
//     lineChartColors = [
//         { // Presença
//             backgroundColor: 'rgba(0, 149, 79, 0.2)',
//             borderColor: 'rgba(0, 149, 79, 1)',
//             pointBackgroundColor: 'rgba(0, 149, 79, 1)',
//             pointBorderColor: '#fff',
//             pointHoverBackgroundColor: '#00954f',
//             pointHoverBorderColor: 'rgba(0, 149, 79, 0.8)'
//         },
//         { // Falta
//             backgroundColor: 'rgba(177, 0, 0, 0.2)',
//             borderColor: 'rgba(177, 0, 0, 1)',
//             pointBackgroundColor: 'rgba(177, 0, 0, 1)',
//             pointBorderColor: '#fff',
//             pointHoverBackgroundColor: '#b10000',
//             pointHoverBorderColor: 'rgba(177, 0, 0, 8)'
//         },
//         { // Cancelamento
//             backgroundColor: 'rgba(148,159,177,0.2)',
//             borderColor: 'rgba(148,159,177,1)',
//             pointBackgroundColor: 'rgba(148,159,177,1)',
//             pointBorderColor: '#fff',
//             pointHoverBackgroundColor: '#fff',
//             pointHoverBorderColor: 'rgba(148,159,177,0.8)'
//         },
//     ];
//     lineChartLegend = true;
//
//     constructor() {
//         console.log("***** " + JSON.stringify(this.lineChartData));
//     }
//
//
// }
