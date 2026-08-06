# Base de Comandos GeoGebra – Geometria Espacial

---

## Questão 1 – Conceitos iniciais

### Item a) Quais são as noções primitivas da geometria espacial?

> Observação: As noções primitivas são ponto, reta e plano. Não possuem definição formal, são aceitas intuitivamente. Os comandos abaixo criam exemplos visuais de cada uma.

```
A = (1, 2, 0)
```

```
B = (3, 4, 0)
```

```
C = (2, 0, 3)
```

```
r = Reta(A, B)
```

```
α = Plano(A, B, C)
```

### Item b) O que é um ponto (ex: A, B, C)?

> Descrição: Um ponto é uma noção primitiva que indica posição, sem dimensão. Exemplificamos com pontos no espaço 3D.

```
A = (0, 0, 0)
```

```
B = (3, 0, 0)
```

```
C = (0, 4, 0)
```

```
D = (0, 0, 5)
```

### Item c) O que é uma reta (ex: r, s, t)?

> Descrição: Uma reta é um conjunto infinito de pontos alinhados, sem espessura e sem extremidades. Criamos retas passando por dois pontos.

```
A = (0, 0, 0)
```

```
B = (4, 3, 2)
```

```
r = Reta(A, B)
```

```
C = (1, 5, 0)
```

```
D = (3, 1, 4)
```

```
s = Reta(C, D)
```

### Item d) O que é um plano (ex: α, β, γ)?

> Descrição: Um plano é uma superfície infinita, sem espessura, determinada por três pontos não colineares.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 3, 0)
```

```
α = Plano(A, B, C)
```

```
D = (1, 1, 3)
```

```
E = (4, 1, 3)
```

```
F = (1, 4, 3)
```

```
β = Plano(D, E, F)
```

### Item e) Como se define o "Espaço" (conjunto de pontos)?

> Observação: O espaço é o conjunto de todos os pontos. Não se restringe a nenhum plano. Os comandos abaixo criam pontos espalhados por todo o espaço 3D, fora de um único plano, ilustrando a ideia.

```
P1 = (0, 0, 0)
```

```
P2 = (3, 0, 0)
```

```
P3 = (0, 3, 0)
```

```
P4 = (0, 0, 3)
```

```
P5 = (2, 2, 2)
```

```
P6 = (-1, 3, 4)
```

---

## Questão 2 – Representação e relações básicas

### Item a) Como pontos, retas e planos são representados na matemática?

> Descrição: Pontos são letras maiúsculas, retas são letras minúsculas, planos são letras gregas. Os comandos criam esses elementos para visualização.

```
A = (0, 0, 0)
```

```
B = (3, 2, 1)
```

```
C = (1, 4, 0)
```

```
r = Reta(A, B)
```

```
α = Plano(A, B, C)
```

### Item b) O que significa um ponto P pertencer a uma reta r (P ∈ r)?

> Descrição: Um ponto pertence a uma reta quando está sobre ela. Criamos uma reta e mostramos um ponto sobre ela e outro fora.

```
A = (0, 0, 0)
```

```
B = (4, 4, 4)
```

```
r = Reta(A, B)
```

```
P = (2, 2, 2)
```

> Observação: P está sobre a reta r (P ∈ r) pois é o ponto médio de A e B.

```
Q = (1, 3, 0)
```

> Observação: Q não pertence à reta r (Q ∉ r).

### Item c) O que significa uma reta r estar contida em um plano α (r ⊂ α)?

> Descrição: Uma reta está contida em um plano quando todos os seus pontos pertencem ao plano.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 3, 0)
```

```
α = Plano(A, B, C)
```

```
r = Reta(A, B)
```

> Observação: A reta r está inteiramente contida no plano α (r ⊂ α), pois A e B estão em α.

```
D = (2, 1, 0)
```

```
E = (3, 2, 0)
```

```
s = Reta(D, E)
```

> Observação: A reta s também está contida no plano α (s ⊂ α).

### Item d) Qual a relação entre pontos não colineares e a determinação de um plano α?

