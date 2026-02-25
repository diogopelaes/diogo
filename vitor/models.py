from django.db import models
from django.contrib.auth.models import User
from datetime import datetime, date, timedelta
from math import trunc
from statistics import mean
from django.core.validators import MinValueValidator, MaxValueValidator
# from cloudinary.models import CloudinaryField
from django.db.models import Q


def data_criar(periodo_letivo=date.today().year):
    bimestre = qual_bimestre(date.today(), periodo_letivo)
    bimestres = Bimestres.objects.filter(periodo_letivo=periodo_letivo)
    if bimestres.exists():
        bimestres = bimestres[0]
        if bimestre != '-':
            bimestre = int(bimestre)
            for i in range(1, bimestre + 1):
                pode_digitar = bimestres.getvalues(f'pode_digitar_faltas_{i}bi')
                if pode_digitar is not None:
                    if pode_digitar >= date.today():
                        return bimestres.getvalues(f'inicio_{i}bi')
    return None


def qual_bimestre(data, periodo_letivo=date.today().year):
    bimestres = Bimestres.objects.filter(pk=periodo_letivo)
    if bimestres.exists():
        bimestres = bimestres[0]
        for i in '1234':
            inicio = bimestres.getvalues(f'inicio_{i}bi')
            fim = bimestres.getvalues(f'fim_{i}bi')
            if inicio is not None and fim is not None:
                if inicio <= data <= fim:
                    return i
    return '-'


class Escola(models.Model):
    nome = models.CharField(default='', max_length=100)
    sigla = models.CharField(default='', max_length=20)
    logadouro = models.CharField(default='', max_length=100)
    numero = models.CharField(default='', max_length=5)
    bairro = models.CharField(default='', max_length=100)
    cidade = models.CharField(default='', max_length=100)
    estado = models.CharField(default='', max_length=20)
    cep = models.CharField(default='', max_length=10)
    complemento = models.CharField(default='', max_length=100)
    telefone = models.CharField(default='', max_length=15)
    email = models.CharField(default='', max_length=50)
    site = models.CharField(default='', max_length=100)


class Pix(models.Model):
    escola = models.OneToOneField(Escola, on_delete=models.CASCADE)
    qr_code_url = models.CharField(default='', null=False, blank=False, max_length=500)
    qr_code = models.ImageField(upload_to='pix/', blank=True, null=True)
    code = models.CharField(default='', null=False, blank=False, max_length=500)


class Curso(models.Model):
    escola = models.ForeignKey(Escola, on_delete=models.CASCADE)
    nome = models.CharField(max_length=100, null=False, blank=False)
    sigla = models.CharField(max_length=20, null=False, blank=False)
    is_active = models.BooleanField(default=True, null=False, blank=False)

    def turmas(self):
        return Turma.objects.filter(curso_id=self.id, is_active=True).order_by('-periodo_letivo', 'ano', 'letra')

    def __str__(self):
        return self.nome


class Turma(models.Model):
    ano = models.IntegerField(null=False, blank=False)
    letra = models.CharField(max_length=1, null=False, blank=False)
    periodo_letivo = models.IntegerField(null=False, blank=False)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='curso')
    is_active = models.BooleanField(default=True, null=False, blank=False)
    turno = models.IntegerField(default=0, null=False,
                                blank=False)  # 1: Matutino, 2: vepertino, 3: noturno, 4: integral
    conselho_feito = models.CharField(default='', max_length=10, null=True, blank=True)
    data_conselho1 = models.DateField(null=True, blank=True)
    data_conselho2 = models.DateField(null=True, blank=True)
    data_conselho3 = models.DateField(null=True, blank=True)
    data_conselho4 = models.DateField(null=True, blank=True)
    data_conselho5 = models.DateField(null=True, blank=True)
    obs_gerais1 = models.TextField(default='')
    obs_gerais2 = models.TextField(default='')
    obs_gerais3 = models.TextField(default='')
    obs_gerais4 = models.TextField(default='')
    obs_gerais5 = models.TextField(default='')

    def display_turno(self):
        turnos = {
            1: 'matutino',
            2: 'vespertino',
            3: 'noturno',
            4: 'integral'
        }
        if self.turno in turnos:
            return turnos[self.turno]
        return None

    def getconselho_feito(self):
        return list(map(int, self.conselho_feito.split(',')))

    def setconselho_feito(self, bimestre):
        if str(bimestre) not in self.conselho_feito:
            if self.conselho_feito:
                self.conselho_feito += ',' + str(bimestre)
            else:
                self.conselho_feito = str(bimestre)
        setattr(self, 'data_conselho' + str(bimestre), datetime.now())
        self.save()

    def getdataconselho(self, bimestre):
        return getattr(self, 'data_conselho' + str(bimestre))

    def setdataconselho(self, bimestre):
        setattr(self, 'data_conselho' + str(bimestre), datetime.date.today())
        self.save()
        return None

    def getobsgerais(self, bimestre):
        return getattr(self, 'obs_gerais'+str(bimestre))

    def setobsgerais(self, bimestre, obs):
        setattr(self, 'obs_gerais' + str(bimestre), obs)
        self.save()
        return None

    def status(self):
        if self.is_active:
            return 'Ativa'
        return 'Inativa'

    def pode_editar(self):
        lista_bi = list()
        for bimestre in '12345':
            for disciplina in Disciplina.objects.filter(turma_id=self.id):
                if disciplina.pode_editar_dis(bimestre):
                    lista_bi.append(int(bimestre))
                    break
        return lista_bi

    def get_ver_boletim(self):
        return ControleDigitar.objects.get(pk=self.periodo_letivo).get_aluno_pode_ver()

    def __str__(self):
        titulo = f'{self.ano}º Ano {self.letra} - {self.curso.sigla} - {self.periodo_letivo}'
        return titulo

    def str_curta(self):
        return f'{self.ano}º {self.letra} - {self.curso.sigla}'


class DadosProf(models.Model):
    prof = models.OneToOneField(User, on_delete=models.CASCADE)
    disciplinas = models.CharField(max_length=300)

    def getdisciplinas_ids(self):
        return list(map(int, self.disciplinas.split(',')))
        # try:
        #     return list(map(int, self.disciplinas.split(',')))
        # except ValueError:
        #     print(f'Prof: {self.prof.first_name}, Disciplinas: {self.disciplinas == ""}')
        #     return list()

    def getnomedisciplinas(self):
        nomes = ''
        f = self.disciplinas.split(',').copy()
        try:
            f.remove('')
        except ValueError:
            pass
        for nome_id in list(map(int, f)):
            nomes += NomeDisciplinas.objects.get(id=nome_id).nome + ', '
        if nomes:
            nomes = nomes[:-2]
        return nomes

    def getsigladisciplinas(self):
        nomes = ''
        f = self.disciplinas.split(',').copy()
        try:
            f.remove('')
        except ValueError:
            pass
        for nome_id in list(map(int, f)):
            nomes += NomeDisciplinas.objects.get(id=nome_id).sigla + ', '
        if nomes:
            nomes = nomes[:-2]
        return nomes

    def disciplinas_prof(self):
        return [NomeDisciplinas.objects.get(id=i) for i in self.getdisciplinas_ids()]


