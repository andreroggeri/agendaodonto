from pydantic import BaseModel, Field


class ServiceProviderResponse(BaseModel):
    id: str = Field(..., alias='codprestador')
    provider_name: str = Field(..., alias='nomeprestador')
    email: str = Field(..., alias='email')
    name: str = Field(..., alias='nomeguiamedico')
    cpf: str = Field(..., alias='cpf')
    cro_number: str = Field(..., alias='numeroconselho')
    cro_state: str = Field(..., alias='ufconselho')
    operators: str = Field(..., alias='operadoras')
