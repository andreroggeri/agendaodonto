import datetime
from typing import List

import requests

from app.schedule.service.dental_plan.types.amil_card_information import AmilDentalPlanInformation
from app.schedule.service.dental_plan.types.service_provider import ServiceProviderResponse
from app.schedule.service.dental_plan.types.treatment_adress import TreatmentAddressResponse
from app.schedule.service.dental_plan.types.treatment_type import TreatmentType

api_base_url = 'https://www.amil.com.br/credenciado-dental/api'
auth_url = 'https://www.amil.com.br/credenciado-dental/Login'


class BaseAmilService:

    def __init__(self, username: str):
        self.username = username

    def authenticate(self, password: str) -> None:
        raise NotImplementedError

    def fetch_dental_plan_data(self, card_number: str) -> AmilDentalPlanInformation:
        raise NotImplementedError

    def request_basic_treatment(self, card_number: str) -> dict:
        raise NotImplementedError


class AmilFakeService(BaseAmilService):

    def authenticate(self, password: str) -> None:
        pass

    def fetch_dental_plan_data(self, card_number: str) -> AmilDentalPlanInformation:
        return AmilDentalPlanInformation(**{
            'first_name': 'John',
            'last_name': 'Doe',
            'cpf': '12345678910',
            'birth_date': datetime.date(1990, 1, 1),
            'gender': 'M',
        })

    def request_basic_treatment(self, card_number: str) -> dict:
        return {"guia": 123456, "messages": "Erro ao obter saldo:Sequence contains no elements"}