class NomeDisciplinas(models.Model):
    nome = models.CharField(max_length=100, unique=True, null=False, blank=False)
    sigla = models.CharField(default='', max_length=20)

    def profs(self):
        lista = list()
        for dadosprof in DadosProf.objects.filter(~Q(disciplinas="")).order_by('prof__first_name'):
            if self.id in dadosprof.getdisciplinas_ids():
                lista.append(dadosprof)
        return lista

    def width(self):
        return len(self.nome)


class Disciplina(models.Model):
    nome = models.ForeignKey(NomeDisciplinas, on_delete=models.CASCADE, null=True, blank=True)
    tem_nota = models.BooleanField(default=True, null=False, blank=False)
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name='turma')
    total_aulas_b1 = models.IntegerField(default=0)
    total_aulas_b2 = models.IntegerField(default=0)
    total_aulas_b3 = models.IntegerField(default=0)
    total_aulas_b4 = models.IntegerField(default=0)
    total_aulas_b5 = models.IntegerField(default=0)
    aulas_previstas_b1 = models.IntegerField(default=0)
    aulas_previstas_b2 = models.IntegerField(default=0)
    aulas_previstas_b3 = models.IntegerField(default=0)
    aulas_previstas_b4 = models.IntegerField(default=0)
    aulas_previstas_b5 = models.IntegerField(default=0)

    def set_tem_nota(self, lista):
        self.tem_nota = str(self.nome.id) in lista
        self.save()
        return None

    def getaulasdadas(self, bimestre):
        if bimestre == 5:
            self.total_aulas_b5 = self.total_aulas_b1 + self.total_aulas_b2 + self.total_aulas_b3 + self.total_aulas_b4
            self.save()
        else:
            bimestres = Bimestres.objects.get(pk=self.turma.periodo_letivo)
            inicio = bimestres.getvalues(f'inicio_{bimestre}bi')
            fim = bimestres.getvalues(f'fim_{bimestre}bi')
            if inicio is not None and fim is not None:
                total = sum(AulasDadas.objects.filter(disciplina_id=self.id, dia__lte=fim, dia__gte=inicio).values_list('n_aulas', flat=True))
                setattr(self, 'total_aulas_b' + str(bimestre), total)
            else:
                setattr(self, 'total_aulas_b' + str(bimestre), 0)
            self.save()
        return getattr(self, 'total_aulas_b' + str(bimestre))

    def getaulasdadas1(self):
        return self.getaulasdadas(1)

    def getaulasdadas2(self):
        return self.getaulasdadas(2)

    def getaulasdadas3(self):
        return self.getaulasdadas(3)

    def getaulasdadas4(self):
        return self.getaulasdadas(4)

    def getaulasdadas5(self):
        return self.getaulasdadas(5)

    def setaulasdadas(self, bimestre, aulas):
        if aulas is None or aulas == '':
            setattr(self, 'total_aulas_b' + str(bimestre), 0)
        else:
            setattr(self, 'total_aulas_b' + str(bimestre), int(aulas))
        self.save()

    def pode_editar_dis(self, bimestre):
        controle = ControleDigitar.objects.get(pk=self.turma.periodo_letivo)
        if getattr(controle, 'pode_editar_b' + str(bimestre)):
            return True
        inicio = getattr(controle, 'data_inicio_' + str(bimestre))
        fim = getattr(controle, 'data_fim_' + str(bimestre))
        if inicio is not None and fim is not None:
            return (fim >= datetime.now().date() >= inicio)
        if inicio is not None:
            return datetime.now().date() >= inicio
        if fim is not None:
            return fim >= datetime.now().date()
        return False

    def pode_editar_1(self):
        return self.pode_editar_dis('1')

    def pode_editar_2(self):
        return self.pode_editar_dis('2')

    def pode_editar_3(self):
        return self.pode_editar_dis('3')

    def pode_editar_4(self):
        return self.pode_editar_dis('4')

    def pode_editar_5(self):
        return self.pode_editar_dis('5')

    def set_aulasprevistas(self, bimestre, value):
        if value:
            setattr(self, 'aulas_previstas_b' + str(bimestre), int(value))
            self.save()

    def get_aulasprevistas(self, bimestre):
        if int(bimestre) == 5:
            self.set_aulasprevistas(bimestre, self.aulas_previstas_b1 + self.aulas_previstas_b2 + self.aulas_previstas_b3 + self.aulas_previstas_b4)
        return getattr(self, 'aulas_previstas_b' + str(bimestre))

    def get_aulasprevistas1(self):
        return self.get_aulasprevistas(1)

    def get_aulasprevistas2(self):
        return self.get_aulasprevistas(2)

    def get_aulasprevistas3(self):
        return self.get_aulasprevistas(3)

    def get_aulasprevistas4(self):
        return self.get_aulasprevistas(4)

    def get_aulasprevistas5(self):
        return self.get_aulasprevistas(5)

    def __str__(self):
        titulo = f'{self.nome.nome} - {self.turma}'
        return titulo

    def sigla(self):
        titulo = f'{self.nome.sigla} - {self.turma}'
        return titulo


class Prof_Disciplina(models.Model):
    professor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='professor')
    disciplina = models.ForeignKey(Disciplina, on_delete=models.CASCADE, related_name='disciplina')
    is_active = models.BooleanField(default=True, blank=False)

    def __str__(self):
        titulo = f'{self.professor.first_name} - {self.disciplina}'
        return titulo

    def atuando(self):
        if self.is_active:
            res = 'Sim'
        else:
            res = 'Não'
        return res

    def str_curta(self):
        return f'{self.disciplina.turma.str_curta()} - {self.disciplina.nome.sigla}'


class Avaliacao(models.Model):
    prof_disciplina = models.ForeignKey(Prof_Disciplina, on_delete=models.CASCADE)
    data_av = models.DateField(default=None, null=True, blank=True)
    descricao = models.TextField(default='', editable=True, null=True, blank=True)
    titulo = models.CharField(default='', max_length=50, null=False, blank=False)
    peso = models.IntegerField(default=1, null=False, blank=False)
    tipo = models.IntegerField(default=0, null=False, blank=False)  # 0: média, 1: soma
    aluno_pode_ver_nota = models.BooleanField(default=False, blank=False)

    def pode_editar(self):
        _, pode = Bimestres.objects.get(pk=self.data_av.year).verifica_pode_digitar(self.data_av)
        return pode

    def bimestre(self):
        return qual_bimestre(self.data_av, self.prof_disciplina.disciplina.turma.periodo_letivo)

    def display_tipo(self):
        if self.tipo:
            return f'Soma'
        return f'Peso: {self.peso}'

    def display_peso(self):
        if self.tipo:
            return f'Soma'
        return str(self.peso)

    def __str__(self):
        if self.tipo:
            return f'Data: {self.data_av}\nTurma: {self.prof_disciplina.disciplina}\nTítulo: {self.titulo}\n Soma na média'
        return f'Data: {self.data_av}\nTurma: {self.prof_disciplina.disciplina}\nTítulo: {self.titulo}\nPeso: {self.peso}'


