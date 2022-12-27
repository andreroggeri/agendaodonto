import datetime

from pydantic import BaseModel


class AmilDentalPlanInformation(BaseModel):
    first_name: str
    last_name: str
    cpf: str
    birth_date: datetime.date
    gender: str
    plan_name: str
    full_name: str
