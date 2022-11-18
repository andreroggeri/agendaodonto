import { createClinics } from "./clinic.data";
import { createDentalPlans } from "./dental-plan.data";
import { createPatients } from "./patient.data";
import { createSchedules } from "./schedule.data";

export async function createBaseData(token: string, userId: number) {
    const [clinics, dentalPlans] = await Promise.all([
        createClinics(token, userId),
        createDentalPlans(token),
    ]);
    const clinicPatients = await Promise.all(
        clinics.map((c) => createPatients(token, c.id, dentalPlans[0].id!))
    );
    await Promise.all(
        clinicPatients
            .reduce((prev, curr) => {
                return prev.concat(curr);
            }, [])
            .map((p) => createSchedules(token, userId, p.id!))
    );
}