class Aluno_Turma(models.Model):
    STATUS_CHOICES = (
        ('1', 'Cursando'),
        ('2', 'Promovido'),
        ('3', 'Promovido pelo conselho'),
        ('4', 'Retido'),
        ('5', 'Transferido'),
        ('6', 'Remanejado'),
        ('7', 'Abandono')
    )
    aluno = models.ForeignKey(User, on_delete=models.CASCADE, related_name='aluno')
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name='aluno_turma')
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='1', blank=False, null=False)
    nchamada = models.IntegerField(null=False, blank=False)
    conselho_feito = models.CharField(default='', max_length=10, null=True, blank=True)#lista string separado com vígula
    dt_saida = models.DateField(default=None, null=True, blank=True)
    dt_entrada = models.DateField(default=None, null=True, blank=True)

    def controle_faltas(self, inicio=date.today()+timedelta(-15), fim=date.today()):
        if self.status in '5,6,7':
            if self.dt_saida is not None:
                fim = min(fim, self.dt_saida)
        dias_ad = AulasDadas.objects.filter(disciplina__turma_id=self.turma_id, dia__lte=fim, dia__gte=inicio).order_by('dia').values_list('dia', flat=True).distinct()
        dias_faltas = Faltas.objects.filter(aluno_turma_id=self.id, dia__lte=fim, dia__gte=inicio).order_by('dia').values_list('dia', flat=True).distinct()
        return dias_ad, dias_faltas

    def teste_matriculado(self, dia):
        if self.dt_saida is not None:
            return self.dt_entrada <= dia < self.dt_saida
        return self.dt_entrada <= dia


    # def data_entrada(self):
    #     if self.dt_entrada is None:
    #         return DadosAluno.objects.get(pk=self.aluno).dmatricula
    #     return self.dt_entrada

    # def teste_data_entrada(self):
    #     data = self.data_entrada()
    #     return data is not None, data

    def bimestre_matricula(self):
        bimestres = Bimestres.objects.get(pk=self.turma.periodo_letivo)
        for bim in [1, 2, 3, 4]:
            if self.dt_entrada < bimestres.getvalues(f'fim_{bim}bi'):
                return bim
        return 0  # nenhum bimestre

    def data_saida(self):
        if self.dt_saida is None and self.status != '1':
            return DadosAluno.objects.get(pk=self.aluno).dtr
        return self.dt_saida

    # def teste_data_saida(self):
    #     dtr = self.data_saida()
    #     return dtr is not None, dtr

    def aluno_turmas(self):
        return Aluno_Turma.objects.filter(aluno_id=self.aluno.id, turma__curso_id=self.turma.curso.id).order_by('turma__periodo_letivo')

    def getconselho_feito(self):
        return list(map(int, self.conselho_feito.split(',')))

    def setconselho_feito(self, bimestre):
        if str(bimestre) not in self.conselho_feito:
            if self.conselho_feito:
                self.conselho_feito += ',' + str(bimestre)
            else:
                self.conselho_feito = str(bimestre)
        self.save()

    def setnchamada(self, n):
        self.nchamada = n
        self.save()

    def criar_boletim(self):
        for disciplina in Disciplina.objects.filter(turma_id=self.turma.id):
            for bimestre in [1, 2, 3, 4, 5]:
                if not Boletim.objects.filter(aluno_turma_id=self.id, disciplina_id=disciplina.id, bimestre=bimestre).exists():
                    Boletim.objects.create(aluno_turma_id=self.id, disciplina_id=disciplina.id, bimestre=bimestre)

    def excluir(self):
        for disciplina in Disciplina.objects.filter(turma_id=self.turma.id):
            Boletim.objects.filter(aluno_turma_id=self.id, disciplina_id=disciplina.id).delete()
        self.delete()

    def setstatus(self, choice, options=dict(STATUS_CHOICES)):
        if not choice.isdigit():
            for k, v in options.items():
                if choice == v:
                    self.status = k
                    break
        else:
            self.status = choice
        if self.status in '4,5,6,7,8,9':
            self.conselho_feito = '1,2,3,4,5'
        if self.status == '1':
            self.dt_saida = None
        elif self.status in '2,3,4':
            bimestres = Bimestres.objects.get(pk=self.turma.periodo_letivo)
            try:
                self.dt_saida = bimestres.getvalues(f'fim_4bi')
            except:
                pass
        elif self.status != '1' and self.dt_saida is None:
            self.dt_saida = date.today()
        self.save()

    def atualizastatus(self, bimestre):
        if self.status not in ['1', '2', '3', '4']:
            return None
        if str(bimestre) in self.conselho_feito:
            if bimestre == 5:
                boletins = Boletim.objects.filter(aluno_turma_id=self.id, disciplina__tem_nota=True)
                if boletins.filter(nota=None).exists():
                    self.setstatus('1')
                    return None
                cont = boletins.filter(bimestre=bimestre, nota__lt=6.0).count()
                if cont == 0:
                    self.setstatus('2')
                    return None
                if 0 < cont < 4:
                    self.setstatus('3')
                    return None
                self.setstatus('4')
                return None
            if bimestre == 4:
                boletins = Boletim.objects.filter(aluno_turma_id=self.id, disciplina__tem_nota=True)
                if boletins.filter(nota=None).exists():
                    self.setstatus('1')
                    return None
                for boletim in boletins.filter(bimestre=5):
                    if boletim.getnota() < 6:
                        self.setstatus('1')
                        return None
                self.setstatus('2')
                self.setconselho_feito(5)
                return None
        self.setstatus('1')
        return None

    # def get_dados(self):
    #     return DadosAluno.objects.get(aluno_id=self.aluno.id)

    def getstatus(self, options=dict(STATUS_CHOICES)):
        return options[self.status]

    def __str__(self):
        titulo = f'{self.aluno.first_name} - {self.turma}'
        return titulo

    def choices(self, options=dict(STATUS_CHOICES)):
        return list(options.values())

    def baixo_rendimento(self, bimestre):
        res = ''
        boletins = Boletim.objects.filter(aluno_turma_id=self.id, bimestre=bimestre).order_by('disciplina__nome')
        if not boletins.exists():
            return ''
        lista = list()
        for boletim in boletins:
            if type(boletim.nota) == float or type(boletim.nota) == int:
                if boletim.nota < 6:
                    lista.append(boletim.disciplina.nome.sigla)
        if lista:
            lista.sort()
            for i in lista[:-1]:
                res += i + ', '
            if len(lista) == 1:
                res = lista[0] + '.'
            else:
                res = f'{res[:-2]} e {lista[-1]}.'
        return res

    def baixo_rendimento1(self):
        return self.baixo_rendimento(1)

    def baixo_rendimento2(self):
        return self.baixo_rendimento(2)

    def baixo_rendimento3(self):
        return self.baixo_rendimento(3)

    def baixo_rendimento4(self):
        return self.baixo_rendimento(4)

    def baixo_rendimento5(self):
        return self.baixo_rendimento(5)


