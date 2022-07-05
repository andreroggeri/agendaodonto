import { Component, Input } from '@angular/core';

export interface IStatus {
    hint: string;
    icon: string;
    iconStyle: object;
}

interface IStatusList {
    [key: number]: IStatus;
}
@Component({
    selector: 'app-notification-status',
    template: `<div class="circle" matTooltip="{{ getHintLabel() }}">
                <mat-icon class="centered" [ngStyle]="getIconStyle()">{{ getIcon() }}</mat-icon>
              </div>`,
    styleUrls: ['notification-status.component.scss'],
})
export class NotificationStatusComponent {
    private static statusList: IStatusList = {
        0: { hint: 'Sua mensagem está agendada, e assim que necessário será enviada', icon: 'schedule', iconStyle: {} },
        1: { hint: 'Sua mensagem foi enviada com sucesso.', icon: 'done_all', iconStyle: { color: 'green' } },
        2: { hint: 'Ocorreu um erro ao enviar sua mensagem', icon: 'error_outline', iconStyle: { color: 'red' } },
        3: { hint: 'Sua mensagem expirou.', icon: 'block', iconStyle: { color: '#626262' } },
        4: { hint: 'Não sabemos o que aconteceu com a sua mensagem. :(', icon: 'warning', iconStyle: { color: '#FFEB3B' } },
    };

    @Input() status: string;

    static statusLookup(status: string): IStatus {
        let statusData = NotificationStatusComponent.statusList[status];
        if (statusData === undefined) {
            statusData = NotificationStatusComponent.statusList[4];
        }
        return statusData;
    }

    getHintLabel() {
        return NotificationStatusComponent.statusLookup(this.status).hint;
    }

    getIcon() {
        return NotificationStatusComponent.statusLookup(this.status).icon;
    }

    getIconStyle() {
        return NotificationStatusComponent.statusLookup(this.status).iconStyle;
    }
}