> Descrição: Três pontos não colineares (que não estão na mesma reta) determinam um único plano.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (2, 3, 0)
```

```
α = Plano(A, B, C)
```

> Observação: A, B e C não são colineares, logo determinam o plano α de forma única.

```
r = Reta(A, B)
```

> Observação: Se C estivesse sobre r, os três pontos seriam colineares e não determinariam um plano único.

### Item e) O que significa dizer que retas são coplanares?

> Descrição: Retas coplanares são retas que pertencem a um mesmo plano. Retas paralelas e retas concorrentes são coplanares.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 3, 0)
```

```
D = (4, 3, 0)
```

```
r = Reta(A, B)
```

```
s = Reta(C, D)
```

```
α = Plano(A, B, C)
```

> Observação: As retas r e s são coplanares pois ambas estão contidas no plano α (z = 0).

---

## Questão 3 – Retas no espaço

### Item a) Quando duas retas r e s são paralelas (r ∥ s)?

> Descrição: Duas retas são paralelas quando são coplanares e não possuem ponto em comum.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
r = Reta(A, B)
```

```
C = (0, 3, 0)
```

```
D = (4, 3, 0)
```

```
s = Reta(C, D)
```

> Observação: r ∥ s — ambas horizontais, mesma direção, sem ponto comum, contidas no plano z = 0.

### Item b) Quando duas retas são concorrentes?

> Descrição: Duas retas são concorrentes quando são coplanares e possuem exatamente um ponto em comum.

```
A = (0, 0, 0)
```

```
B = (4, 4, 0)
```

```
r = Reta(A, B)
```

```
C = (4, 0, 0)
```

```
D = (0, 4, 0)
```

```
s = Reta(C, D)
```

```
I = Interseção(r, s)
```

> Observação: As retas r e s são concorrentes e se cruzam no ponto I = (2, 2, 0).

### Item c) O que são retas paralelas coincidentes?

> Descrição: Retas coincidentes são retas que possuem todos os pontos em comum — são a mesma reta.

```
A = (0, 0, 0)
```

```
B = (3, 3, 3)
```

```
r = Reta(A, B)
```

```
C = (1, 1, 1)
```

```
D = (2, 2, 2)
```

```
s = Reta(C, D)
```

> Observação: As retas r e s são coincidentes pois C e D pertencem à reta r. São a mesma reta.

### Item d) O que são retas reversas?

> Descrição: Retas reversas são retas que NÃO são coplanares — não há plano que contenha ambas. Não são paralelas nem concorrentes.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
r = Reta(A, B)
```

```
C = (0, 2, 1)
```

```
D = (0, 2, 4)
```

```
s = Reta(C, D)
```

> Observação: r está no plano z = 0 ao longo do eixo x. s é vertical e está deslocada. Não existe um plano que contenha ambas — são reversas.

### Item e) Qual a diferença principal entre retas paralelas e reversas em relação a estarem contidas num mesmo plano α?

> Descrição: Paralelas são coplanares (existe plano que as contém). Reversas não são coplanares (nenhum plano as contém simultaneamente). Os comandos abaixo mostram os dois casos.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
r = Reta(A, B)
```

```
C = (0, 3, 0)
```

```
D = (4, 3, 0)
```

```
s_par = Reta(C, D)
```

```
α = Plano(A, B, C)
```

> Observação: r e s_par são paralelas — ambas no plano α.

```
E = (1, 0, 2)
```

```
F = (1, 4, 2)
```

```
s_rev = Reta(E, F)
```

> Observação: r e s_rev são reversas — não há plano que contenha ambas.

---

## Questão 4 – Planos no espaço

### Item a) Quando dois planos α e β são paralelos (α ∥ β)?

> Descrição: Dois planos são paralelos quando não possuem nenhum ponto em comum.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 3, 0)
```

```
α = Plano(A, B, C)
```

```
D = (0, 0, 3)
```

```
E = (4, 0, 3)
```

```
F = (0, 3, 3)
```

```
β = Plano(D, E, F)
```

> Observação: α (z = 0) e β (z = 3) são planos paralelos — não possuem interseção.

### Item b) Quando dois planos α e β são secantes?