class Notas_Av(models.Model):
    av = models.ForeignKey(Avaliacao, on_delete=models.CASCADE)
    aluno_turma = models.ForeignKey(Aluno_Turma, on_delete=models.CASCADE)
    data_atu = models.DateTimeField(default=None, null=False, blank=False)
    nota = models.FloatField(default=None, null=True, blank=True,
                             validators=[MaxValueValidator(10), MinValueValidator(0)])

    def setnota(self, nota):
        if type(nota) == float:
            self.nota = round(nota, 1)
        elif nota in ['0,0', '0,1', '0,2', '0,3', '0,4', '0,5', '0,6', '0,7', '0,8', '0,9', '1,0', '1,1', '1,2', '1,3',
                    '1,4', '1,5', '1,6', '1,7', '1,8', '1,9', '2,0', '2,1', '2,2', '2,3', '2,4', '2,5', '2,6', '2,7',
                    '2,8', '2,9', '3,0', '3,1', '3,2', '3,3', '3,4', '3,5', '3,6', '3,7', '3,8', '3,9', '4,0', '4,1',
                    '4,2', '4,3', '4,4', '4,5', '4,6', '4,7', '4,8', '4,9', '5,0', '5,1', '5,2', '5,3', '5,4', '5,5',
                    '5,6', '5,7', '5,8', '5,9', '6,0', '6,1', '6,2', '6,3', '6,4', '6,5', '6,6', '6,7', '6,8', '6,9',
                    '7,0', '7,1', '7,2', '7,3', '7,4', '7,5', '7,6', '7,7', '7,8', '7,9', '8,0', '8,1', '8,2', '8,3',
                    '8,4', '8,5', '8,6', '8,7', '8,8', '8,9', '9,0', '9,1', '9,2', '9,3', '9,4', '9,5', '9,6', '9,7',
                    '9,8', '9,9', '10,0', '0', '0,', '1', '1,', '2', '2,', '3', '3,', '4', '4,', '5', '5,', '6', '6,',
                    '7', '7,', '8', '8,', '9', '9,', '10', '10,']:
            self.nota = float(nota.replace(',', '.').replace(' ', ''))
        else:
            self.nota = None
        self.data_atu = date.today()
        self.save()

    def getnota(self):
        return self.nota


class Document(models.Model):
    docfile = models.FileField(upload_to='documents/%Y/%m/%d')


class ControleDigitar(models.Model):
    periodo_letivo = models.IntegerField(primary_key=True, null=False, blank=False)
    pode_editar_b1 = models.BooleanField(default=False, blank=False)
    pode_editar_b2 = models.BooleanField(default=False, blank=False)
    pode_editar_b3 = models.BooleanField(default=False, blank=False)
    pode_editar_b4 = models.BooleanField(default=False, blank=False)
    pode_editar_b5 = models.BooleanField(default=False, blank=False)
    data_inicio_1 = models.DateField(default=None, null=True, blank=True)
    data_fim_1 = models.DateField(default=None, null=True, blank=True)
    data_inicio_2 = models.DateField(default=None, null=True, blank=True)
    data_fim_2 = models.DateField(default=None, null=True, blank=True)
    data_inicio_3 = models.DateField(default=None, null=True, blank=True)
    data_fim_3 = models.DateField(default=None, null=True, blank=True)
    data_inicio_4 = models.DateField(default=None, null=True, blank=True)
    data_fim_4 = models.DateField(default=None, null=True, blank=True)
    data_inicio_5 = models.DateField(default=None, null=True, blank=True)
    data_fim_5 = models.DateField(default=None, null=True, blank=True)
    aluno_pode_ver_bimestre = models.IntegerField(default=0, null=False, blank=False)
    data_aluno_pode_ver_bi1 = models.DateField(default=None, null=True, blank=True)
    data_aluno_pode_ver_bi2 = models.DateField(default=None, null=True, blank=True)
    data_aluno_pode_ver_bi3 = models.DateField(default=None, null=True, blank=True)
    data_aluno_pode_ver_bi4 = models.DateField(default=None, null=True, blank=True)
    data_aluno_pode_ver_bi5 = models.DateField(default=None, null=True, blank=True)

    def setvalor(self, key, valor):
        setattr(self, key, valor)
        self.save()

    def getinicio(self, bimestre):
        return getattr(self, 'data_inicio_' + str(bimestre))

    # def setinicio(self, bimestre, valor):
    #     if valor:
    #         valor = datetime.strptime(valor, '%Y-%m-%d').date()
    #         return setattr(self, 'data_inicio_'+str(bimestre), valor)
    #     else:
    #         return setattr(self, 'data_inicio_' + str(bimestre), None)

    def getfim(self, bimestre):
        return getattr(self, 'data_fim_' + str(bimestre))

    def setfim(self, bimestre, valor):
        if valor:
            valor = datetime.strptime(valor, '%Y-%m-%d').date()
            return setattr(self, 'data_fim_' + str(bimestre), valor)
        else:
            return setattr(self, 'data_fim_' + str(bimestre), None)

    def getpodeeditar(self, bimestre):
        return getattr(self, 'pode_editar_b' + str(bimestre))

    # def setpodeeditar(self, bimestre, valor):
    #     return setattr(self, 'pode_editar_b'+str(bimestre), valor)

    def get_aluno_pode_ver(self):
        pode_ver = 0
        for bi in reversed(range(1, 6)):
            dia = getattr(self, 'data_aluno_pode_ver_bi' + str(bi))
            if dia is not None:
                if dia <= date.today():
                    pode_ver = bi
                    break
        return max(self.aluno_pode_ver_bimestre, pode_ver)

    def set_aluno_pode_ver(self, bimestre):
        self.aluno_pode_ver_bimestre = int(bimestre)
        self.save()

    def get_data_aluno_pode_ver(self, bimestre):
        return getattr(self, 'data_aluno_pode_ver_bi'+str(bimestre))

    def set_data_aluno_pode_ver(self, bimestre, valor):
        if valor:
            valor = datetime.strptime(valor, '%Y-%m-%d').date()
            return setattr(self, 'data_aluno_pode_ver_bi'+str(bimestre), valor)
        else:
            return setattr(self, 'data_aluno_pode_ver_bi'+str(bimestre), None)


class Obs(models.Model):
    periodo_letivo = models.IntegerField(null=False, blank=False)
    obs = models.CharField(max_length=100)
    n = models.IntegerField(default=0, null=False, blank=False)
    is_active = models.BooleanField(default=True, null=False, blank=False)

    def set_obs(self, text):
        self.obs = text
        self.save()

    def excluir(self):
        self.delete()


def media(disciplina_id, aluno_turma_id):
    notas = list()
    for bimestre in range(1, 5):
        boletim = Boletim.objects.get(disciplina_id=disciplina_id, aluno_turma_id=aluno_turma_id, bimestre=bimestre)
        if boletim.nota is not None:
            notas.append(boletim.nota)
    if notas:
        n5 = mean(notas)
        t = trunc(n5)
        if n5 < t + 0.25:
            n5 = t
        elif n5 < t + 0.75:
            n5 = t + 0.5
        else:
            n5 = t + 1
        return float(n5)
    return None


