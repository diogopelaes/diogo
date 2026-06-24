import json
import os

# Define details of Matriz de Decisões
data = {
    "titulo": "Matriz de Decisões para Construção do Regimento Escolar do CEMEP",
    "descricao": "Este questionário foi concebido para servir como instrumento de tomada de decisões da Comissão de Revisão do Regimento Escolar do CEMEP. Cada resposta deve resultar diretamente em um ou mais artigos do futuro Regimento Escolar.",
    "deve_abordar": [
        "Estrutura de governança e órgãos colegiados",
        "Atribuições administrativas e pedagógicas da equipe gestora",
        "Regras e modalidades de matrícula e vida escolar",
        "Controle de frequência e compensação de faltas",
        "Sistema de avaliação (escalas, aprovação e retenção)",
        "Critérios e fluxos de recuperação da aprendizagem",
        "Procedimentos de reconsideração e recursos",
        "Direitos e deveres dos estudantes, famílias e profissionais",
        "Normas de convivência e medidas disciplinares",
        "Regulamentação de tecnologia e inteligência artificial",
        "Educação especial, acessibilidade e uso de espaços",
        "Protocolos de segurança e documentação escolar"
    ],
    "nao_deve_abordar": [
        "Missão, visão e valores institucionais (PPP)",
        "Concepções pedagógicas e metas educacionais (PPP)",
        "Currículos, conteúdos, competências e habilidades (Plano de Curso)",
        "Planejamento pedagógico anual (Plano Escolar)",
        "Projetos específicos da escola (PPP e Plano de Ação)"
    ],
    "resultado_esperado": "Após responder esta matriz, a Comissão terá definido todas as decisões normativas necessárias para redigir o Regimento Escolar do CEMEP, sem misturar conteúdos pertencentes ao PPP, Plano de Curso, Currículo ou demais documentos institucionais.",
    "blocos": []
}

