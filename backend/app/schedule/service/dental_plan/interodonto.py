import re
from datetime import datetime
from re import Pattern

import requests

from app.schedule.service.dental_plan.response_types.dental_plan_card_data import DentalPlanCardData


def create_expression(field_name: str):
    return re.compile(f"{field_name}\.value = '(.*)';", re.MULTILINE)


base_url = 'https://gndi.com.br'
base_service_url = 'https://credenciadodental.gndi.com.br'
name_exp = create_expression('txtNomePaciente')
age_exp = create_expression('txtIdade')


def run_expression(expression: Pattern, text: str) -> str:
    matches = expression.findall(text)

    if len(matches) > 1:
        return matches[1]

    return ''


class BaseInterodontoService:
    def __init__(self, username: str):
        self.username = username
        self.session = requests.Session()

    def authenticate(self, password: str) -> None:
        raise NotImplementedError

    def fetch_dental_plan_data(self, card_number: str) -> DentalPlanCardData:
        raise NotImplementedError

    def request_basic_treatment(self, card_number: str) -> str:
        raise NotImplementedError


class InterodontoDummyService(BaseInterodontoService):

    def request_basic_treatment(self, card_number: str) -> str:
        raise NotImplementedError

    def authenticate(self, password: str) -> None:
        pass

    def fetch_dental_plan_data(self, card_number: str) -> DentalPlanCardData:
        return DentalPlanCardData(**{
            'first_name': 'John',
            'last_name': 'Doe',
            'age': 30,
            'plan_name': 'Interodonto',
            'gender': 'M',
        })


