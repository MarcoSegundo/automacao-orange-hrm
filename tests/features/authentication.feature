@autenticacao
Feature: Autenticacao no OrangeHRM
  Como usuario do sistema
  Quero me autenticar com seguranca
  Para acessar apenas areas permitidas

  Background:
    Given que o usuario esta na tela de login

  @smoke
  Scenario: A01 Login valido deve conceder acesso ao painel principal
    Given que o usuario possui credenciais validas
    When solicita autenticacao
    Then o sistema deve conceder acesso ao painel principal

  @smoke
  Scenario: A02 Login invalido deve ser rejeitado com mensagem especifica
    Given que o usuario possui credenciais invalidas
    When solicita autenticacao
    Then o sistema deve permanecer na tela de login
    And deve sinalizar credenciais invalidas

  @smoke
  Scenario: A03 Acesso a rota protegida sem sessao deve ser negado
    Given que o usuario nao possui sessao autenticada
    When tenta acessar uma area protegida
    Then o sistema deve negar acesso a area protegida