# Define the blocks and questions with options
# We will create a mapping of question number -> options
options_map = {
    # BLOCO 1
    1: ["Ambos (Consultivo e Deliberativo)", "Apenas Deliberativo", "Apenas Consultivo"],
    2: ["Alterações no Regimento, Calendário Escolar e PPP", "Sanções disciplinares graves a estudantes", "Diretrizes orçamentárias e prestação de contas da APM", "Todas as anteriores"],
    3: ["Gestão operacional diária de recursos humanos e financeiros", "Aplicação de medidas disciplinares leves e médias", "Organização e distribuição de turmas e horários", "Todas as anteriores"],
    4: ["Sim, por iniciativa de qualquer segmento do Conselho", "Sim, apenas em reuniões ordinárias anuais", "Não, a proposta de alteração cabe apenas à Direção"],
    5: ["Sim, por meio de resoluções internas homologadas", "Sim, mas dependem de autorização da Mantenedora/Direção", "Não, as normas complementares são emitidas pela Direção"],
    6: ["Voto aberto e maioria simples dos presentes", "Voto secreto para temas disciplinares e eleitorais", "Consenso preferencialmente, recorrendo ao voto se necessário"],
    7: ["Maioria absoluta dos membros (50% + 1)", "Dois terços (2/3) dos membros", "Qualquer quórum em segunda convocação"],
    8: ["Em atas formais em livro físico ou digital", "Em resoluções publicadas em local visível e digital", "Apenas por memorando interno para a comunidade"],
    9: ["Pelo Diretor da Escola", "Por requerimento assinado por no mínimo 1/3 dos membros do conselho", "Por ambas as formas anteriores"],
    10: ["Por representantes do Grêmio Estudantil com direito a voz e voto", "Por representantes eleitos por classe com direito a voz", "Por audiências e consultas públicas periódicas"],
    11: ["Deliberativo (decisão final)", "Consultivo (emite parecer para decisão final da Direção)", "Ambos (deliberativo em avaliação, consultivo em indisciplina)"],
    12: ["Sim, em caso de erro material ou injustiça pedagógica comprovada", "Sim, sob parecer fundamentado do coordenador pedagógico", "Não, a avaliação e resultados finais são soberania do professor"],
    13: ["Sim, visando a equidade do processo educativo", "Não, a atribuição de notas é exclusividade de cada docente", "Sim, mediante aprovação de nova atividade avaliativa"],
    14: ["Sim, alterando os conceitos com base em análise global do estudante", "Não, os conceitos são definidos unicamente pelo docente", "Sim, sob mediação da coordenação pedagógica"],
    15: ["Sim, indicando procedimentos de recuperação paralela ou final", "Não, cabe apenas ao professor definir a recuperação", "Sim, por meio de plano de estudos individualizado obrigatório"],
    16: ["Sim, é o órgão máximo para decidir sobre aprovação ou retenção", "Não, a retenção é definida pela média aritmética das notas", "Sim, desde que a análise seja em caso de progresso parcial"],
    17: ["Todos os docentes da turma e a equipe gestora/pedagógica", "Apenas os docentes da turma com regência", "Gestores, docentes da turma e psicólogo/orientador escolar"],
    18: ["Representantes de classe dos estudantes e orientador educacional", "Profissionais de apoio à inclusão e cuidadores", "Todos os anteriores apenas com direito a voz"],
    19: ["Atas formais assinadas por todos e inserção no diário digital", "Apenas ata simplificada na secretaria", "Relatório de conselho assinado digitalmente"],
    20: ["Voto de minerva do Diretor da Escola", "Média ponderada das avaliações pedagógicas", "Consenso após nova rodada de discussões pedagógicas"],

    # BLOCO 2
    21: ["Assinatura de documentos oficiais e homologação de matrículas", "Aplicação de medidas disciplinares extremas (ex: suspensão)", "Representação legal e ordenação de despesas", "Todas as anteriores"],
    22: ["Assinatura de declarações e documentos rotineiros (para o Vice-Diretor)", "Coordenação de reuniões pedagógicas (para os Coordenadores)", "Gestão e fiscalização de espaços físicos (para a Gerência)", "Todas as anteriores"],
    23: ["Pelo Vice-Diretor de forma automática", "Por docente indicado pela Direção/Conselho e homologado pela Diretoria", "Por designação da Mantenedora/Diretoria de Ensino"],
    24: ["Por Portarias e Instruções Normativas internas escritas", "Por e-mail institucional e avisos na plataforma digital", "Por comunicados orais registrados em atas administrativas"],
    25: ["Editais de matrícula, calendários e resoluções do Conselho Escolar", "Sanções disciplinares aplicadas a servidores e estudantes", "Apenas o Calendário Escolar e horários de aulas"],
    26: ["A Direção toma medidas imediatas de segurança e convoca o Conselho Escolar", "A escola é fechada temporariamente sob aviso à Mantenedora", "Uso de protocolos de segurança previstos na legislação estadual"],
    27: ["Exclusivamente pelo Diretor da Escola", "Pelo Diretor e, em sua ausência, pelo Vice-Diretor", "Pelo Diretor ou por membro do conselho formalmente delegado"],

    # BLOCO 3
    28: ["Matrícula Regular, Renovação e Transferência", "Matrícula por Adaptação ou Aproveitamento de Estudos", "Ambas as modalidades anteriores"],
    29: ["Sim, a qualquer momento se houver vagas remanescentes", "Sim, mas condicionada a prazos da legislação e calendário oficial", "Não, apenas no período regular de matrícula"],
    30: ["Ordem de inscrição ou sorteio público", "Proximidade de residência e irmãos na mesma escola", "Vulnerabilidade social e atendimento a necessidades especiais"],
    31: ["Mediante apresentação de histórico escolar e análise curricular imediata", "Com matrícula condicional até regularização de pendências documentais", "Ambos os procedimentos regulados por prazos rígidos"],
    32: ["Mediante equivalência de disciplinas cursadas em escolas autorizadas", "Por meio de avaliação diagnóstica de competências realizada na escola", "Ambas as formas conforme parecer da coordenação pedagógica"],
    33: ["Sim, para posicionar o estudante no ano letivo adequado", "Não, a escola não realiza processo de classificação", "Sim, apenas para estudantes sem comprovação de estudos anteriores"],
    34: ["Sim, para avanço de estudos conforme avaliação do Conselho de Classe", "Não, o aluno deve seguir estritamente o fluxo anual regular", "Sim, apenas para corrigir distorção idade-série"],
    35: ["Por solicitação do docente ou da família mediante testes de proficiência", "Por recomendação do Conselho de Classe no primeiro bimestre", "Ambas as opções anteriores"],
    36: ["Com plano de estudos especial orientado pelo coordenador pedagógico", "Através de aulas de apoio e provas específicas de adaptação", "Ambos os métodos com prazos estipulados"],
    37: ["Sim, em até 2 disciplinas do ano anterior", "Sim, em até 3 disciplinas do ano anterior", "Não, o sistema é de progressão anual plena (sem dependências)"],
    38: ["Sim, com oferta de estudos orientados em horário diverso", "Sim, através de provas periódicas sem necessidade de frequência", "Não, a escola não oferta dependência parcial"],
    39: ["Por meio de análise da secretaria e homologação do Conselho Escolar", "Mediante exames especiais de suficiência orientados pela coordenação", "Conforme normas específicas da Diretoria de Ensino"],
    40: ["Por solicitação escrita do estudante maior ou do responsável legal", "Por abandono escolar após 15 dias consecutivos sem justificativa", "Ambas as situações anteriores"],
    41: ["Automático por decurso de faltas injustificadas", "Após notificação por escrito e não comparecimento em 5 dias úteis", "Apenas por decisão do Conselho Escolar baseada em indisciplina"],
    42: ["Após 15 dias consecutivos de faltas sem comunicação e busca ativa infrutífera", "Ao final do ano letivo se o estudante não atingiu 75% de frequência", "Após 30 dias intercalados de faltas sem justificativa no semestre"],

    # BLOCO 4
    43: ["Diariamente pelo professor por meio de sistema acadêmico digital", "Pela secretaria através de chamadas físicas periódicas", "Por leitura de cartão magnético ou biometria no acesso à escola"],
    44: ["O docente regente da aula/disciplina", "O inspetor de alunos ou inspetora de turno", "O estudante de forma auto-declaratória validada pelo professor"],
    45: ["Abonadas mediante atestado médico ou justificativa legal em 2 dias", "Registradas como justificadas sem abono, mas permitindo reposição de provas", "Submetidas ao coordenador para validação e compensação"],
    46: ["Lançamento imediato de falta e perda do direito a exames na data", "Encaminhamento para busca ativa e contato com os responsáveis", "Ambos, com advertência escrita acumulada"],
    47: ["Sim, com atividades síncronas ou assíncronas dirigidas", "Não, faltas não podem ser compensadas no regimento", "Sim, apenas por meio de projetos de pesquisa no contra-turno"],
    48: ["Em caso de atestado médico que impeça atividade física ou escolar curta", "Em caso de faltas justificadas que coloquem a aprovação em risco", "Ambas as situações anteriores"],
    49: ["Trabalhos de pesquisa orientados e provas de compensação", "Aulas adicionais no contra-turno ou sábados letivos", "Ambas as alternativas anteriores"],
    50: ["Imediatamente ao atingir 10% de faltas permitidas na disciplina", "Ao atingir 20% de faltas na disciplina ou no total do ano", "Semanalmente através do boletim ou aplicativo escolar"],
    51: ["Após 5 faltas consecutivas ou 10 intercaladas sem justificativa", "Apenas ao final de cada bimestre letivo", "Imediatamente no terceiro dia de falta consecutiva sem aviso"],
    52: ["Esgotadas as ações de busca ativa sem retorno do aluno (após 5 dias)", "Imediatamente quando o aluno falta mais de 10 dias no bimestre", "Quando há suspeita de negligência familiar no acompanhamento escolar"],
    53: ["Sim, gerido pela equipe gestora e Conselho Escolar com metas anuais", "Não, a escola segue apenas as diretrizes da Secretaria de Educação", "Sim, em parceria com o Grêmio Estudantil e Conselho de Tutela"],

    # BLOCO 5
    54: ["Exclusivamente Notas de 0 a 10", "Exclusivamente Conceitos (Menção: I, R, B, MB)", "Sistema híbrido (Notas convertidas em menções ao final)"],
    55: ["Numérica de 0 a 10 com frações decimais (ex: 7,5)", "Menções conceituais: Insuficiente, Regular, Bom, Muito Bom", "Numérica de 0 a 100 inteiros"],
    56: ["Média 6,0 (seis) ou conceito equivalente (Regular/Bom)", "Média 5,0 (cinco) ou conceito equivalente (Regular)", "Média 7,0 (sete) ou conceito equivalente (Bom)"],
    57: ["4 períodos letivos (Bimestres)", "3 períodos letivos (Trimestres)", "2 períodos letivos (Semestres)"],
    58: ["No diário de classe digital integrado ao sistema da secretaria", "Em boletins físicos impressos ao final de cada período", "Em boletim digital enviado por e-mail aos responsáveis"],
    59: ["O Coordenador Pedagógico e o Diretor da Escola", "O próprio professor autor do registro", "Uma comissão interna de registro acadêmico"],
    60: ["Mediante solicitação formal do professor e retificação da secretaria", "Correção direta pelo professor com justificativa digital registrada", "Apenas por autorização da Direção de Ensino externa"],
    61: ["Acesso em tempo real ao boletim online e devolução de provas", "Divulgação de gabaritos e plantões de dúvidas pedagógicas", "Ambas as ações anteriores integradas ao calendário"],
    62: ["Visualização das provas corrigidas em sala com feedback do professor", "Disponibilização das avaliações para guarda física temporária", "Ambos os métodos com direito a cópia solicitada pelos pais"],

    # BLOCO 6
    63: ["Sim, realizada no decorrer das aulas ordinárias diariamente", "Não, a escola realiza apenas recuperação bimestral", "Sim, por meio de plantões de dúvidas no contra-turno"],
    64: ["Sim, realizada ao final de cada ciclo/bimestre letivo", "Não, a escola não utiliza a modalidade paralela", "Sim, integrada a projetos multidisciplinares"],
    65: ["Sim, ofertada ao final do ano letivo aos alunos retidos", "Não, o aluno deve se recuperar durante os bimestres regulares", "Sim, com período de aulas de reforço e exames finais"],
    66: ["Sim, focada em habilidades essenciais em períodos curtos de férias/sábados", "Não, a escola não adota a modalidade intensiva", "Sim, apenas para estudantes com risco severo de evasão"],
    67: ["Estudante com média/conceito abaixo do mínimo no período letivo", "Por indicação direta do Conselho de Classe ou do professor regente", "Ambas as opções com convocação obrigatória"],
    68: ["Lançamento de nova nota/conceito no sistema substituindo a anterior", "Registro em campo específico de recuperação mantendo o histórico anterior", "Ambas as formas no diário de classe"],
    69: ["Prevalência da maior nota obtida pelo estudante no período", "Substituição simples da nota antiga pela nota da recuperação", "Média ponderada entre a nota antiga e a nota da recuperação"],
    70: ["A Coordenação Pedagógica em conjunto com os Professores", "O Conselho de Classe em reunião ordinária", "A Direção da Escola com base nas diretrizes do Regimento"],

    # BLOCO 7
    71: ["Frequência mínima de 75% e média final igual ou superior a 6,0", "Frequência de 75% e aprovação em todas as disciplinas pelo conselho", "Média final igual ou superior a 5,0 independente de faltas"],
    72: ["Média final inferior a 6,0 em mais de 3 disciplinas após recuperação", "Frequência anual inferior a 75% sem justificativa ou compensação", "Ambas as opções anteriores"],
    73: ["Sim, fator eliminatório absoluto (mínimo de 75%)", "Não, o Conselho de Classe pode relevar baseado na aprendizagem", "Sim, mas flexibilizada para estudantes com plano de compensação"],
    74: ["Sim, analisando aspectos socioemocionais, de inclusão e histórico do aluno", "Não, as regras de notas e faltas são aplicadas de forma rígida", "Sim, mas a decisão final depende de homologação externa"],
    75: ["Encaminhamento automático para conselho de classe deliberativo especial", "Atribuição de trabalhos de reavaliação de urgência", "Aprovação condicionada a plano de dependência no ano seguinte"],
    76: ["Sim, para o aluno cursar o ano seguinte com pendências do anterior", "Não, a retenção em uma disciplina retém o aluno no ano inteiro", "Sim, limitada a no máximo duas disciplinas"],
    77: ["Sim, com turmas especiais no contra-turno", "Sim, por meio de estudos dirigidos e exames periódicos", "Não, o CEMEP não adota regime de dependência"],
    78: ["Publicação digital no portal e reuniões de entrega de boletins", "Envio de boletim impresso assinado pela escola", "Ambos os métodos com canais de atendimento individuais"],

    # BLOCO 8
    79: ["Sim, em primeira instância para a Direção/Conselho de Classe", "Não, os resultados pedagógicos são finais e irrecorríveis", "Sim, mas apenas em caso de erros na contagem de pontos"],
    80: ["O estudante (maior de idade) ou seus pais/responsáveis legais", "O professor da disciplina em nome do estudante", "Qualquer membro do Conselho de Classe com justificativa"],
    81: ["Até 5 dias úteis após a publicação oficial dos resultados", "Até 10 dias corridos a partir da entrega do boletim", "Até 48 horas após a divulgação do resultado final"],
    82: ["A Direção Pedagógica ouvidos os professores da disciplina", "O próprio Conselho de Classe em caráter extraordinário", "Ambas as instâncias integradas em comissão especial"],
    83: ["Sim, em segunda instância para a Diretoria de Ensino / Mantenedora", "Não, a reconsideração interna encerra o processo na escola", "Sim, mas apenas por razões de descumprimento do regimento"],
    84: ["Até 5 dias úteis após ciência da decisão de reconsideração", "Até 10 dias corridos após o parecer da comissão", "Até 3 dias úteis a partir da resposta interna"],
    85: ["A Diretoria de Ensino / Órgão Colegiado Superior da Mantenedora", "O Conselho Escolar reunido de forma extraordinária", "Uma junta arbitral interna de professores isentos"],
    86: ["Histórico de notas, plano de recuperação e provas físicas aplicadas", "Abaixo-assinado e declarações de conduta do estudante", "Apenas a petição inicial escrita e fundamentada"],
    87: ["Por notificação oficial escrita entregue sob assinatura ou e-mail oficial", "Por edital fixado no mural de avisos da escola", "Por telefonema registrado na ata da secretaria"],

    # BLOCO 9
    88: ["Acesso a ensino de qualidade e professores qualificados", "Tratamento respeitoso e igualitário por parte de toda a comunidade", "Ambiente físico seguro, higienizado e adequado à aprendizagem", "Todos os direitos anteriores expressos"],
    89: ["Sim, com direito a cronogramas de provas, conteúdos e critérios claros", "Não é necessário constar expressamente, apenas subentendido", "Sim, incluindo acesso a relatórios de frequência diária online"],
    90: ["Sim, com garantia de escuta antes da aplicação de medidas disciplinares", "Não, medidas de ordem interna são de autoridade direta da gestão", "Sim, apenas na presença de responsáveis legais"],
    91: ["Sim, permitindo ao estudante apresentar provas e testemunhas", "Não se aplica a infrações leves e médias de convivência", "Sim, garantida a representação e assessoria no Conselho Escolar"],
    92: ["Sim, assegurando direito à organização de Grêmio e chapas livres", "Não, a representação estudantil deve ser tutelada pela Direção", "Sim, incluindo representação discente nos colegiados da escola"],
    93: ["Sim, a qualquer tempo mediante solicitação oficial à secretaria", "Não, os registros são restritos aos responsáveis e à gestão", "Sim, com visualização em plataforma digital em tempo real"],
    94: ["Sim, incluindo biblioteca, quadras e laboratórios sob agendamento", "Apenas durante o período de aulas regulares sob supervisão", "Sim, de forma livre mesmo fora do horário de aulas"],
    95: ["Sim, garantindo adaptações de currículo e metodologias para PCDs", "Apenas conforme disponibilidade de recursos e cuidadores da escola", "Sim, com plano de atendimento educacional especializado individualizado"],
    96: ["Sim, com acessibilidade arquitetônica, atitudinal e digital", "Apenas acessibilidade arquitetônica física (rampas e banheiros)", "Conforme especificações e recursos da mantenedora"],
    97: ["Sim, com proibição expressa de atitudes de racismo, homofobia e capacitismo", "Não precisa de cláusula específica, pois já consta na constituição", "Sim, com canais seguros de denúncias de preconceito e assédio"],
    98: ["Sim, proteção de dados e privacidade em conformidade com a LGPD", "Apenas proteção de dados em arquivos impressos da secretaria", "A escola pode usar imagens de estudantes livremente em redes sociais"],

    # BLOCO 10
    99: ["Comparecer pontualmente às aulas e trazer o material pedagógico", "Zelar pela conservação do patrimônio físico e tecnológico da escola", "Respeitar professores, funcionários e colegas no ambiente escolar", "Todos os deveres anteriores expressos"],
    100: ["Frequência regular mínima, realização de tarefas e avaliações", "Manutenção de média satisfatória e cumprimento de prazos pedagógicos", "Ambas as opções anteriores de responsabilidade acadêmica"],
    101: ["Seguir as normas internas de conduta e horários estabelecidos", "Obedecer às instruções de professores e inspetores no pátio", "Ambas as opções com gradação de infrações"],
    102: ["Indenizar a escola em caso de destruição dolosa de patrimônio", "Zelar pelos livros didáticos, carteiras e equipamentos eletrônicos", "Ambas as opções sob pena de advertência escrita"],
    103: ["Uso ético de equipamentos e redes Wi-Fi institucionais", "Proibição de invasão de contas ou compartilhamento de links de aulas", "Ambos os deveres relacionados às mídias digitais"],
    104: ["Promover conduta colaborativa, respeitando as diferenças de todos", "Evitar comportamentos antissociais e cooperar na mediação de brigas", "Ambas as condutas integradoras de convivência"],

    # BLOCO 11
    105: ["Ser informado sobre frequência, notas e comportamento do aluno", "Ser ouvido pela Direção e Coordenação sobre o desenvolvimento do filho", "Participar das assembleias da APM e reuniões pedagógicas", "Todos os direitos das famílias expressos"],
    106: ["Garantir a frequência diária e pontualidade do estudante", "Acompanhar as tarefas de casa e providenciar o material básico", "Comparecer à escola sempre que convocado pela equipe gestora", "Todos os deveres das famílias expressos"],
    107: ["Através do portal acadêmico digital e reuniões bimestrais de pais", "Por meio do envio do boletim físico ao final de cada período", "Por meio de contatos telefônicos ou mensagens em aplicativos oficiais"],
    108: ["Por comunicados digitais no sistema oficial e avisos escritos", "Exclusivamente por cartas físicas registradas na secretaria", "Por meio do diário eletrônico do estudante e reuniões"],
    109: ["Participação presencial obrigatória a cada final de período letivo", "Presencial ou virtual, com agendamento flexível de horários", "Apenas por convocação em casos de notas baixas ou indisciplina"],
    110: ["Por meio de candidaturas e eleições para membros da APM e Conselho", "Apenas como ouvintes nas assembleias anuais de pais", "Participação eletiva restrita à diretoria da APM"],

    # BLOCO 12
    111: ["Cumprimento de carga horária e pontualidade nas aulas", "Execução do plano de ensino em conformidade com as diretrizes do CEMEP", "Tratamento respeitoso e igualitário a todos da comunidade escolar", "Todos os deveres profissionais descritos"],
    112: ["Lançamento correto e tempestivo de notas, conceitos e faltas no diário", "Elaboração de planos de trabalho de acordo com os prazos fixados", "Ambos os deveres sob responsabilidade de acompanhamento da gestão"],
    113: ["Planejamento de avaliações alinhadas aos objetivos de aprendizagem", "Aplicação de provas em conformidade com o calendário pedagógico", "Garantia de reposição de avaliações conforme justificativa do aluno", "Todas as anteriores"],
    114: ["Lançamento diário de presença/falta e acompanhamento de evasão", "Alerta imediato à coordenação em caso de faltas consecutivas do aluno", "Ambas as obrigações para apoiar a busca ativa escolar"],
    115: ["Zelar pela integridade física dos alunos em sala e espaços comuns", "Reportar incidentes e comportamentos de risco à Direção imediatamente", "Cumprir as normas de evacuação e primeiros socorros da escola", "Todas as anteriores"],
    116: ["Sigilo absoluto sobre notas, histórico e dados de saúde dos alunos", "Proibição de divulgação de imagens ou vídeos de alunos sem autorização", "Uso estrito de plataformas institucionais para tratar de dados", "Todas as anteriores"],

    # BLOCO 13
    117: ["Respeito mútuo, solidariedade e valorização da diversidade", "Diálogo constante e mediação não violenta de conflitos", "Ambos os princípios norteadores"],
    118: ["Agressões verbais ou físicas, preconceito e discriminação de qualquer tipo", "Uso indevido de aparelhos eletrônicos em sala e depredação patrimonial", "Perturbação do silêncio escolar e saídas não autorizadas das salas", "Todas as condutas listadas"],
    119: ["Através de conversas de mediação conduzidas pela coordenação", "Encaminhamento direto para aplicação de advertências disciplinares", "Utilização de círculos de práticas restaurativas e reparação de danos"],
    120: ["Advertência oral imediata e, se persistente, encaminhamento escrito", "Convocação dos responsáveis para reunião de alinhamento com a gestão", "Ambas as ações com gradação de sanções"],
    121: ["Abertura imediata de processo de apuração e suspensão temporária", "Encaminhamento aos órgãos de direitos humanos e Conselho Tutelar", "Medidas disciplinares pedagógicas de conscientização e registro no prontuário"],
    122: ["Separação dos envolvidos, comunicação à família e à polícia em caso grave", "Suspensão automática das aulas e termo de ocorrência policial", "Mediação interna e encaminhamento para atendimento psicológico"],
    123: ["Programa permanente de combate ao bullying, palestras e escuta", "Medidas disciplinares pedagógicas e termo de ajustamento de conduta", "Ambos, com punições escalonadas para casos reincidentes"],
    124: ["Investigação interna com apoio de prints e denúncias documentadas", "Suspensão imediata dos canais digitais institucionais do agressor", "Campanhas educativas de cidadania digital aliadas a punições"],
    125: ["Reparação financeira ou material do dano pelo aluno ou responsável", "Prestação de serviços comunitários de manutenção do espaço escolar", "Ambas as opções com advertência por escrito"],
    126: ["Por canal de denúncias anônimo ou formal escrito na secretaria", "Exclusivamente por reunião presencial com a equipe de direção", "Por e-mail oficial com garantia de sigilo e não retaliação"],

    # BLOCO 14
    127: ["Medidas preventivas, advertência verbal, escrita e suspensão", "Termo de compromisso discente e atividades comunitárias escolares", "Ambas as categorias graduadas por gravidade de infração"],
    128: ["Sim, aplicada pelo professor em sala ou inspetor nos pátios", "Não, qualquer advertência deve ser por escrito via secretaria", "Sim, apenas com registro obrigatório em diário digital de classe"],
    129: ["Sim, aplicada pelo coordenador pedagógico ou diretor", "Não, a escola adota apenas advertências verbais ou suspensões", "Sim, com cópia enviada obrigatoriamente para assinatura dos pais"],
    130: ["Sim, assinado pelo aluno e responsáveis em reuniões de conciliação", "Não, o regimento não prevê termos de compromisso formais", "Sim, apenas para casos de risco de retenção escolar por conduta"],
    131: ["Sim, por meio de práticas restaurativas para reparar danos à convivência", "Não, a escola adota apenas punições tradicionais", "Sim, em parceria com a rede de apoio psicossocial do município"],
    132: ["Sim, limitada a no máximo 3 dias letivos", "Sim, limitada a no máximo 5 dias letivos", "Não, a suspensão de aulas é proibida no regimento do CEMEP"],
    133: ["Reincidência de faltas graves ou agressão física comprovada", "Porte de substâncias proibidas ou furto/vandalismo grave", "Ambas as situações sob avaliação da equipe gestora"],
    134: ["O Diretor da Escola e, em sua ausência, o Vice-Diretor", "Qualquer professor para advertências e a Direção para suspensões", "Uma comissão especial de ética discente nomeada pelo conselho"],
    135: ["Em prontuário físico e digital reservado do aluno na secretaria", "No diário eletrônico de classe com acesso público de professores", "Em atas internas de ocorrências disciplinares"],
    136: ["Ouvindo o estudante e coletando sua versão em termo por escrito", "Garantindo a presença dos responsáveis legais no ato do depoimento", "Ambas as ações sob protocolo formal"],
    137: ["Prazo de 3 dias úteis para os pais apresentarem defesa escrita", "Acompanhamento do Grêmio Estudantil ou defensor dativo interno", "Ambas as opções estruturadas no processo disciplinar"],

    # BLOCO 15
    138: ["Proibido durante as aulas, exceto com autorização para uso pedagógico", "Permitido livremente para consultas em sala de aula", "Proibido em todo o ambiente escolar (incluindo pátios e intervalos)"],
    139: ["Apenas com fins pedagógicos autorizados pelo professor regente", "Livre para digitação de anotações a qualquer momento da aula", "Proibido, devendo o aluno usar apenas material impresso"],
    140: ["Restrito para pesquisas acadêmicas com bloqueio de redes sociais e jogos", "Acesso livre a toda a comunidade escolar sem restrições de navegação", "Bloqueada, permitida apenas nos laboratórios de informática"],
    141: ["Exclusivo para fins acadêmicos e comunicações com a escola", "Permitido para fins pessoais respeitando a decência digital", "Uso opcional, sem penalidades por uso inadequado"],
    142: ["Permitido sob orientação do professor como ferramenta de apoio", "Totalmente proibido em qualquer trabalho avaliativo", "Permitido sem necessidade de declaração ou monitoramento"],
    143: ["Sim, o aluno deve citar a IA nos trabalhos de pesquisa (fontes)", "Não, o uso é livre e dispensa declarações específicas", "Sim, com preenchimento de ficha técnica de uso tecnológico"],
    144: ["Em provas presenciais de avaliação e exames oficiais da escola", "Para geração completa de trabalhos de redação e autoria", "Ambas as alternativas anteriores"],
    145: ["Cópia de trabalhos, cola em exames e uso não autorizado de IA", "Substituição de autoria de avaliações por terceiros", "Ambas as condutas sob sanção disciplinar"],
    146: ["Cópia integral ou parcial de obra de terceiros sem citação de fonte", "Uso de textos gerados por IA sem a devida menção da ferramenta", "Ambas as condutas caracterizadoras"],
    147: ["Advertência escrita e suspensão da conta institucional", "Apagamento do conteúdo e retratação pública para os envolvidos", "Ambas as sanções sob avaliação do Conselho Escolar"],
    148: ["Proibido gravar aulas sem autorização prévia por escrito do docente", "Gravações livres para fins de estudos individuais", "Suspensão imediata em caso de compartilhamento público de áudios/vídeos"],

    # BLOCO 16
    149: ["Vagas reservadas, adaptações físicas de salas e rampas", "Intérprete de Libras e material pedagógico adaptado", "Ambos os direitos assegurados no ato da matrícula"],
    150: ["Atendimento Educacional Especializado (AEE) no contra-turno", "Acompanhamento de cuidador e plano pedagógico individualizado", "Ambas as opções articuladas com a família do estudante"],
    151: ["Por meio do Plano de Desenvolvimento Individualizado (PDI)", "Registro em ficha de adaptação pelo conselho de classe", "Emissão de portaria interna da Direção para adaptação curricular"],
    152: ["Em diário de classe próprio do AEE e pasta de prontuário especial", "Apenas em relatórios de desempenho anuais", "No histórico escolar regular do estudante"],
    153: ["Reuniões mensais entre professores regentes e professor do AEE", "Troca de relatórios escritos ao final de cada bimestre letivo", "Ambas as ações coordenadas pela coordenação pedagógica"],
    154: ["Material em braile, audiodescrição e softwares leitores de tela", "Uso de tecnologias assistivas sob demanda da família do aluno", "Apoio de monitores capacitados em comunicação inclusiva"],
    155: ["Plataformas institucionais acessíveis em conformidade com o e-MAG", "Treinamento de professores para produção de conteúdos digitais acessíveis", "Ambas as ações com metas anuais de atualização"],

    # BLOCO 17
    156: ["Silêncio obrigatório, cadastro para empréstimos e devolução pontual", "Proibição de consumo de alimentos e bebidas no recinto", "Ambas as regras sob controle da equipe da biblioteca"],
    157: ["Uso obrigatório de jaleco, proibição de entrada sem professor e regras de descarte", "Termo de responsabilidade assinado pelos alunos antes das práticas", "Ambas as normas de biossegurança descritas"],
    158: ["Uso restrito para aulas de Educação Física e eventos escolares autorizados", "Acesso livre durante os intervalos de turno sem necessidade de monitores", "Uso de calçados adequados e proibição de jogos violentos"],
    159: ["Proibição de correr nos corredores e obstruir rotas de fuga", "Manutenção da limpeza das áreas de convivência e pátios", "Ambas as normas de circulação segura"],
    160: ["Responsabilidade direta pelo zelo de computadores e projetores", "Proibição de alteração de configurações de softwares sem aval", "Ambas as regras de proteção patrimonial"],
    161: ["Identificação do responsável, emissão de boletim interno e reposição", "Suspensão automática de uso de espaços para o autor do dano", "A escola assume os custos se o dano for considerado acidental"],

    # BLOCO 18
    162: ["Portaria com controle de crachá digital ou biometria", "Uso obrigatório de uniforme completo para entrada e permanência", "Ambas as ações de controle de entrada"],
    163: ["Registro na portaria com documento físico, foto e crachá de visitante", "Acompanhamento obrigatório por funcionário até a sala de destino", "Ambas as exigências documentais"],
    164: ["Apenas com autorização expressa por escrito ou presencial dos responsáveis", "Permitida livremente para alunos maiores de 16 anos", "Comunicação telefônica imediata e registro em livro próprio"],
    165: ["Acionamento imediato do SAMU e aviso simultâneo aos responsáveis", "Transporte do aluno pela escola ao pronto-socorro mais próximo", "Isolamento do aluno em sala de enfermaria até chegada dos pais"],
    166: ["Emissão do Boletim de Acidente Escolar (BAE) com registro de testemunhas", "Ata circunstanciada de ocorrência lavrada na secretaria", "Ambas as formas para resguardo legal"],
    167: ["Por telefone imediato em caso de emergência ou e-mail oficial", "Por meio de aviso urgente enviado por aplicativo institucional", "Ambos os meios de comunicação prioritária"],
    168: ["Treinamento anual de brigada de incêndio e evacuação rápida", "Instalação de câmeras de monitoramento em áreas comuns", "Todas as anteriores de segurança passiva e ativa"],

    # BLOCO 19
    169: ["Prontuário do aluno, histórico escolar e atas de resultados finais", "Livro de matrícula, diário de classe e plano de curso", "Todos os documentos citados"],
    170: ["Prontuário do aluno (dados pessoais e notas) e atas de conselho", "Apenas o livro de matrícula e atas de resultados finais", "Histórico Escolar e Certificados de Conclusão"],
    171: ["Em arquivo físico centralizado chaveado e backup em nuvem criptografado", "Apenas em arquivos digitais na plataforma da mantenedora", "Guarda física temporária por 5 anos, depois digitalização definitiva"],
    172: ["Sistema GED institucional com assinaturas digitais padrão ICP-Brasil", "Salvar em arquivos PDF na rede local da escola", "Apenas por meio do diário oficial digital estadual"],
    173: ["Pela secretaria escolar com assinatura do Diretor e Secretário", "Prazo máximo de 5 dias úteis para emissão de certidões e históricos", "Ambos os requisitos sob normas de emissão célere"],
    174: ["Mediante processo de retificação documental instruído e assinado pelo Diretor", "Correção digital imediata pelo secretário com anotação no prontuário", "Ambas as formas sob auditoria anual"],
    175: ["Criação de comissão de descarte de documentos sob tabela de temporalidade", "Eliminação por incineração ou trituração com lavratura de termo próprio", "Ambas as ações amparadas na legislação nacional de arquivos"],

    # BLOCO 20
    176: ["A Direção da Escola ou um terço (1/3) dos membros do Conselho Escolar", "O Grêmio Estudantil ou a APM de forma isolada", "Apenas a Mantenedora ou Diretoria de Ensino"],
    177: ["Uma comissão especial de revisão eleita no Conselho Escolar", "A equipe gestora juntamente com a assessoria jurídica", "O Conselho Escolar reunido em sessão ordinária"],
    178: ["O Conselho Escolar por voto majoritário e homologação do Diretor", "A Diretoria de Ensino ou órgão superior da Mantenedora", "A maioria simples de toda a comunidade escolar em assembleia"],
    179: ["Dois terços (2/3) dos votos dos membros do Conselho Escolar", "Maioria absoluta (50% + 1) do Conselho Escolar", "Unanimidade dos conselheiros presentes"],
    180: ["Publicação no site oficial do CEMEP, mural físico e reuniões com pais", "Envio do documento completo em PDF por correio eletrônico", "Ambos os canais de divulgação de ampla escala"],
    181: ["No início do ano letivo subsequente ao de sua aprovação", "Imediatamente após homologação pelo órgão superior", "30 dias após sua publicação oficial na escola"],
}

