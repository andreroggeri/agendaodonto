from app.schedule.service.dental_plan.types.treatment_adress import TreatmentAddressResponse

data = {'sequencialEndereco': 1,
        'endereco': {'tipoLogradouro': None, 'logradouro': 'AV ADHERBAL DA COSTA MOREIRA', 'numeroLogradouro': '589',
                     'complemento': '1 ANDAR SL 03', 'bairro': 'JARDIM AMERICA', 'cidade': 'CAMPO LIMPO PAULISTA',
                     'uf': 'SP', 'cep': 13231190, 'status': 'ATIVO'}, 'telefone': {'ddd': '11', 'numero': '974168371'},
        'perfisAtendimento': ['EXAME_RADIOLOGICO', 'TRATAMENTO_ODONTOLOGICO', 'URGENCIA_EMERGENCIA']}

if __name__ == '__main__':
    print(TreatmentAddressResponse(**{'sequencialEndereco': 1, 'endereco': data['endereco']}))