class Boletim(models.Model):
    disciplina = models.ForeignKey(Disciplina, on_delete=models.CASCADE)
    aluno_turma = models.ForeignKey(Aluno_Turma, on_delete=models.CASCADE)
    bimestre = models.IntegerField(null=True, blank=True)
    nota = models.FloatField(null=True, blank=True, validators=[MaxValueValidator(10), MinValueValidator(0)])
    faltas = models.IntegerField(null=True, blank=True)
    obs = models.CharField(default='', max_length=200) # lista com ids
    digitador = models.ForeignKey(User, null=True, blank=True,  on_delete=models.CASCADE)
    atualizado = models.DateField(default=None, null=True, blank=True)
    auto = models.BooleanField(default=True, blank=False)

    def deleteobs(self, obs_id):
        obs_id = str(obs_id)
        if self.obs:
            obs_list = self.obs.split(',')
            if obs_id in obs_list:
                obs_list.remove(obs_id)
            new_obs = ''
            for i in obs_list:
                new_obs += i + ','
            if new_obs:
                new_obs = new_obs[:-1]
            self.obs = new_obs
            self.save()

    def setobs(self, obs_id):
        obs_id = str(obs_id).replace(' ', '').replace('[', '').replace(']', '').replace(',', '')
        if self.obs:
            if ',' in self.obs:
                if obs_id in self.obs.split(','):
                    return obs_id
            elif obs_id == self.obs:
                return obs_id
            self.obs += ',' + obs_id
        else:
            self.obs = obs_id
        self.save()
        return obs_id


    def getobs(self):
        if self.obs:
            return sorted(list(map(int, self.obs.split(','))))
        return list()

    def setnota(self, nota):
        if nota:
            self.nota = float(nota.replace(',', '.'))
            if self.bimestre == 5:
                if self.nota > media(self.disciplina_id, self.aluno_turma_id):
                    self.auto = False
                else:
                    self.nota = media(self.disciplina_id, self.aluno_turma_id)
                    self.auto = True
        else:
            self.nota = None
        self.atualizado = date.today()
        self.save()

    def getnota(self):
        if self.bimestre == 5 and self.auto:
            self.nota = media(self.disciplina_id, self.aluno_turma_id)
            self.save()
        return self.nota

    def setfaltas(self, faltas):
        if faltas:
            self.faltas = int(faltas)
        else:
            self.faltas = None
        self.atualizado = date.today()
        self.save()

    def getfaltas(self):
        if self.bimestre == 5:
            soma = 0
            for bimestre in range(1, 5):
                boletim = Boletim.objects.get(disciplina_id=self.disciplina_id, aluno_turma_id=self.aluno_turma_id,
                                              bimestre=bimestre)
                if boletim.faltas is not None:
                    soma += boletim.faltas
            self.faltas = int(soma)
            self.save()
            return self.faltas
        bimestre = self.bimestre
        bimestres = Bimestres.objects.get(pk=self.disciplina.turma.periodo_letivo)
        if self.aluno_turma.dt_entrada >= bimestres.getvalues(f'fim_{bimestre}bi'):
            return self.faltas
        inicio = bimestres.getvalues(f'inicio_{bimestre}bi')
        fim = bimestres.getvalues(f'fim_{bimestre}bi')
        if inicio is not None and fim is not None:
            faltas = Faltas.objects.filter(disciplina_id=self.disciplina.id, aluno_turma_id=self.aluno_turma.id,
                                           dia__lte=fim, dia__gte=inicio)
            self.faltas = len(faltas.values_list('aula', flat=True))
            atualizado = faltas.order_by('-atualizado').values_list('atualizado', flat=True)
            if atualizado.exists() and self.atualizado is not None:
                if atualizado[0] > self.atualizado:
                    self.atualizado = atualizado[0]
        else:
            self.faltas = None
        self.save()
        return self.faltas


class DadosBoletim:
    def __init__(self, disciplina, boletins, pode_ver):
        if boletins.exists():
            self.aluno_turma = boletins[0].aluno_turma
        def nota_parcial(notas):
            if notas:
                n5 = mean(notas)
                t = trunc(n5)
                if n5 < t + 0.25:
                    n5 = t
                elif n5 < t + 0.75:
                    n5 = t + 0.5
                else:
                    n5 = t + 1
                return float(n5)
            return None

        self.disciplina = disciplina
        self.prof = list()
        notas = list()
        faltas_pacrial = 0
        ads_parcial = 0
        if pode_ver < 4:
            bimestre_limite = pode_ver + 2
        else:
            bimestre_limite = pode_ver + 1
        for bimestre in range(1, bimestre_limite):
            bi = str(bimestre)
            boletim = boletins.filter(disciplina_id=disciplina.id, bimestre=bimestre)
            if not boletim.exists():
                self.aluno_turma.criar_boletim()
                boletim = boletins.filter(disciplina_id=disciplina.id, bimestre=bimestre)
            boletim = boletim[0]
            nota = boletim.getnota()
            if nota is not None:
                notas.append(nota)
                setattr(self, 'n' + bi, nota)
            faltas = boletim.getfaltas()
            if faltas is not None:
                faltas_pacrial += faltas
                setattr(self, 'f' + bi, faltas)
            ad = disciplina.getaulasdadas(bimestre)
            if ad is not None:
                ads_parcial += ad
                setattr(self, 'ad' + bi, ad)
            # Aqui!
            obs_list = [Obs.objects.get(id=obs_id).obs for obs_id in boletim.getobs()]
            setattr(self, 'obs' + bi, obs_list)
            # Fim Aqui
            if boletim.digitador is not None:
                if boletim.digitador.primeiro_nome() not in self.prof:
                    self.prof.append(boletim.digitador.primeiro_nome())
        if 0 < pode_ver < 5:
            self.n5 = nota_parcial(notas)
            self.f5 = faltas_pacrial
            self.ad5 = ads_parcial

    def freq_baixa(self, bimestre):
        bimestre = str(bimestre)
        try:
            faltas = getattr(self, 'f' + bimestre)
            ad = getattr(self, 'ad' + bimestre)
        except AttributeError:
            return False
        if faltas is not None and ad is not None and ad != 0:
            return faltas/ad > 0.25
        return False

    def freq_baixa1(self):
        return self.freq_baixa(1)

    def freq_baixa2(self):
        return self.freq_baixa(2)

    def freq_baixa3(self):
        return self.freq_baixa(3)

    def freq_baixa4(self):
        return self.freq_baixa(4)

    def freq_baixa5(self):
        return self.freq_baixa(5)


class ObsConselho(models.Model):
    aluno_turma = models.ForeignKey(Aluno_Turma, on_delete=models.CASCADE)
    bimestre = models.IntegerField()
    obs = models.TextField(default='')

    def setobs(self, obs):
        self.obs = obs
        self.save()


