from pydantic import BaseModel, Field


class TreatmentType(BaseModel):
    specialty_code: str = Field(alias='codEspecialidade')
    specialty_name: str = Field(alias='nomeEspecialidade')
    operator_code: str = Field(alias='codOperadora')
    operator_name: str = Field(alias='nomeOperadora')
