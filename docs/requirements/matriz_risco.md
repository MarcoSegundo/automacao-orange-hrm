# Matriz de Prioridade - OrangeHRM (UI + BDD)

Base de validacao:

- Revisada apos observacao real da aplicacao via MCP.
- Alinhada com a estrategia: 15 cenarios mapeados + 7 para execucao imediata.

Nota sobre Gherkins:

- Os arquivos Gherkin usados como documentação e mapeamento estão em `docs/requirements/gherkin/` (ex.: `autenticacao.feature`, `busca_filtros.feature`, `gestao_funcionarios.feature`).
- A implementação executável dos mesmos cenários está em `tests/features/` (usado pelo Cucumber durante execucao).

## Algoritmo rapido (5 minutos)

Escala por eixo (0 a 3):

- Valor para o cliente (V)
  - 0 sem impacto percebido
  - 1 impacto baixo
  - 2 impacto relevante
  - 3 impacto direto no resultado principal
- Risco se falhar (R)
  - 0 falha toleravel
  - 1 ruido operacional
  - 2 quebra processo importante
  - 3 risco critico (acesso, seguranca, compliance, financeiro)
- Frequencia de uso (F)
  - 0 raro
  - 1 eventual
  - 2 frequente
  - 3 diario/massivo

Formula:

- Score = V + R + F (faixa de 0 a 9)

Faixas de prioridade:

- P0: 7 a 9
- P1: 5 a 6
- P2: 3 a 4
- P3: 0 a 2

Regras de desempate:

- Se R = 3, piso minimo P1.
- Se bloqueia acesso ao sistema, sobe para P0.
- Se depende de outro cenario, o pre-requisito executa antes.

## Aplicacao do algoritmo (15 cenarios)

| ID  | Funcionalidade      | Cenario                                                                      |   V |   R |   F | Score | Prioridade |
| --- | ------------------- | ---------------------------------------------------------------------------- | --: | --: | --: | ----: | ---------- |
| A01 | Autenticacao        | Login valido deve conceder acesso ao painel principal                        |   3 |   3 |   3 |     9 | P0         |
| A02 | Autenticacao        | Login invalido deve ser rejeitado com mensagem especifica                    |   3 |   3 |   3 |     9 | P0         |
| A03 | Autenticacao        | Acesso a rota protegida sem sessao deve ser negado                           |   3 |   3 |   2 |     8 | P0         |
| A04 | Autenticacao        | Logout deve encerrar a sessao                                                |   2 |   2 |   2 |     6 | P1         |
| A05 | Autenticacao        | Sessao expirada deve exigir nova autenticacao                                |   2 |   1 |   1 |     4 | P2         |
| G01 | Gestao Funcionarios | Cadastro de funcionario deve ser concluido com sucesso                       |   3 |   3 |   2 |     8 | P0         |
| G02 | Gestao Funcionarios | Cadastro sem nome completo deve ser impedido                                 |   2 |   2 |   2 |     6 | P1         |
| G03 | Gestao Funcionarios | Lista de funcionarios deve exibir registros com colunas esperadas            |   2 |   2 |   2 |     6 | P1         |
| G04 | Gestao Funcionarios | Edicao de funcionario deve atualizar dados cadastrais                        |   3 |   3 |   2 |     8 | P0         |
| G05 | Gestao Funcionarios | Exclusao de funcionario deve remover o cadastro e revogar o acesso associado |   3 |   3 |   2 |     8 | P0         |
| B01 | Busca/Filtros       | Busca por nome deve retornar um resultado                                    |   3 |   2 |   3 |     8 | P0         |
| B02 | Busca/Filtros       | Campo de nome deve sugerir funcionarios                                      |   2 |   1 |   3 |     6 | P1         |
| B03 | Busca/Filtros       | Busca sem correspondencia deve informar ausencia de registros                |   2 |   2 |   2 |     6 | P1         |
| B04 | Busca/Filtros       | Filtros combinados devem refinar resultados                                  |   2 |   1 |   1 |     4 | P2         |
| B05 | Busca/Filtros       | Limpeza de filtros deve restaurar o estado inicial                           |   1 |   1 |   2 |     4 | P2         |

## Ordem recomendada de execucao

1. P0 (7 cenarios): A01, A02, A03, G01, G04, G05, B01.
2. P1 (5 cenarios): A04, G02, G03, B02, B03.
3. P2 (3 cenarios): A05, B04, B05.

## Top 7 de execucao imediata (foco de entrega)

1. A01 - Login valido deve conceder acesso ao painel principal.
2. A02 - Login invalido deve ser rejeitado com mensagem especifica.
3. A03 - Acesso a rota protegida sem sessao deve ser negado.
4. G01 - Cadastro de funcionario deve ser concluido com sucesso.
5. G04 - Edicao de funcionario deve atualizar dados cadastrais.
6. G05 - Exclusao de funcionario deve remover o cadastro e revogar o acesso associado.
7. B01 - Busca por nome deve retornar um resultado.

## Como aplicar em qualquer feature nova

1. Liste de 5 a 10 cenarios candidatos.
2. Dê notas rapidas de V, R e F (0 a 3).
3. Some o score e classifique por faixas P0-P3.
4. Aplique os desempates (R=3, bloqueio de acesso, dependencia).
5. Selecione o Top N de execucao imediata.
