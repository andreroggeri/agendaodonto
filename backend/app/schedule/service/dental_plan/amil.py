import datetime
from typing import TypedDict

import requests


class AmilDentalPlanInformation(TypedDict):
    first_name: str
    last_name: str
    cpf: str
    birth_date: datetime.date
    gender: str


api_base_url = 'https://www.amil.com.br/credenciado-dental/api'
auth_url = 'https://www.amil.com.br/credenciado-dental/Login'


class BaseAmilService:
    def authenticate(self, username: str, password: str) -> None:
        raise NotImplementedError

    def fetch_dental_plan_data(self, card_number: str) -> AmilDentalPlanInformation:
        raise NotImplementedError


class AmilFakeService(BaseAmilService):

    def authenticate(self, username: str, password: str) -> None:
        pass

    def fetch_dental_plan_data(self, card_number: str) -> AmilDentalPlanInformation:
        return {
            'first_name': 'John',
            'last_name': 'Doe',
            'cpf': '12345678910',
            'birth_date': datetime.date(1990, 1, 1),
            'gender': 'M',
        }


class AmilService(BaseAmilService):

    def __init__(self):
        self.session = requests.Session()
        self.username = ''

    def authenticate(self, username: str, password: str):
        self.username = username
        payload = {"login": username, "senha": password, "idSistema": 600}
        response = requests.post(auth_url, json=payload)
        token = response.json()['token']
        self.session.headers.update({'Authorization': f'Bearer {token}'})

    def fetch_dental_plan_data(self, dental_plan_card_number: str) -> AmilDentalPlanInformation:
        """Fetch dental plan data from Amil API."""
        url = f'{api_base_url}/CredenciadoDental/Beneficiario/Elegibilidade/Prestador/{self.username}/MarcaOtica/{dental_plan_card_number}'

        response = self.session.get(url)

        response.raise_for_status()

        data = response.json()
        beneficiary = data['contrato']['titular']['beneficiario']
        first_name, last_name = beneficiary['nome'].title().split(' ', 1)
        birth_date = datetime.datetime.fromisoformat(beneficiary['dataNascimento']).date()
        gender = 'M' if beneficiary['sexo'] == 'MASCULINO' else 'F'
        return {
            'first_name': first_name,
            'last_name': last_name,
            'cpf': beneficiary['cpf'],
            'birth_date': birth_date,
            'gender': gender
        }