class DadosAluno(models.Model):
    aluno = models.OneToOneField(User, primary_key=True, on_delete=models.CASCADE)
    foto_url = models.CharField(max_length=500, default='', null=True, blank=True)
    foto = models.ImageField(upload_to='fotos/', blank=True, null=True)
    dn = models.DateField(default=None, null=True, blank=True)
    logradouro = models.CharField(max_length=100, default=None, null=True, blank=True)
    numero = models.CharField(max_length=5, default=None, null=True, blank=True)
    bairro = models.CharField(max_length=100, default=None, null=True, blank=True)
    cidade = models.CharField(max_length=50, default=None, null=True, blank=True)
    estado = models.CharField(max_length=20, default=None, null=True, blank=True)
    cep = models.CharField(max_length=10, default=None, null=True, blank=True)
    complemento = models.CharField(max_length=100, default=None, null=True, blank=True)
    escola_anterior = models.CharField(max_length=100, default=None, null=True, blank=True)
    rg = models.CharField(max_length=20, default=None, null=True, blank=True)
    cpf = models.CharField(max_length=20, default=None, null=True, blank=True)
    mae = models.CharField(max_length=50, default=None, null=True, blank=True)
    pai = models.CharField(max_length=50, default=None, null=True, blank=True)
    email1 = models.CharField(max_length=50, default=None, null=True, blank=True)
    email2 = models.CharField(max_length=50, default=None, null=True, blank=True)
    phone1 = models.CharField(max_length=50, default=None, null=True, blank=True)
    phone2 = models.CharField(max_length=50, default=None, null=True, blank=True)
    transporte = models.CharField(max_length=50, default=None, null=True, blank=True)
    linha = models.CharField(max_length=100, default=None, null=True, blank=True)
    autoimag = models.CharField(max_length=3, default='Não', null=True, blank=True)
    autosaida = models.CharField(max_length=3, default='Não', null=True, blank=True)
    bolsa_familia = models.CharField(max_length=3, default='Não', null=True, blank=True)
    tipo_sangue = models.CharField(max_length=3, default=None, null=True, blank=True)
    tablet = models.CharField(max_length=100, default='', null=True, blank=True)
    sus = models.CharField(max_length=100, default='', null=True, blank=True)
    dmatricula = models.DateField(default=None, null=True, blank=True)
    dtr = models.DateField(default=None, null=True, blank=True)
    drg = models.DateField(default=None, null=True, blank=True)
    rm = models.CharField(max_length=100, default='', null=True, blank=True)
    ee = models.CharField(max_length=20, default='', null=True, blank=True)
    rg_uf = models.CharField(max_length=20, default='', null=True, blank=True)
    irmao = models.CharField(max_length=50, default='', null=True, blank=True)
    ra_irmao = models.CharField(max_length=10, default='', null=True, blank=True)

    def display_dn(self):
        return str(self.dn)

    def display_dtr(self):
        return str(self.dtr)

    def display_drg(self):
        return str(self.drg)

    def display_dmatricula(self):
        if self.dmatricula is None:
            return ''
        return self.dmatricula.strftime('%Y-%m-%d')

    def getdata(self, atributo):
        if atributo == 'aluno':
            return self.aluno.first_name
        if atributo == 'irmao' and self.irmao is not None:
            return self.irmao
        return getattr(self, atributo)


class Faltas(models.Model):
    disciplina = models.ForeignKey(Disciplina, on_delete=models.CASCADE)
    aluno_turma = models.ForeignKey(Aluno_Turma, on_delete=models.CASCADE)
    dia = models.DateField(null=False, blank=False)
    atualizado = models.DateField(auto_now=True, null=False, blank=False)
    aula = models.IntegerField(default=0, null=True, blank=True)


class AulasDadas(models.Model):
    disciplina = models.ForeignKey(Disciplina, on_delete=models.CASCADE)
    dia = models.DateField(null=False, blank=False)
    atualizado = models.DateField(auto_now=True, null=False, blank=False)
    n_aulas = models.IntegerField(default=0, null=True, blank=True)

    def bimestre(self):
        return qual_bimestre(self.dia, self.disciplina.turma.periodo_letivo)

    # def bimestre(self):
    #     bimestres = Bimestres.objects.get(pk=self.disciplina.turma.periodo_letivo)
    #     for i in [1, 2, 3, 4]:
    #         if bimestres.getvalues(f'inicio_{i}bi') is not None and bimestres.getvalues(f'fim_{i}bi') is not None:
    #             if bimestres.getvalues(f'inicio_{i}bi') <= self.dia <= bimestres.getvalues(f'fim_{i}bi'):
    #                 return f'{i}'
    #     return '-'

    def pode_editar(self):
        _, pode = Bimestres.objects.get(pk=self.dia.year).verifica_pode_digitar(self.dia)
        return pode


class Verfaltas:
    def __init__(self, disciplina_id, aluno_turma_id, dia):
        self.disciplina_id = disciplina_id
        self.aluno_turma = Aluno_Turma.objects.get(id=aluno_turma_id)
        self.dia = dia
        dt_dia = datetime.strptime(dia, '%Y-%m-%d').date()
        self.atestado = Prontuarios.objects.filter(aluno_id=self.aluno_turma.aluno.id,
                                                   atestado=True,
                                                   atestado_fim__gte=dt_dia,
                                                   atestado_inicio__lte=dt_dia).exists()
    def getfaltas(self):
        faltas = Faltas.objects.filter(disciplina_id=self.disciplina_id, aluno_turma_id=self.aluno_turma.id, dia=self.dia)
        return [falta.aula for falta in faltas]


class Contudo(models.Model):
    disciplina = models.ForeignKey(Disciplina, on_delete=models.CASCADE)
    dia = models.DateField(null=False, blank=False)
    atualizado = models.DateField(auto_now=True, null=False, blank=False)
    descricao = models.TextField(default='', editable=True, null=True, blank=True)


