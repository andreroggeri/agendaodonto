import {
    rand,
    randFirstName,
    randLastName,
    randPhoneNumber,
} from "@ngneat/falso";
import { IPatientResponse } from "../../../src/app/shared/interfaces/services/patient.model";
import { makeRequest } from "../request";
import { IPaginatedResponse } from "../../../src/app/shared/interfaces/services/paginated-response";
import { baseBackendUrl } from "../vars";

export function createPatients(
    token: string,
    clinicId: number,
    dentalPlanId: number,
    count = 2
): Promise<IPatientResponse[]> {
    const jobs = new Array(count)
        .fill(null)
        .map(() => {
            return {
                name: randFirstName(),
                last_name: randLastName(),
                sex: rand(["M", "F"]),
                phone: randPhoneNumber({ countryCode: "BR" })
                    .replace(/ /g, "")
                    .substring(3),
                clinic: clinicId,
                dental_plan: dentalPlanId,
            };
        })
        .map((patient) => {
            return makeRequest(`${baseBackendUrl}/v1/patients/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(patient),
            }) as Promise<IPatientResponse>;
        });

    return Promise.all(jobs);
}

export function getPatients(
    token: string
): Promise<IPaginatedResponse<IPatientResponse>> {
    return makeRequest(`${baseBackendUrl}/v1/patients/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        },
    });
}
