from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.db import models
from django.db.models import CharField, BooleanField, EmailField


class DentistManager(BaseUserManager):
    def create_user(self, first_name, last_name, email, sex, cro, cro_state, password, phone=None, amil_username=None,
                    amil_password=None):
        dentist = self.model(
            first_name=first_name,
            last_name=last_name,
            email=email,
            sex=sex,
            cro=cro,
            cro_state=cro_state,
            phone=phone,
            amil_username=amil_username,
            amil_password=amil_password
        )
        dentist.set_password(password)

        dentist.save(using=self._db)
        return dentist


class Dentist(AbstractBaseUser):
    class Meta:
        unique_together = ('cro', 'cro_state')

    SEX_TYPES = (
        ('M', 'Masculino'),
        ('F', 'Feminino')
    )

    CRO_STATE_OPTIONS = (
        ("AC", "Acre"),
        ("AL", "Alagoas"),
        ("AP", "Amapá"),
        ("AM", "Amazonas"),
        ("BA", "Bahia"),
        ("CE", "Ceará"),
        ("DF", "Distrito Federal"),
        ("ES", "Espírito Santo"),
        ("GO", "Goiás"),
        ("MA", "Maranhão"),
        ("MT", "Mato Grosso"),
        ("MS", "Mato Grosso do Sul"),
        ("MG", "Minas Gerais"),
        ("PA", "Pará"),
        ("PB", "Paraíba"),
        ("PR", "Paraná"),
        ("PE", "Pernambuco"),
        ("PI", "Piauí"),
        ("RJ", "Rio de Janeiro"),
        ("RN", "Rio Grande do Norte"),
        ("RS", "Rio Grande do Sul"),
        ("RO", "Rondônia"),
        ("RR", "Roraima"),
        ("SC", "Santa Catarina"),
        ("SP", "São Paulo"),
        ("SE", "Sergipe"),
        ("TO", "Tocantins")
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'cro', 'cro_state', 'sex']

    objects = DentistManager()

    first_name = CharField('Nome', max_length=50)
    last_name = CharField('Sobrenome', max_length=50)
    email = EmailField('Email', max_length=255, unique=True)
    phone = CharField('Telefone', max_length=14, null=True, blank=True, unique=True)
    cro = CharField('CRO', max_length=15)
    cro_state = CharField('Estado Emissor', max_length=2, choices=CRO_STATE_OPTIONS)
    sex = models.CharField('Sexo', max_length=1, choices=SEX_TYPES)
    is_active = BooleanField('Ativo', default=True)
    is_admin = BooleanField('Admin', default=False)
    is_superuser = BooleanField('Super Usuário', default=False)
    device_token = CharField('Token do dispositivo', max_length=255, default=None, null=True)
    amil_username = CharField('Usuário AMIL', max_length=255, default=None, null=True)
    amil_password = CharField('Senha AMIL', max_length=255, default=None, null=True)

    def get_full_name(self):
        return self.first_name + " " + self.last_name

    def get_short_name(self):
        return self.first_name

    def get_sex_prefix(self):
        return 'Dr.' if self.sex == 'M' else 'Dra.'