class InterodontoService(BaseInterodontoService):
    def request_basic_treatment(self, card_number: str) -> str:
        raise NotImplementedError

    def authenticate(self, password: str) -> None:
        login_page = f'{base_url}/credenciados/odonto'
        self.session.get(login_page).raise_for_status()
        self.session.get(f'{base_service_url}/credenciados/login_credenciados.asp').raise_for_status()
        url = f'{base_service_url}/login/verificar.asp'
        payload = {
            'txtLogin': self.username,
            'txtSenha': password,
            'Submit': 'ACESSAR',
            'Empresa': '15',
            'rdTipoLogin': 'P',
        }

        self.session.post(url, data=payload).raise_for_status()

    def fetch_dental_plan_data(self, card_number: str) -> DentalPlanCardData:
        card_number = self._format_card(card_number)
        url = f'{base_service_url}/credenciados/aci/EngineACI.asp'
        today = datetime.now().strftime('%d/%m/%Y')
        payload = {
            'somente_radio': 'N',
            'origem': '',
            'StatusProtese': '',
            'StatusProcedimento': '',
            'StatusOrtodontia': '',
            'ProcedManutOrtoPadrao': '',
            'Cod': '',
            'libera_eba': 'N',
            'txtDataAtual': today,
            'rdTipoACI': 1,
            'rdEmpresa': 15,
            'planomax': 0,
            'tipocarteira': 0,
            'txtCarteirinha': card_number,
            'Acao': 'CARREGADADOS',
            'txtDDDTelefoneComercial': '',
            'txtTelefoneComercial': '',
            'txtDDDTelefone': '',
            'txtTelefone': '',
            'rn': 'N',
            'recem_nascido': '',
            'tipo_atendimento': 0,
            'txtDataExame': '',
            'txtProtocol': today,
            'dente': '',
            'd18': '',
            'd17': '',
            'd16': '',
            'd15': '',
            'd14': '',
            'd13': '',
            'd12': '',
            'd11': '',
            'd21': '',
            'd22': '',
            'd23': '',
            'd24': '',
            'd25': '',
            'd26': '',
            'd27': '',
            'd28': '',
            'd48': '',
            'd47': '',
            'd46': '',
            'd45': '',
            'd44': '',
            'd43': '',
            'd42': '',
            'd41': '',
            'd31': '',
            'd32': '',
            'd33': '',
            'd34': '',
            'd35': '',
            'd36': '',
            'd37': '',
            'd38': '',
            'd55': '',
            'd54': '',
            'd53': '',
            'd52': '',
            'd51': '',
            'd61': '',
            'd62': '',
            'd63': '',
            'd64': '',
            'd65': '',
            'd85': '',
            'd84': '',
            'd83': '',
            'd82': '',
            'd81': '',
            'd71': '',
            'd72': '',
            'd73': '',
            'd74': '',
            'd75': '',
            'doenca_periodontal': '',
            'alteracao_tecidos_moles': '',
            'txtObservacoesEba': '',
            'txtCodProcedimento01': '',
            'txtDA01': '',
            'txtFc01': '',
            'txtQtd01': '',
            'txtExu01': '',
            'txtVerifica01': False,
            'txtRefManutencao01': '',
            'txtCodProcedimento02': '',
            'txtDA02': '',
            'txtFc02': '',
            'txtQtd02': '',
            'txtExu02': '',
            'txtVerifica02': False,
            'txtRefManutencao02': '',
            'txtCodProcedimento03': '',
            'txtDA03': '',
            'txtFc03': '',
            'txtQtd03': '',
            'txtExu03': '',
            'txtVerifica03': False,
            'txtRefManutencao03': '',
            'txtCodProcedimento04': '',
            'txtDA04': '',
            'txtFc04': '',
            'txtQtd04': '',
            'txtExu04': '',
            'txtVerifica04': False,
            'txtRefManutencao04': '',
            'txtCodProcedimento05': '',
            'txtDA05': '',
            'txtFc05': '',
            'txtQtd05': '',
            'txtExu05': '',
            'txtVerifica05': False,
            'txtRefManutencao05': '',
            'txtCodProcedimento06': '',
            'txtDA06': '',
            'txtFc06': '',
            'txtQtd06': '',
            'txtExu06': '',
            'txtVerifica06': False,
            'txtRefManutencao06': '',
            'txtCodProcedimento07': '',
            'txtDA07': '',
            'txtFc07': '',
            'txtQtd07': '',
            'txtExu07': '',
            'txtVerifica07': False,
            'txtRefManutencao07': '',
            'txtCodProcedimento08': '',
            'txtDA08': '',
            'txtFc08': '',
            'txtQtd08': '',
            'txtExu08': '',
            'txtVerifica08': False,
            'txtRefManutencao08': '',
            'txtCodProcedimento09': '',
            'txtDA09': '',
            'txtFc09': '',
            'txtQtd09': '',
            'txtExu09': '',
            'txtVerifica09': False,
            'txtRefManutencao09': '',
            'txtCodProcedimento010': '',
            'txtDA010': '',
            'txtFc010': '',
            'txtQtd010': '',
            'txtExu010': '',
            'txtVerifica010': False,
            'txtRefManutencao010': '',
            'txtCodProcedimento011': '',
            'txtDA011': '',
            'txtFc011': '',
            'txtQtd011': '',
            'txtExu011': '',
            'txtVerifica011': False,
            'txtRefManutencao011': '',
            'txtCodProcedimento012': '',
            'txtDA012': '',
            'txtFc012': '',
            'txtQtd012': '',
            'txtExu012': '',
            'txtVerifica012': False,
            'txtRefManutencao012': '',
            'txtCodProcedimento013': '',
            'txtDA013': '',
            'txtFc013': '',
            'txtQtd013': '',
            'txtExu013': '',
            'txtVerifica013': False,
            'txtRefManutencao013': '',
            'txtCodProcedimento014': '',
            'txtDA014': '',
            'txtFc014': '',
            'txtQtd014': '',
            'txtExu014': '',
            'txtVerifica014': False,
            'txtRefManutencao014': '',
            'txtCodProcedimento015': '',
            'txtDA015': '',
            'txtFc015': '',
            'txtQtd015': '',
            'txtExu015': '',
            'txtVerifica015': False,
            'txtRefManutencao015': '',
            'txtCodProcedimento016': '',
            'txtDA016': '',
            'txtFc016': '',
            'txtQtd016': '',
            'txtExu016': '',
            'txtVerifica016': False,
            'txtRefManutencao016': '',
            'txtCodProcedimento017': '',
            'txtDA017': '',
            'txtFc017': '',
            'txtQtd017': '',
            'txtExu017': '',
            'txtVerifica017': False,
            'txtRefManutencao017': '',
            'txtCodProcedimento018': '',
            'txtDA018': '',
            'txtFc018': '',
            'txtQtd018': '',
            'txtExu018': '',
            'txtVerifica018': False,
            'txtRefManutencao018': '',
            'txtCodProcedimento019': '',
            'txtDA019': '',
            'txtFc019': '',
            'txtQtd019': '',
            'txtExu019': '',
            'txtVerifica019': False,
            'txtRefManutencao019': '',
            'txtCodProcedimento020': '',
            'txtDA020': '',
            'txtFc020': '',
            'txtQtd020': '',
            'txtExu020': '',
            'txtVerifica020': False,
            'txtRefManutencao020': '',
            'txtObservacoes': ''
        }

        res = self.session.post(url, data=payload)
        res.raise_for_status()

        full_name = run_expression(name_exp, res.text).title()
        [first_name, last_name] = full_name.split(' ', maxsplit=1)
        age = run_expression(age_exp, res.text)
        return DentalPlanCardData(**{
            'first_name': first_name,
            'last_name': last_name,
            'age': int(age),
            'gender': 'M',  # TODO: Guess this in the future
        })

    def _format_card(self, card_number: str) -> str:
        if len(card_number) != 23:
            raise ValueError(f'Invalid card {card_number}')
        return '.'.join([
            card_number[0:4],
            card_number[4:8],
            card_number[8:12],
            card_number[12:16],
            card_number[16:19],
            card_number[19:24],
        ])