class Bimestres(models.Model):
    periodo_letivo = models.IntegerField(primary_key=True)
    inicio_1bi = models.DateField(default=None, null=True, blank=True)
    inicio_2bi = models.DateField(default=None, null=True, blank=True)
    inicio_3bi = models.DateField(default=None, null=True, blank=True)
    inicio_4bi = models.DateField(default=None, null=True, blank=True)
    fim_1bi = models.DateField(default=None, null=True, blank=True)
    fim_2bi = models.DateField(default=None, null=True, blank=True)
    fim_3bi = models.DateField(default=None, null=True, blank=True)
    fim_4bi = models.DateField(default=None, null=True, blank=True)
    pode_digitar_faltas_1bi = models.DateField(default=None, null=True, blank=True)
    pode_digitar_faltas_2bi = models.DateField(default=None, null=True, blank=True)
    pode_digitar_faltas_3bi = models.DateField(default=None, null=True, blank=True)
    pode_digitar_faltas_4bi = models.DateField(default=None, null=True, blank=True)
    dias_nao_letivos = models.TextField(default='', editable=True, null=True, blank=True)
    sabados_letivos = models.TextField(default='', editable=True, null=True, blank=True)
    pode_ver_ocorrencias = models.BooleanField(default=False, blank=False)

    def pode_inserir_ocorrencias(self):
        return Ocorrencias.objects.filter(periodo_letivo=self.periodo_letivo, is_active=True).exists()

    def set_pode_ver_ocorrencias(self, x):
        self.pode_ver_ocorrencias = x
        self.save()

    def dias_letivos_pode_digitar_faltas(self):
        hoje = date.today() + timedelta(days=-1)
        dias_letivos = list()
        sabados = self.sabados_letivos.split(',')
        for bi in self.bimestres_pode_digitar_faltas():
            inicio = getattr(self, f'inicio_{bi}bi')
            fim = getattr(self, f'fim_{bi}bi')
            if fim is None:
                fim = hoje
            else:
                fim = min(hoje, getattr(self, f'fim_{bi}bi'))
            while inicio <= fim:
                inicio_str = inicio.strftime("%Y-%m-%d")
                if not (inicio_str in self.dias_nao_letivos or inicio.weekday() in [5, 6]) or inicio_str in sabados:
                    dias_letivos.append(inicio)
                inicio = inicio + timedelta(days=1)
        return dias_letivos

    def bimestre_dia(self, dia):  # Para notificação e analise de aulas sem registros
        bimestres = self.bimestres_definidos()
        if bimestres:
            for i in bimestres:
                if i != bimestres[-1]:
                    if self.getvalues(f'inicio_{i}bi') <= dia <= self.getvalues(f'inicio_{i + 1}bi'):
                        return i
                else:
                    if self.getvalues(f'inicio_{i}bi') <= dia <= self.getvalues(f'fim_{i}bi'):
                        return i
            if self.getvalues(f'inicio_{bimestres[0]}bi') > dia:
                return bimestres[0]
            if dia > self.getvalues(f'fim_{bimestres[-1]}bi'):
                return bimestres[-1]
        return 0

    def dias_letivos_pode_digitar_faltas_bimestre_hoje(self,
                                                       bimestre=0):  # Para notificação e analise de aulas sem registros
        hoje = date.today() + timedelta(days=-1)
        if bimestre == 0:
            bimestre = self.bimestre_dia(hoje)
            if bimestre == 0:
                return list()
        elif bimestre not in self.bimestres_definidos():
            return list()
        dias_letivos = list()
        sabados = self.sabados_letivos.split(',')
        inicio = getattr(self, f'inicio_{bimestre}bi')
        fim = min(hoje, getattr(self, f'fim_{bimestre}bi'))
        while inicio <= fim:
            inicio_str = inicio.strftime("%Y-%m-%d")
            if not (inicio_str in self.dias_nao_letivos or inicio.weekday() in [5, 6]) or inicio_str in sabados:
                dias_letivos.append(inicio)
            inicio = inicio + timedelta(days=1)
        return dias_letivos

    def bimestres_pode_digitar_faltas(self):
        bim = []
        hoje = date.today()
        for i in self.bimestres_definidos():
            data_pode = getattr(self, f'pode_digitar_faltas_{i}bi')
            if data_pode is None:
                bim.append(i)
                continue
            if hoje <= data_pode:
                bim.append(i)
        return bim

    def verifica_pode_digitar(self, dia):
        if type(dia) == str:
            dia = datetime.strptime(dia, '%Y-%m-%d').date()
        hoje = date.today()
        for i in '1234':
            inicio = getattr(self, f'inicio_{i}bi')
            fim = getattr(self, f'fim_{i}bi')
            pode = getattr(self, f'pode_digitar_faltas_{i}bi')
            if inicio is not None and fim is not None:
                if inicio <= dia <= fim:
                    if pode is not None:
                        if hoje <= pode:
                            return i, True
                        else:
                            return i, False
                    else:
                        return i, True
        return 0, False

    def setvalues(self, key, value):
        if value == '' or value is None:
            setattr(self, key, None)
        else:
            setattr(self, key, value)
        self.save()

    def getvalues(self, key):
        return getattr(self, key)

    def bimestres_definidos(self):
        return [i for i in [1, 2, 3, 4] if (self.getvalues(f'inicio_{i}bi') is not None and self.getvalues(f'fim_{i}bi') is not None)]


class Planejamento(models.Model):
    professor = models.ForeignKey(User, on_delete=models.CASCADE)
    nomedisciplina = models.ForeignKey(NomeDisciplinas, on_delete=models.CASCADE, null=True, blank=True)
    descricao = models.TextField(default='', editable=True, null=True, blank=True)
    titulo = models.CharField(default='', max_length=50, null=False, blank=False)
    inicio = models.DateField(default=None, null=True, blank=True)
    fim = models.DateField(default=None, null=True, blank=True)
    ano = models.IntegerField(null=False, blank=False)

    def bimestre(self):
        return qual_bimestre(self.inicio, self.inicio.year)


class Prontuarios(models.Model):
    aluno = models.ForeignKey(User, on_delete=models.CASCADE, related_name='aluno_prontuario')
    registrador = models.ForeignKey(User, on_delete=models.CASCADE)
    data_registro = models.DateTimeField(auto_now=True, null=False, blank=False)
    descricao = models.TextField(default='', editable=True, null=True, blank=True)
    titulo = models.CharField(default='', max_length=50, null=False, blank=False)
    atestado = models.BooleanField(default=False, null=True, blank=True)
    atestado_inicio = models.DateField(default=None, null=True, blank=True)
    atestado_fim = models.DateField(default=None, null=True, blank=True)
    ocorrencia_disciplinar = models.BooleanField(default=False, null=True, blank=True)
    atraso = models.IntegerField(default=None, null=True,
                                 blank=True)  # 0=entrada; 1=saida (respinsável atrasou para buscar)
    atraso_horario = models.DateTimeField(default=None, null=True, blank=True)
    data_ocorrencia = models.DateTimeField(default=None, null=True, blank=True)
    vinculado = models.IntegerField(default=None, null=True, blank=True)  # id de outro registro
    user_nao_visualizou_ocorrencia = models.TextField(default='all_admins', editable=True, null=True,
                                                      blank=True)  # ids separados por virgulas

    def all_user_nao_visualizou_ocorrencia(self):
        if self.user_nao_visualizou_ocorrencia == 'all_admins':
            self.user_nao_visualizou_ocorrencia = str(
                list(User.objects.filter(groups__name='Admin').values_list('id', flat=True))).replace(' ', '')[1:-1]
            self.save()
        try:
            return list(map(int, self.user_nao_visualizou_ocorrencia.split(',')))
        except ValueError:
            return []

    def pop_user_nao_visualizou_ocorrencia(self, user_id):
        list_of_users = self.all_user_nao_visualizou_ocorrencia()
        try:
            list_of_users.pop(list_of_users.index(user_id))
            self.user_nao_visualizou_ocorrencia = str(list_of_users).replace(' ', '')[1:-1]
            self.save()
        except ValueError:
            pass

    def tipo(self):
        if self.atraso is not None:
            return 'Atraso'
        if self.atestado:
            return 'Atestado'
        if self.ocorrencia_disciplinar:
            return 'Ocorrência'
        return 'Geral'

    def e_atraso(self):
        return self.atraso is not None

    def data_atraso(self):
        if self.atraso_horario is not None:
            return self.atraso_horario.strftime("%Y-%m-%d")
        return ''

    def horario_atraso(self):
        if self.atraso_horario is not None:
            return self.atraso_horario.strftime("%H:%M")
        return ''


class Vistos(models.Model):
    prof_disciplina = models.ForeignKey(Prof_Disciplina, on_delete=models.CASCADE)
    data_visto = models.DateField(default=None, null=True, blank=True)
    descricao = models.TextField(default='', editable=True, null=True, blank=True)
    titulo = models.CharField(default='', max_length=50, null=False, blank=False)
    tipo = models.CharField(default='', max_length=30, null=False, blank=False)
    aluno_pode_ver = models.BooleanField(default=False, null=False, blank=False)

    def tipos(self):
        todos_tipos = {
            1: 'Atividade de sala',
            2: 'Lição de casa',
            3: 'Avaliação'
        }
        return todos_tipos

    def bimestre(self):
        return qual_bimestre(self.data_visto, self.prof_disciplina.disciplina.turma.periodo_letivo)

    def pode_editar(self):
        _, pode = Bimestres.objects.get(pk=self.data_visto.year).verifica_pode_digitar(self.data_visto)
        return pode


class Alunos_Vistos(models.Model):
    aluno_turma = models.ForeignKey(Aluno_Turma, on_delete=models.CASCADE)
    vistos = models.ForeignKey(Vistos, on_delete=models.CASCADE)
    feito = models.BooleanField(default=True, null=False, blank=False)


