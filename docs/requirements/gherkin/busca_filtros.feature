# language: pt
@busca
Funcionalidade: Busca e filtros no PIM
  Como usuario do PIM
  Quero localizar funcionarios com filtros e busca
  Para encontrar informacoes rapidamente

  Contexto:
    Dado que o usuario esta autenticado
    E acessa a lista de funcionarios do PIM

  @P0 @busca_nome_resultado_positivo
  Cenario: Busca por nome deve retornar um resultado
    Dado que existe um funcionario correspondente na base
    Quando o usuario busca por nome
    Entao o sistema deve retornar um resultado correspondente

  @P1 @busca_nome_autocomplete
  Cenario: Campo de nome deve sugerir funcionarios
    Dado que o usuario digita parte de um nome no campo de busca
    Entao o sistema deve oferecer sugestoes relacionadas ao texto informado
    E deve permitir selecionar uma sugestao valida
    E deve manter o campo preenchido com a opcao selecionada

  @P1 @busca_sem_resultado
  Cenario: Busca sem correspondencia deve informar ausencia de registros
    Dado que o usuario busca por um nome inexistente
    Quando executa a pesquisa
    Entao o sistema deve informar que nao ha registros correspondentes
    E nao deve retornar registros na tabela

  @P2 @filtros_combinados
  Cenario: Filtros combinados devem refinar resultados
    Dado que existem funcionarios com atributos diferentes
    Quando o usuario combina filtros de status, cargo, subunidade
    Entao o sistema deve retornar apenas funcionarios que atendem aos criterios informados

  @P2 @reset_preserva_estado
  Cenario: Limpeza de filtros deve restaurar o estado inicial
    Dado que o usuario aplicou filtros na listagem
    Quando redefine a busca
    Entao o sistema deve restaurar os filtros para o estado padrao
