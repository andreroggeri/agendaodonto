import datetime
from typing import Optional

from pydantic import BaseModel


class DentalPlanCardData(BaseModel):
    first_name: str
    last_name: str
    birth_date: Optional[datetime.date]
    age: Optional[int]
    gender: str
