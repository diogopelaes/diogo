# agent-geogebra-html.md

# Objetivo

Procurar e ler o arquivo `base-comandos-geogebra.md` (ou arquivos divididos contendo a base de comandos do GeoGebra) e gerar **um único arquivo chamado obrigatoriamente `index.html`**.

O HTML será uma página de apoio ao estudo de Geometria Espacial utilizando o GeoGebra.

------------------------------------------------------------------------

# Arquivos de entrada

Ao executar a tarefa, o agente deve obrigatoriamente procurar no diretório pelo arquivo:

- `base-comandos-geogebra.md`

Caso o conteúdo esteja dividido em múltiplos arquivos, o agente também poderá procurar/receber partes como:

- `base-comandos-geogebra-parte-1.md`
- `base-comandos-geogebra-parte-2.md`
- `base-comandos-geogebra-parte-3.md`
- `base-comandos-geogebra-parte-4.md`

Se houver múltiplos arquivos, o agente deverá unir automaticamente todo o conteúdo em uma única página.

------------------------------------------------------------------------

# Arquivo de saída

Gerar obrigatoriamente:

``` text
index.html
```

Nenhum outro arquivo deverá ser criado.

Todo CSS deverá ficar dentro do próprio HTML.

Todo JavaScript deverá ficar dentro do próprio HTML.

Não utilizar bibliotecas externas.

Não depender de internet.

------------------------------------------------------------------------

# Objetivo da interface

Permitir que o usuário visualize cada construção e copie comandos
individuais para a Entrada do GeoGebra.

------------------------------------------------------------------------

# Regras obrigatórias

## Um comando = um cartão

Cada linha de comando deve gerar exatamente um cartão.

Cada cartão possui exatamente um botão de copiar.

Jamais colocar dois comandos no mesmo cartão.

Jamais copiar mais de uma linha por clique.

------------------------------------------------------------------------

## Ordem

Respeitar exatamente a ordem definida nos arquivos Markdown.

Nunca reorganizar.

------------------------------------------------------------------------

## Integridade

Jamais modificar:

-   comandos;
-   espaços;
-   letras;
-   símbolos;
-   acentos;
-   nomes dos objetos.

Copiar exatamente o texto exibido.

------------------------------------------------------------------------

## Estrutura

A página deverá possuir:

-   índice navegável;
-   capítulos recolhíveis;
-   busca por texto;
-   expandir tudo;
-   recolher tudo;
-   rolagem suave;
-   botão voltar ao topo.

------------------------------------------------------------------------

## Layout

Utilizar:

-   tema escuro;
-   baixo contraste;
-   aparência moderna;
-   cartões;
-   responsivo;
-   CSS interno;
-   JavaScript interno.

------------------------------------------------------------------------

## Cartões

Cada cartão deverá apresentar:

-   comando;
-   botão copiar.

Opcionalmente poderá apresentar:

-   observação;
-   descrição.

------------------------------------------------------------------------

## Botão copiar

Ao clicar:

-   copiar apenas aquela linha;
-   sem quebra de linha;
-   sem espaços extras;
-   sem markdown;
-   sem descrição.

Mostrar confirmação visual temporária.

------------------------------------------------------------------------

## Títulos

Preservar toda a hierarquia dos arquivos Markdown:

Questão

Item

Subitem

Descrição

Observações

------------------------------------------------------------------------

## Responsividade

A página deve funcionar corretamente em:

-   Desktop
-   Tablet
-   Celular

------------------------------------------------------------------------

## Acessibilidade

Utilizar:

-   contraste confortável;
-   navegação por teclado;
-   botões acessíveis;
-   fonte legível.

------------------------------------------------------------------------

# Restrições

Nunca:

-   alterar comandos;
-   traduzir comandos;
-   otimizar construções;
-   eliminar comandos repetidos;
-   agrupar cartões;
-   corrigir comandos automaticamente.

Caso algum comando pareça incorreto, ele deverá ser apresentado
exatamente como está no Markdown.

O agente apenas transforma o Markdown em uma interface HTML.

Jamais altera o conteúdo.
