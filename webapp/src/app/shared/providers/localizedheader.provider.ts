import { Injectable } from '@angular/core';
import { CalendarMomentDateFormatter, DateFormatterParams } from 'angular-calendar';
import { endOfWeek, getISOWeek } from 'date-fns';
import * as moment from 'moment';

@Injectable()
export class LocalizedCalendarHeader extends CalendarMomentDateFormatter {

    public weekViewTitle({ date, locale }: DateFormatterParams): string {
        const year: string = new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(date);
        const weekNumber: number = getISOWeek(endOfWeek(date));
        return `Semana ${weekNumber} de ${year}`;
    }

    public dayViewTitle({ date, locale }: DateFormatterParams): string {
        if (locale == null) {
            locale = 'pt-BR';
        }
        return moment(date).locale(locale).format('DD [de] MMMM [de] YYYY');
    }
}