> Descrição: Dois planos são secantes quando possuem pontos em comum, formando uma reta de interseção.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 3, 0)
```

```
α = Plano(A, B, C)
```

```
D = (0, 0, 0)
```

```
E = (4, 0, 0)
```

```
F = (2, 0, 3)
```

```
β = Plano(D, E, F)
```

> Observação: α e β se cruzam — são planos secantes.

### Item c) O que é a intersecção α ∩ β entre dois planos secantes?

> Descrição: A intersecção de dois planos secantes é o conjunto de pontos que pertencem a ambos os planos.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 4, 0)
```

```
α = Plano(A, B, C)
```

```
D = (0, 0, 0)
```

```
E = (4, 0, 0)
```

```
F = (2, 2, 3)
```

```
β = Plano(D, E, F)
```

```
t = Interseção(α, β)
```

> Observação: t = α ∩ β é a reta de interseção dos planos secantes.

### Item d) Qual é a forma geométrica resultante dessa intersecção (traço)?

> Descrição: O traço (interseção) de dois planos secantes é sempre uma reta.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 4, 0)
```

```
α = Plano(A, B, C)
```

```
D = (0, 0, 0)
```

```
E = (4, 0, 0)
```

```
F = (0, 0, 4)
```

```
β = Plano(D, E, F)
```

```
traço = Interseção(α, β)
```

> Observação: O traço é a reta que passa por A e E — a intersecção é sempre uma reta.

---

## Questão 5 – Reta e plano

### Item a) Quais são as três posições relativas possíveis de uma reta r em relação a um plano α?

> Descrição: Uma reta pode estar (1) contida no plano, (2) paralela ao plano, ou (3) ser secante ao plano. Os comandos abaixo mostram cada caso.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 4, 0)
```

```
α = Plano(A, B, C)
```

```
r_contida = Reta(A, B)
```

> Observação: r_contida ⊂ α — a reta está contida no plano.

```
D = (0, 0, 2)
```

```
E = (4, 0, 2)
```

```
r_paralela = Reta(D, E)
```

> Observação: r_paralela ∥ α — a reta é paralela ao plano (não o toca).

```
F = (2, 2, -2)
```

```
G = (2, 2, 3)
```

```
r_secante = Reta(F, G)
```

> Observação: r_secante é secante a α — cruza o plano em exatamente um ponto.

### Item b) Quando uma reta r está contida em um plano α?

> Descrição: Quando todos os pontos da reta pertencem ao plano.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 3, 0)
```

```
α = Plano(A, B, C)
```

```
r = Reta(A, B)
```

> Observação: r ⊂ α — todos os pontos de r estão no plano α.

### Item c) Quando uma reta r é paralela a um plano α (r ∥ α)?

> Descrição: Quando a reta não possui nenhum ponto em comum com o plano e não está contida nele.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 3, 0)
```

```
α = Plano(A, B, C)
```

```
D = (0, 0, 2)
```

```
E = (4, 0, 2)
```

```
r = Reta(D, E)
```

> Observação: r ∥ α — a reta está a uma distância constante do plano, sem tocá-lo.

### Item d) Quando uma reta r é secante a um plano α?

> Descrição: Quando a reta possui exatamente um ponto em comum com o plano.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 3, 0)
```

```
α = Plano(A, B, C)
```

```
D = (2, 1, -3)
```

```
E = (2, 1, 3)
```

```
r = Reta(D, E)
```

```
P = Interseção(r, α)
```

> Observação: r é secante a α — cruza o plano no ponto P.

---

## Questão 6 – Determinação geométrica

### Item a) Quantos pontos distintos são necessários para determinar uma única reta?

> Descrição: Dois pontos distintos determinam uma única reta.

```
A = (1, 0, 0)
```

```
B = (4, 3, 2)
```

```
r = Reta(A, B)
```

> Observação: Dois pontos distintos A e B determinam uma única reta r.

### Item b) Quantos pontos são necessários para determinar um único plano?

> Descrição: Três pontos não colineares determinam um único plano.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (2, 3, 0)
```

```
α = Plano(A, B, C)
```

> Observação: Três pontos não colineares A, B e C determinam o plano α de forma única.

### Item c) Por que a condição de "não colinearidade" é exigida no postulado da determinação de um plano por pontos?

> Descrição: Se os três pontos forem colineares (estiverem na mesma reta), infinitos planos passam por eles — não há unicidade. Os comandos mostram três pontos colineares.

