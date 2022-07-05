import * as moment from 'moment';

import { IAttendanceResponse } from '../schedule/schedule.service';

interface ISeriesData {
    name: string;
    value: number;
}

interface IAttendanceData {
    name: string;
    series: ISeriesData[];
}

export function parseAttendanceData(response: IAttendanceResponse) {
    const parsedData: IAttendanceData[] = [
        { name: 'Comparecimentos', series: [] },
        { name: 'Faltas', series: [] },
        { name: 'Cancelamentos', series: [] },
    ];
    Object.keys(response)
        .sort((a, b) => moment(a) > moment(b) ? 1 : -1)
        .forEach(key => {
            const date = moment(key);
            date.locale('pt-BR');
            parsedData[0].series.push({ name: date.format('MMMM/YY'), value: response[key].attendances });
            parsedData[1].series.push({ name: date.format('MMMM/YY'), value: response[key].absences });
            parsedData[2].series.push({ name: date.format('MMMM/YY'), value: response[key].cancellations });
        });
    return parsedData;
}
