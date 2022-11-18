import { rand, randBetweenDate, randNumber, randSoonDate } from "@ngneat/falso";
import moment from "moment";
import { IScheduleResponse } from "../../../src/app/shared/interfaces/services/schedule.model";
import { makeRequest } from "../request";

import { baseBackendUrl } from "../vars";

export async function createSchedules(
    token: string,
    userId: number,
    patientId: number,
    count = 5
): Promise<IScheduleResponse[]> {
    const jobs = new Array(count)
        .fill(null)
        .map(() => {
            const scheduleDate = randBetweenDate({
                from: moment().hour(8).toDate(),
                to: moment().hour(20).toDate(),
            });

            return {
                patient: patientId,
                dentist: userId,
                date: moment(scheduleDate).format("YYYY-MM-DD[T]hh:mm"),
                duration: randNumber({ min: 15, max: 120 }),
                status: rand([0, 1, 2, 3]),
            };
        })
        .map((schedule) => {
            return makeRequest(`${baseBackendUrl}/v1/schedules/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(schedule),
            }) as Promise<IScheduleResponse>;
        });

    return Promise.all(jobs);
}