```
A = (0, 0, 0)
```

```
B = (2, 2, 2)
```

```
C = (4, 4, 4)
```

```
r = Reta(A, B)
```

> Observação: A, B e C estão todos na reta r (são colineares). Infinitos planos passam por essa reta. Não determinam um plano único.

### Item d) Quais são os quatro modos apresentados de se determinar a posição de um plano no espaço?

> Descrição: (1) Três pontos não colineares, (2) Uma reta e um ponto fora dela, (3) Duas retas concorrentes, (4) Duas retas paralelas.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 3, 0)
```

```
α1 = Plano(A, B, C)
```

> Observação: Modo 1 — Três pontos não colineares.

```
D = (0, 0, 2)
```

```
E = (3, 0, 2)
```

```
r1 = Reta(D, E)
```

```
F = (1, 2, 2)
```

```
α2 = Plano(D, E, F)
```

> Observação: Modo 2 — Uma reta r1 e um ponto F fora dela determinam o plano α2.

```
G = (0, 0, 4)
```

```
H = (3, 0, 4)
```

```
r2 = Reta(G, H)
```

```
I = (0, 0, 4)
```

```
J = (0, 3, 4)
```

```
r3 = Reta(I, J)
```

```
α3 = Plano(G, H, J)
```

> Observação: Modo 3 — Duas retas concorrentes r2 e r3 (cruzam-se em G = I) determinam o plano α3.

```
K = (0, 0, 6)
```

```
L = (3, 0, 6)
```

```
r4 = Reta(K, L)
```

```
M = (0, 2, 6)
```

```
N = (3, 2, 6)
```

```
r5 = Reta(M, N)
```

```
α4 = Plano(K, L, M)
```

> Observação: Modo 4 — Duas retas paralelas r4 e r5 determinam o plano α4.

---

## Questão 7 – Paralelismo e propriedades

### Item a) O que diz o postulado das paralelas (ou postulado de Euclides)?

> Descrição: Por um ponto fora de uma reta, passa uma e somente uma reta paralela à reta dada.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
r = Reta(A, B)
```

```
P = (2, 3, 0)
```

```
s = Reta(P, P + (4, 0, 0))
```

> Observação: s é a única reta que passa por P e é paralela a r — postulado de Euclides.

### Item b) Dada uma reta r e um ponto P fora dela (P ∉ r), quantas retas paralelas a ela passam por esse ponto?

> Descrição: Exatamente uma reta paralela. Visualizamos a reta e sua paralela pelo ponto.

```
A = (0, 0, 0)
```

```
B = (5, 0, 0)
```

```
r = Reta(A, B)
```

```
P = (1, 4, 0)
```

```
s = Reta(P, P + (5, 0, 0))
```

> Observação: Existe uma e somente uma reta s passando por P e paralela a r.

### Item c) Se uma reta r não está contida em um plano α e é paralela a uma reta s desse plano, o que se pode concluir sobre a relação de r com o plano α?

> Descrição: Então r é paralela ao plano α. Mostramos r fora do plano, paralela a s que está no plano.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 3, 0)
```

```
α = Plano(A, B, C)
```

```
s = Reta(A, B)
```

> Observação: s está contida em α.

```
D = (0, 0, 3)
```

```
E = (4, 0, 3)
```

```
r = Reta(D, E)
```

> Observação: r ∥ s e r não está contida em α, portanto r ∥ α.

---

## Questão 8 – Ângulos no espaço

### Item a) Como se define o ângulo entre duas retas concorrentes?

> Descrição: É o menor ângulo formado entre as retas no ponto de interseção.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
r = Reta(A, B)
```

```
C = (0, 0, 0)
```

```
D = (3, 3, 0)
```

```
s = Reta(C, D)
```

```
θ = Ângulo(B, A, D)
```

> Observação: θ é o ângulo entre as retas concorrentes r e s no vértice A (= C).

### Item b) O que são ângulos opostos pelo vértice?

> Descrição: São os ângulos não adjacentes formados por duas retas concorrentes. São congruentes.

```
A = (-3, -3, 0)
```

```
B = (3, 3, 0)
```

```
r = Reta(A, B)
```

```
C = (-3, 3, 0)
```

```
D = (3, -3, 0)
```

