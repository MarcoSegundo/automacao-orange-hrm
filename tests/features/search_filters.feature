@search
Feature: Busca e filtros no PIM
  Como usuario do PIM
  Quero localizar funcionarios com filtros e busca
  Para encontrar informacoes rapidamente

  Background:
    Given que o usuario esta autenticado
    And acessa a lista de funcionarios do PIM

  @smoke
  Scenario: B01 Busca por nome deve retornar um resultado
    Given que existe um funcionario correspondente na base
    When o usuario busca por nome
    Then o sistema deve retornar um resultado correspondente
