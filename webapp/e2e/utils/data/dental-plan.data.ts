import { randCompanyName } from "@ngneat/falso";
import { IDentalPlanResponse } from "../../../src/app/shared/interfaces/services/denta-plan.model";
import { makeRequest } from "../request";
import { baseBackendUrl } from "../vars";

export function createDentalPlans(
    token: string,
    count = 1
): Promise<IDentalPlanResponse[]> {
    const jobs = new Array(count)
        .fill(null)
        .map(() => {
            return {
                name: randCompanyName(),
            };
        })
        .map((dentalPlan) => {
            return makeRequest(`${baseBackendUrl}/v1/dental-plans/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(dentalPlan),
            }) as Promise<IDentalPlanResponse>;
        });

    return Promise.all(jobs);
}