```
s = Reta(C, D)
```

```
O = (0, 0, 0)
```

```
θ1 = Ângulo(B, O, C)
```

```
θ2 = Ângulo(A, O, D)
```

> Observação: θ1 e θ2 são ângulos opostos pelo vértice — são congruentes (mesma medida).

### Item c) Como é definido o ângulo entre duas retas reversas?

> Descrição: Traça-se por um ponto qualquer duas retas paralelas às reversas. O ângulo entre essas retas concorrentes é o ângulo entre as reversas.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
r = Reta(A, B)
```

```
C = (1, 2, 3)
```

```
D = (1, 5, 3)
```

```
s = Reta(C, D)
```

> Observação: r e s são reversas.

```
O = (0, 0, 0)
```

```
r' = Reta(O, O + (4, 0, 0))
```

```
s' = Reta(O, O + (0, 3, 0))
```

```
θ = Ângulo((4, 0, 0), O, (0, 3, 0))
```

> Observação: θ é o ângulo entre as retas reversas r e s, obtido pelas retas r' e s' paralelas a elas passando por O.

---

## Questão 9 – Perpendicularidade

### Item a) Quando duas retas concorrentes são chamadas de perpendiculares (r ⊥ s)?

> Descrição: Quando o ângulo entre elas é de 90° (um ângulo reto).

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
r = Reta(A, B)
```

```
C = (0, 0, 0)
```

```
D = (0, 4, 0)
```

```
s = Reta(C, D)
```

```
θ = Ângulo(B, A, D)
```

> Observação: θ = 90° — as retas r e s são perpendiculares (r ⊥ s).

### Item b) O que são retas concorrentes oblíquas?

> Descrição: São retas concorrentes que formam ângulos diferentes de 90°.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
r = Reta(A, B)
```

```
C = (0, 0, 0)
```

```
D = (3, 2, 0)
```

```
s = Reta(C, D)
```

```
θ = Ângulo(B, A, D)
```

> Observação: θ ≠ 90° — as retas r e s são concorrentes oblíquas.

### Item c) O que significa dizer que duas retas reversas são ortogonais?

> Descrição: Duas retas reversas são ortogonais quando, ao traçar paralelas a elas por um mesmo ponto, as retas resultantes são perpendiculares (formam 90°).

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
r = Reta(A, B)
```

```
C = (1, 2, 3)
```

```
D = (1, 6, 3)
```

```
s = Reta(C, D)
```

> Observação: r (direção do eixo x) e s (direção do eixo y) são reversas.

```
O = (0, 0, 0)
```

```
r' = Reta(O, (4, 0, 0))
```

```
s' = Reta(O, (0, 4, 0))
```

```
θ = Ângulo((4, 0, 0), O, (0, 4, 0))
```

> Observação: θ = 90° — as retas reversas r e s são ortogonais.

### Item d) Quando uma reta secante é considerada perpendicular a um plano (r ⊥ α)?

> Descrição: Quando a reta é perpendicular a todas as retas do plano que passam pelo ponto de interseção.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 3, 0)
```

```
α = Plano(A, B, C)
```

```
D = (2, 1, 0)
```

```
E = (2, 1, 5)
```

```
r = Reta(D, E)
```

```
P = (2, 1, 0)
```

> Observação: r é perpendicular ao plano α (r ⊥ α). A reta r é vertical e o plano α é horizontal (z = 0).

```
s1 = Reta(P, P + (1, 0, 0))
```

```
s2 = Reta(P, P + (0, 1, 0))
```

> Observação: r é perpendicular tanto a s1 quanto a s2 (e a qualquer reta do plano que passe por P).

---

## Questão 10 – Planos e perpendicularidade

### Item a) Quando dois planos secantes são considerados perpendiculares (α ⊥ β)?

> Descrição: Quando o ângulo diédrico formado entre eles é de 90°.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 4, 0)
```

```
α = Plano(A, B, C)
```

```
D = (0, 0, 0)
```

```
E = (4, 0, 0)
```

```
F = (0, 0, 4)
```

```
β = Plano(D, E, F)
```

> Observação: α (plano xy, z = 0) e β (plano xz, y = 0) são perpendiculares — o ângulo diédrico é 90°.

