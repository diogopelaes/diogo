# Manual de Uso do `style.css` e `script.js`

## Objetivo

Centralizar todo o CSS e todo o JavaScript em arquivos separados do
HTML, facilitando:

-   manutenção;
-   reutilização entre roteiros;
-   organização do projeto;
-   redução do tamanho do HTML.

------------------------------------------------------------------------

## Estrutura recomendada

``` text
projeto/
│
├── index.html
├── style.css
└── script.js
```

Os três arquivos devem permanecer na mesma pasta.

------------------------------------------------------------------------

## Como importar o CSS

Dentro da seção `<head>` do HTML, remova qualquer bloco:

``` html
<style>
...
</style>
```

e substitua por:

``` html
<link rel="stylesheet" href="style.css">
```

------------------------------------------------------------------------

## Como importar o JavaScript

Remova qualquer bloco:

``` html
<script>
...
</script>
```

e substitua por:

``` html
<script src="script.js"></script>
```

A recomendação é colocar essa linha imediatamente antes de `</body>`.

------------------------------------------------------------------------

## O que deve ficar no HTML

O HTML deve conter apenas:

-   estrutura da página;
-   textos;
-   cards;
-   endereços;
-   botões;
-   imagens;
-   links.

Não coloque regras CSS nem funções JavaScript diretamente no HTML.

------------------------------------------------------------------------

## O que deve ficar em `style.css`

Todo o conteúdo visual:

-   cores;
-   fontes;
-   tamanhos;
-   margens;
-   espaçamentos;
-   animações;
-   layout;
-   modo escuro;
-   estilos dos cards;
-   estilos dos botões;
-   estilos dos campos de endereço.

------------------------------------------------------------------------

## O que deve ficar em `script.js`

Toda a lógica da página, por exemplo:

-   copiar endereço;
-   abrir Google Maps;
-   abrir Waze;
-   expandir informações;
-   filtros;
-   menus;
-   qualquer outra interação do usuário.

------------------------------------------------------------------------

## Vantagens

-   HTML muito menor.
-   Código organizado.
-   Fácil manutenção.
-   Mesmo CSS pode ser reutilizado em todos os roteiros.
-   Mesmo JavaScript pode ser reutilizado em todos os roteiros.
-   Alterações futuras precisam ser feitas em apenas um lugar.

------------------------------------------------------------------------

## Boas práticas

-   Nunca duplicar CSS dentro do HTML.
-   Nunca duplicar JavaScript dentro do HTML.
-   Sempre reutilizar `style.css` e `script.js`.
-   Deixar o HTML responsável apenas pelo conteúdo.
-   Manter nomes de classes consistentes entre todos os roteiros.

Essa organização facilita a evolução do projeto e permite que todos os
roteiros utilizem o mesmo padrão visual e as mesmas funcionalidades.
