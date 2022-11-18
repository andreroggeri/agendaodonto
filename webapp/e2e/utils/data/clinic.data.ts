import { randCompanyName } from "@ngneat/falso";
import { IClinicResponse } from "../../../src/app/shared/interfaces/services/clinic.model";
import { makeRequest } from "../request";
import { baseBackendUrl } from "../vars";

export function createClinics(
    token: string,
    userId: number,
    count = 2
): Promise<IClinicResponse[]> {
    const jobs = new Array(count)
        .fill(null)
        .map(() => {
            return {
                name: randCompanyName(),
                dentists: [userId],
            };
        })
        .map((clinic) => {
            return makeRequest(`${baseBackendUrl}/v1/clinics/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(clinic),
            }) as Promise<IClinicResponse>;
        });

    return Promise.all(jobs);
}
