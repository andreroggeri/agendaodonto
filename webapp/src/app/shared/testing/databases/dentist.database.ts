import { randEmail, randFirstName, randLastName } from "@ngneat/falso";
import { IDentistResponse } from "../../interfaces/services/dentist.model";
import { BaseDatabase } from "./base.database";

export class DentistDatabase extends BaseDatabase<IDentistResponse> {
    get(): IDentistResponse {
        const cro = Math.floor(Math.random() * 10000 + 1);
        const dentist: IDentistResponse = {
            id: Math.floor(Math.random() * 100 + 1),
            cro: cro.toString(),
            cro_state: "SP",
            first_name: randFirstName(),
            last_name: randLastName(),
            email: randEmail(),
            sex: "M",
        };
        return dentist;
    }
}
