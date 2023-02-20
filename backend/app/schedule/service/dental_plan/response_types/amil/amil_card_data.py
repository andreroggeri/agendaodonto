from app.schedule.service.dental_plan.response_types.dental_plan_card_data import DentalPlanCardData


class AmilCardData(DentalPlanCardData):
    full_name: str
    plan_name: str