class AmilService(BaseAmilService):

    def __init__(self, username):
        super().__init__(username)
        self.session = requests.Session()

    def authenticate(self, password: str):
        payload = {"login": self.username, "senha": password, "idSistema": 600}
        response = requests.post(auth_url, json=payload)
        token = response.json()['token']
        self.session.headers.update({'Authorization': f'Bearer {token}'})

    def fetch_dental_plan_data(self, card_number: str) -> AmilDentalPlanInformation:
        """Fetch dental plan data from Amil API."""
        url = f'{api_base_url}/CredenciadoDental/Beneficiario/Elegibilidade/Prestador/{self.username}/MarcaOtica/{card_number}'

        response = self.session.get(url)

        response.raise_for_status()

        data = response.json()
        dependents = data['contrato'].get('dependentes', [])
        dependent_data = None
        for dependent in dependents:
            if dependent['beneficiario']['marcaOtica'] == card_number:
                dependent_data = dependent
        beneficiary = dependent_data['beneficiario'] if dependent_data else data['contrato']['titular']
        first_name, last_name = beneficiary['beneficiario']['nome'].title().split(' ', 1)
        birth_date = datetime.datetime.fromisoformat(beneficiary['beneficiario']['dataNascimento']).date()
        gender = 'M' if beneficiary['beneficiario']['sexo'] == 'MASCULINO' else 'F'
        plan_name = beneficiary['plano']['nomePlanoCartao']
        full_name = beneficiary['beneficiario']['nome']
        return AmilDentalPlanInformation(**{
            'first_name': first_name,
            'last_name': last_name,
            'cpf': beneficiary.get('cpf', ''),
            'birth_date': birth_date,
            'gender': gender,
            'plan_name': plan_name,
            'full_name': full_name,
        })

    def request_basic_treatment(self, card_number: str):
        url = f'{api_base_url}/credenciado-dental/api/CredenciadoDental/PlanoTratamento/SolicitaLiberacao/MarcaOtica/{card_number}'
        plan_data = self.fetch_dental_plan_data(card_number)
        addresses = self._fetch_treatment_address_data(card_number)
        provider_info = self._fetch_provider_information()
        if len(addresses) == 0:
            raise Exception('No addresses found')
        address = addresses[0]
        payload = {
            "dadosBeneficiario": {
                "carteira": card_number,
                "nome": plan_data.full_name,
                "plano": plan_data.plan_name,
            },
            "dadosSolicitante": {
                "dadosContratado": {
                    "identificacao": {"codigoPrestador": self.username},
                    "nome": provider_info.provider_name,
                    "endereco": {
                        "sequencial": address.address_sequence,
                        "tipoLogradouro": address.location.address_type,
                        "logradouro": address.location.address,
                        "numero": address.location.number,
                        "complemento": address.location.complement,
                        "codigoIbgeMunicipio": "0000000",
                        "codigoUF": address.location.state,
                        "cep": address.location.zip_code
                    },
                    "conselhoProfissional": {
                        "sigla": "CRO",
                        "numero": provider_info.cro_number,
                        "uf": provider_info.cro_state
                    }
                },
                "dadosProfissional": {
                    "nome": provider_info.provider_name,
                    "conselhoProfissional": {
                        "sigla": "CRO",
                        "numero": provider_info.cro_number,
                        "uf": provider_info.cro_state
                    }
                }
            },
            "planoTratamento": [
                {
                    "procedimentoOdonto": {
                        "codigo": 81000030,
                        "tipoTabela": "98",
                        "descricao": "CONSULTA ODONTOLÓGICA"
                    },
                    "denteRegiao": {"dente": None, "regiao": "ASAI"},
                    "faces": []
                },
                {
                    "procedimentoOdonto": {
                        "codigo": 14362,
                        "tipoTabela": "98",
                        "descricao": "PREVENÇÃO MÓDULO 1 (LIMPEZA DENTÁRIA/RASPAGEM)"
                    },
                    "denteRegiao": {"dente": None, "regiao": "HAID"},
                    "faces": []
                },
                {
                    "procedimentoOdonto": {
                        "codigo": 14362,
                        "tipoTabela": "98",
                        "descricao": "PREVENÇÃO MÓDULO 1 (LIMPEZA DENTÁRIA/RASPAGEM)"
                    },
                    "denteRegiao": {"dente": None, "regiao": "HAIE"},
                    "faces": []
                },
                {
                    "procedimentoOdonto": {
                        "codigo": 14362,
                        "tipoTabela": "98",
                        "descricao": "PREVENÇÃO MÓDULO 1 (LIMPEZA DENTÁRIA/RASPAGEM)"
                    },
                    "denteRegiao": {"dente": None, "regiao": "HASD"},
                    "faces": []
                },
                {
                    "procedimentoOdonto": {
                        "codigo": 14362,
                        "tipoTabela": "98",
                        "descricao": "PREVENÇÃO MÓDULO 1 (LIMPEZA DENTÁRIA/RASPAGEM)"
                    },
                    "denteRegiao": {"dente": None, "regiao": "HASE"},
                    "faces": []
                }
            ],
            "tipoAtendimento": 1,
            "observacao": "",
            "formularioAbertura": None,
            "formularioProrrogacao": None
        }

        response = self.session.post(url, json=payload)
        response.raise_for_status()

        return response.json()

    def _get_treatment_dental_plan_type(self) -> TreatmentType:
        endpoint = f'{api_base_url}/CredenciadoDental/Prestador/Especialidades/Operadora/Prestador/{self.username}'
        response = self.session.get(endpoint)
        response.raise_for_status()
        data = response.json()
        treatment_types = [TreatmentType(**d) for d in data]

        dental_treatment_type = [t for t in treatment_types if
                                 t.specialty_name == 'ODONTOLOGIA PREVENTIVA' and t.operator_name == 'AMIL']

        if len(dental_treatment_type) == 0:
            raise Exception('No dental treatment type found')

        return dental_treatment_type[0]

    def _fetch_treatment_address_data(self, card_number: str) -> List[TreatmentAddressResponse]:
        endpoint = f'{api_base_url}/CredenciadoDental/PlanoTratamento/TipoAtendimento/Prestador/{self.username}/MarcaOtica/{card_number}'
        response = self.session.get(endpoint)

        response.raise_for_status()

        addresses = [TreatmentAddressResponse(**d) for d in response.json()]

        return addresses

    def _fetch_provider_information(self):
        url = f'{api_base_url}/CredenciadoDental/Prestador/{self.username}'
        response = self.session.get(url)
        response.raise_for_status()
        data = response.json()

        parsed = [ServiceProviderResponse(**d) for d in data]

        if len(parsed) == 0:
            raise Exception('No provider found')

        return parsed[0]