# Ensure directories exist
os.makedirs("c:\\Projects\\diogo\\regimento", exist_ok=True)

# Parse Matriz_Decisoes_Regimento_CEMEP.md to extract questions
md_path = "c:\\Projects\\diogo\\regimento\\Matriz_Decisoes_Regimento_CEMEP.md"
with open(md_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

current_block = None
blocks = []

block_id_counter = 0

for line in lines:
    line = line.strip()
    if line.startswith("# BLOCO"):
        block_id_counter += 1
        current_block = {
            "id": block_id_counter,
            "titulo": line.replace("#", "").strip(),
            "perguntas": []
        }
        blocks.append(current_block)
    elif line.startswith("## ") and current_block is not None:
        # We can append subheadings to current block or ignore. Let's keep it clean
        pass
    elif current_block is not None:
        # Look for question like "1. O Conselho Escolar será consultivo, deliberativo ou ambos?"
        # Match pattern: number. Question
        import re
        match = re.match(r"^(\d+)\.\s+(.*)", line)
        if match:
            q_num = int(match.group(1))
            q_text = match.group(2).strip()
            
            # Fetch options
            options = options_map.get(q_num, ["Sim", "Não", "A critério da comissão/Direção"])
            
            current_block["perguntas"].append({
                "num": q_num,
                "texto": q_text,
                "opcoes": options
            })

data["blocos"] = blocks

# Save to perguntas.json
json_path = "c:\\Projects\diogo\\regimento\\perguntas.json"
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Perguntas salvas com sucesso em: {json_path}")
print(f"Total de blocos: {len(blocks)}")
total_q = sum(len(b["perguntas"]) for b in blocks)
print(f"Total de perguntas: {total_q}")