class Grafico(models.Model):
    titulo = models.CharField(default='', max_length=200)
    imagem = models.ImageField(upload_to="graficos")
    texto = models.TextField(default='')


class Grade_Horaria(models.Model):
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE)
    prof_disciplina = models.ForeignKey(Prof_Disciplina, on_delete=models.CASCADE, null=True)
    inicio = models.TimeField(default=None, null=False, blank=False)
    fim = models.TimeField(default=None, null=False, blank=False)
    dia_semana = models.IntegerField(null=False, blank=False, validators=[MinValueValidator(0), MaxValueValidator(6)])
    n = models.IntegerField(null=False, blank=False)
    validade = models.CharField(default='', max_length=21)
    validade_inicio = models.DateField(default=None, null=True, blank=True)
    validade_fim = models.DateField(default=None, null=True, blank=True)

    def set_validade(self, validade):
        self.validade = validade
        validade_list = validade.split(',')
        self.validade_inicio = validade_list[0]
        self.validade_fim = validade_list[1]
        self.save()

    def __str__(self):
        return f'{self.inicio} - {self.fim} - {self.dia_semana} - {self.n} - {self.prof_disciplina}'


class Ocorrencias(models.Model):
    periodo_letivo = models.IntegerField(null=False, blank=False)
    text = models.CharField(max_length=100)
    n = models.IntegerField(default=0, null=False, blank=False)
    is_active = models.BooleanField(default=True, null=False, blank=False)

    def set_ocorrencia(self, text):
        self.text = text
        self.save()

    def excluir(self):
        self.delete()


class Registro_Ocorrencia(models.Model):  # Do aluno
    prof_disciplina = models.ForeignKey(Prof_Disciplina, on_delete=models.CASCADE)
    ocorrencia = models.ForeignKey(Ocorrencias, on_delete=models.CASCADE)
    aluno_turma = models.ForeignKey(Aluno_Turma, on_delete=models.CASCADE)
    data_registro = models.DateField(default=None, null=True, blank=True)
    visto = models.BooleanField(default=False, null=False, blank=False)

    def bimestre(self):
        return qual_bimestre(self.data_registro, self.aluno_turma.turma.periodo_letivo)


tipos_agenda = {
    0: 'Lição de Casa',
    1: 'Avaliação',
    2: 'Aviso',
    3: 'Reunião'
}


class Agenda(models.Model):
    registrador = models.ForeignKey(User, on_delete=models.CASCADE)
    disciplinas_ids = models.TextField(default='', null=False,
                                       blank=False)  # lista com ids das prof_disciplina que podem ver o evento
    turmas_ids = models.TextField(default='', null=False, blank=False)  # lista com ids das turma que podem ver o evento
    users_ids = models.TextField(default='', null=False, blank=False)  # lista com ids dos profs que podem ver o evento
    data_rg = models.DateField(auto_now_add=True, null=False, blank=False)
    data_evento = models.DateField(default=None, null=True, blank=True)
    descricao = models.TextField(default='', editable=True, null=True, blank=True)
    titulo = models.CharField(default='', max_length=100, null=False, blank=False)
    tipo = models.IntegerField(null=False, blank=False, default=0)
    urls_list = models.TextField(default='', null=False, blank=False)
    urls_text_list = models.TextField(default='', null=False, blank=False)

    def bimestre(self):
        return qual_bimestre(self.data_evento, self.data_evento.year)

    def links_editar_evento(self):
        links_list = list()
        urls_text_list = self.urls_text_list.split('<>')
        for i, url in enumerate(self.urls_list.split('<>')):
            links_list.append(
                f'<tr><td><b><a href="{url}" target="_blank">{urls_text_list[i]}</a></b></td><td style="text-align: center;"><a href="#descricao" onclick="excluirlink(this);"><i class="fa fa-trash fa-lg" aria-hidden="true"></i></a></td></tr>')
        return links_list

    def links_ver_evento(self):
        links_list = list()
        urls_text_list = self.urls_text_list.split('<>')
        for i, url in enumerate(self.urls_list.split('<>')):
            links_list.append(
                f'<li><a target="_blank" class="link_format" href="{url}"><i class="fa fa-caret-right fa-xs"></i> {urls_text_list[i]}</a> </li>')
        return links_list

    def links_ver_evento_js(self):
        js = ''
        urls_text_list = self.urls_text_list.split('<>')
        for i, url in enumerate(self.urls_list.split('<>')):
            js += f'urls.push("{url}");texturls.push("{urls_text_list[i]}");'
        return js

    def get_disciplinas(self):
        resp = ''
        if self.disciplinas_ids:
            lista = Disciplina.objects.filter(id__in=self.disciplinas_ids_list()).order_by('nome__nome').distinct(
                'nome__nome')
            n = len(lista)
            for i, disciplina in enumerate(lista):
                if i == n - 1:
                    resp += disciplina.nome.nome + '.'
                elif i == n - 2:
                    resp += disciplina.nome.nome + ' e '
                else:
                    resp += disciplina.nome.nome + ', '
        return resp

    def get_disciplinas_sigla(self):
        resp = ''
        if self.disciplinas_ids:
            lista = Disciplina.objects.filter(id__in=self.disciplinas_ids_list()).order_by('nome__nome').distinct(
                'nome__nome')
            n = len(lista)
            for i, disciplina in enumerate(lista):
                if i == n - 1:
                    resp += disciplina.nome.sigla + '.'
                elif i == n - 2:
                    resp += disciplina.nome.sigla + ' e '
                else:
                    resp += disciplina.nome.sigla + ', '
        return resp

    def get_turmas(self):
        resp = ''
        if self.turmas_ids:
            lista = Turma.objects.filter(id__in=self.turmas_ids_list()).order_by('-periodo_letivo', 'curso', 'ano',
                                                                                 'letra')
            n = len(lista)
            for i, turma in enumerate(lista):
                if i == n - 1:
                    resp += turma.str_curta() + '.'
                elif i == n - 2:
                    resp += turma.str_curta() + ' e '
                else:
                    resp += turma.str_curta() + ', '
        return resp

    def tipo_display(self):
        if self.tipo in tipos_agenda:
            return tipos_agenda[self.tipo]
        return 'Outros'

    def disciplinas_ids_list(self):
        return [int(k) for k in self.disciplinas_ids.split(',') if k]

    def turmas_ids_list(self):
        return [int(k) for k in self.turmas_ids.split(',') if k]

    def users_ids_list(self):
        return [int(k) for k in self.users_ids.split(',') if k]

    def __str__(self):
        txt = '-----------AGENDA--------------\n'
        txt += f'Data de registro: {self.data_rg}\n'
        txt += f'Data do evento: {self.data_evento}\n'
        txt += f'Título: {self.titulo}\n'
        txt += f'Descrição: {self.descricao}\n'
        txt += f'Tipo: {self.tipo}\n'
        txt += f'Turmas: {self.turmas_ids}\n'
        txt += f'Professores: {self.profs_ids}\n'
        txt += f'Funcionários: {self.funcionarios_ids}\n'
        txt += f'urls_text_list: {self.urls_text_list}\n'
        txt += f'urls_list: {self.urls_list}\n'
        txt = '-------------------------------\n'
