import http from './http';

interface PaginatedResponse<T> {
  count: number;
  results: T[];
}
interface IDentalPlan {
  id: number;
  name: string;
}

export enum TreatmentRequestStatus {
  PENDING = 'PENDING',
}

interface CreateTreatmentRequest {
  dental_plan: number;
  dental_plan_card_number: string;
  patient_phone: string;
  dentist_phone: string;
  status: TreatmentRequestStatus;
  clinic: number;
}

class ApiService {
  async findDentalPlanByName(name: string): Promise<IDentalPlan> {
    const result = await http.get<PaginatedResponse<IDentalPlan>>('/v1/dental-plans/', { params: { name } });

    if (result.data.count === 0) {
      throw new Error(`Dental plan not found with name ${name}`);
    }

    return result.data.results[0];
  }

  async createTreatmentRequest(request: CreateTreatmentRequest) {
    console.log('Creating treatment request', { request });
    try {
      await http.post('/v1/treatment-requests/', request);
      console.log('Treatment request created');
    } catch (e) {
      console.error('Error creating treatment request', { request, error: e });
    }
  }
}

const apiService = new ApiService();

export default apiService;
