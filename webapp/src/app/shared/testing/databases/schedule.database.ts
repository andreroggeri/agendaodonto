import { randSoonDate } from "@ngneat/falso";
import { IScheduleResponse } from "../../interfaces/services/schedule.model";
import { BaseDatabase } from "./base.database";
import { DentistDatabase } from "./dentist.database";
import { PatientDatabase } from "./patient.database";

export class ScheduleDatabase extends BaseDatabase<IScheduleResponse> {
    patientDatabase = new PatientDatabase();
    dentistDatabase = new DentistDatabase();

    get(): IScheduleResponse {
        const schedule: IScheduleResponse = {
            id: Math.floor(Math.random() * 100 + 1),
            patient: this.patientDatabase.get(),
            dentist: this.dentistDatabase.get(),
            duration: Math.floor(Math.random() * 100 + 1),
            status: Math.floor(Math.random() * 3 + 1),
            date: randSoonDate().toString(),
            notification_status: "ENVIADO",
        };
        return schedule;
    }
}
