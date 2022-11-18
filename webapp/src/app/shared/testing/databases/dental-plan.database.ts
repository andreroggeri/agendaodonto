import { randFirstName } from "@ngneat/falso";
import { IDentalPlanResponse } from "../../interfaces/services/denta-plan.model";
import { BaseDatabase } from "./base.database";

export class DentalPlanDatabase extends BaseDatabase<IDentalPlanResponse> {
    get(): IDentalPlanResponse {
        const plan: IDentalPlanResponse = {
            id: Math.floor(Math.random() * 100 + 1),
            name: randFirstName(),
        };
        return plan;
    }
}