### Item b) Quando dois planos secantes são considerados oblíquos?

> Descrição: Quando o ângulo diédrico entre eles é diferente de 90°.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 4, 0)
```

```
α = Plano(A, B, C)
```

```
D = (0, 0, 0)
```

```
E = (4, 0, 0)
```

```
F = (2, 2, 3)
```

```
β = Plano(D, E, F)
```

> Observação: α e β são secantes oblíquos — o ângulo diédrico é diferente de 90°.

---

## Questão 11 – Projeções

### Item a) O que é a projeção ortogonal de um ponto P sobre um plano α?

> Descrição: É o pé da perpendicular baixada de P até o plano α.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 4, 0)
```

```
α = Plano(A, B, C)
```

```
P = (2, 3, 5)
```

```
P' = (2, 3, 0)
```

```
seg = Segmento(P, P')
```

> Observação: P' é a projeção ortogonal de P sobre α. O segmento PP' é perpendicular ao plano α.

### Item b) Como se define a projeção ortogonal de uma reta r sobre um plano α?

> Descrição: É o conjunto das projeções ortogonais de todos os pontos da reta sobre o plano.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 4, 0)
```

```
α = Plano(A, B, C)
```

```
P = (1, 1, 3)
```

```
Q = (3, 2, 4)
```

```
r = Reta(P, Q)
```

```
P' = (1, 1, 0)
```

```
Q' = (3, 2, 0)
```

```
r' = Reta(P', Q')
```

```
seg1 = Segmento(P, P')
```

```
seg2 = Segmento(Q, Q')
```

> Observação: r' é a projeção ortogonal da reta r sobre o plano α. As linhas tracejadas PP' e QQ' são perpendiculares ao plano.

### Item c) Como se define a projeção ortogonal de um segmento de reta AB sobre um plano α?

> Descrição: É o segmento A'B', onde A' e B' são as projeções ortogonais dos extremos A e B sobre o plano.

```
A_orig = (1, 1, 4)
```

```
B_orig = (3, 3, 2)
```

```
seg_AB = Segmento(A_orig, B_orig)
```

```
O1 = (0, 0, 0)
```

```
O2 = (4, 0, 0)
```

```
O3 = (0, 4, 0)
```

```
α = Plano(O1, O2, O3)
```

```
A' = (1, 1, 0)
```

```
B' = (3, 3, 0)
```

```
seg_proj = Segmento(A', B')
```

```
seg_pA = Segmento(A_orig, A')
```

```
seg_pB = Segmento(B_orig, B')
```

> Observação: seg_proj (A'B') é a projeção ortogonal do segmento AB sobre o plano α.

---

## Questão 12 – Distâncias no espaço

### Item a) Como se define a medida de distância entre dois pontos distintos A e B (dAB)?

> Descrição: É o comprimento do segmento AB.

```
A = (0, 0, 0)
```

```
B = (3, 4, 0)
```

```
seg = Segmento(A, B)
```

```
d = Distância(A, B)
```

> Observação: d = 5 — é a medida do segmento AB (comprimento = √(3² + 4²) = 5).

### Item b) Qual é o caminho de menor medida de comprimento entre dois pontos A e B no espaço?

> Descrição: O segmento de reta AB. É a menor distância entre dois pontos.

```
A = (0, 0, 0)
```

```
B = (3, 4, 5)
```

```
seg = Segmento(A, B)
```

```
d = Distância(A, B)
```

> Observação: O segmento de reta AB é o caminho mais curto entre A e B no espaço. d = √(9 + 16 + 25) = √50.

### Item c) Como é definida a medida de distância de um ponto P a uma reta r?

> Descrição: É o comprimento do segmento perpendicular de P até a reta r (o menor segmento de P à reta).

```
A = (0, 0, 0)
```

```
B = (6, 0, 0)
```

```
r = Reta(A, B)
```

```
P = (3, 4, 0)
```

```
P' = (3, 0, 0)
```

```
seg = Segmento(P, P')
```

```
d = Distância(P, r)
```

> Observação: d = 4 — é a distância perpendicular de P à reta r. P' é o pé da perpendicular.

### Item d) Como é definida a medida de distância de um ponto P a um plano α?

> Descrição: É o comprimento do segmento perpendicular de P até o plano α.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 4, 0)
```

```
α = Plano(A, B, C)
```

```
P = (2, 2, 7)
```

```
P' = (2, 2, 0)
```

```
seg = Segmento(P, P')
```

```
d = Distância(P, α)
```

> Observação: d = 7 — distância perpendicular de P ao plano α (z = 0).

### Item e) Como se obtém a medida de distância entre duas retas paralelas r e s?

> Descrição: Escolhe-se um ponto em uma das retas e mede-se a distância perpendicular até a outra reta.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
r = Reta(A, B)
```

```
C = (0, 3, 0)
```

```
D = (4, 3, 0)
```

```
s = Reta(C, D)
```

```
P = (2, 0, 0)
```

```
P' = (2, 3, 0)
```

```
seg = Segmento(P, P')
```

```
d = Distância(r, s)
```

> Observação: d = 3 — distância entre as retas paralelas r e s.

### Item f) Como é definida a medida de distância entre dois planos paralelos α e β?

> Descrição: Escolhe-se um ponto em um plano e mede-se a distância perpendicular até o outro plano.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 4, 0)
```

```
α = Plano(A, B, C)
```

```
D = (0, 0, 5)
```

```
E = (4, 0, 5)
```

```
F = (0, 4, 5)
```

```
β = Plano(D, E, F)
```

```
P = (1, 1, 0)
```

```
P' = (1, 1, 5)
```

```
seg = Segmento(P, P')
```

```
d = Distância(α, β)
```

> Observação: d = 5 — distância entre os planos paralelos α (z = 0) e β (z = 5).

### Item g) Como se obtém a medida de distância entre retas reversas r e s?

> Descrição: É o comprimento do segmento perpendicular comum às duas retas (o menor segmento que liga as duas retas, sendo perpendicular a ambas).

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
r = Reta(A, B)
```

```
C = (0, 3, 2)
```

```
D = (0, 6, 2)
```

```
s = Reta(C, D)
```

```
d = Distância(r, s)
```

> Observação: d é a distância entre as retas reversas r e s — é a medida da perpendicular comum (a menor distância entre elas).

---

## Questão 13 – Síntese conceitual

### Item a) Quais são os principais conceitos (noções e proposições primitivas) fundamentais da geometria espacial?

> Observação: Esta questão é teórica. Os conceitos fundamentais são: ponto, reta e plano (noções primitivas) e as relações de pertinência e inclusão (proposições primitivas). Os comandos abaixo recapitulam visualmente.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 3, 0)
```

```
r = Reta(A, B)
```

```
α = Plano(A, B, C)
```

> Observação: Ponto A, reta r e plano α — as três noções primitivas da geometria espacial.

### Item b) Como o paralelismo e a perpendicularidade ajudam a definir as posições relativas estudadas?

> Descrição: Paralelismo e perpendicularidade classificam as relações entre retas e planos. Os comandos mostram retas paralelas, perpendiculares e planos perpendiculares.

```
A = (0, 0, 0)
```

```
B = (4, 0, 0)
```

```
C = (0, 3, 0)
```

```
α = Plano(A, B, C)
```

```
r_paralela = Reta((0, 0, 3), (4, 0, 3))
```

> Observação: r_paralela ∥ α — exemplo de paralelismo reta-plano.

```
r_perp = Reta((2, 1, 0), (2, 1, 5))
```

> Observação: r_perp ⊥ α — exemplo de perpendicularidade reta-plano.

```
D = (0, 0, 0)
```

```
E = (4, 0, 0)
```

```
F = (0, 0, 4)
```

```
β = Plano(D, E, F)
```

> Observação: α ⊥ β — exemplo de perpendicularidade entre planos.

### Item c) Como esses conceitos geométricos se aplicam nas situações e objetos reais descritos no material?

> Observação: Esta questão é discursiva e não requer comandos GeoGebra. Os conceitos de paralelismo, perpendicularidade, retas reversas e planos se aplicam a objetos reais como: pernas de mesas (retas paralelas ou perpendiculares ao chão), estrutura de espreguiçadeiras (retas concorrentes e ângulos), cantoneiras (planos perpendiculares), varais de chão (retas paralelas).
