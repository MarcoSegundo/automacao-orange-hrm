@pim
Feature: Gestao de funcionarios no PIM
  Como usuario responsavel pelo PIM
  Quero cadastrar, consultar, editar e excluir funcionarios
  Para manter os dados organizados e consistentes

  Background:
    Given que o usuario esta autenticado
    And acessa o modulo PIM

  @smoke @sanity @regression
  Scenario: G01 Cadastro de funcionario deve ser concluido com sucesso
    Given que o usuario inicia o cadastro de um funcionario
    When informa os dados obrigatorios
    And conclui o cadastro
    Then o sistema deve registrar o funcionario
    And o acesso associado deve ser concedido

  @smoke @regression @seeded-employee
  Scenario: G04 Edicao de funcionario deve atualizar dados cadastrais
    Given que existe um funcionario cadastrado
    When o usuario atualiza os dados cadastrais do funcionario
    Then os dados do funcionario devem ser atualizados no sistema

  @smoke @regression @delete-employee
  Scenario: G05 Exclusao de funcionario deve remover o cadastro e revogar o acesso associado
    Given que existe um funcionario cadastrado
    When o usuario solicita a exclusao do funcionario
    And confirma a exclusao do funcionario
    Then o funcionario deve ser removido do sistema
    And o acesso associado ao funcionario deve ser revogado
