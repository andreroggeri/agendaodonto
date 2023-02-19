from typing import Optional

from pydantic import Field, BaseModel


class Location(BaseModel):
    address_type: Optional[str] = Field(..., alias='tipoLogradouro')
    address: str = Field(..., alias='logradouro')
    number: str = Field(..., alias='numeroLogradouro')
    complement: str = Field(..., alias='complemento')
    district: str = Field(..., alias='bairro')
    city: str = Field(..., alias='cidade')
    state: str = Field(..., alias='uf')
    zip_code: int = Field(..., alias='cep')
    status: str = Field(..., alias='status')


class TreatmentAddressResponse(BaseModel):
    address_sequence: int = Field(..., alias='sequencialEndereco')
    location: Location = Field(..., alias='endereco')
