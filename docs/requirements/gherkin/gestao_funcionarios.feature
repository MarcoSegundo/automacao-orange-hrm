# language: pt
@pim
Funcionalidade: Gestao de funcionarios no PIM
  Como usuario responsavel pelo PIM
  Quero cadastrar, consultar, editar e excluir funcionarios
  Para manter os dados organizados e consistentes

  Contexto:
    Dado que o usuario esta autenticado
    E acessa o modulo PIM

  @P0 @add_employee_valido
  Cenario: Cadastro de funcionario deve ser concluido com sucesso
    Dado que o usuario inicia o cadastro de um funcionario
    Quando informa os dados obrigatorios
    E conclui o cadastro
    Entao o sistema deve registrar o funcionario

  @P1 @campo_obrigatorio
  Cenario: Cadastro sem nome completo deve ser impedido
    Dado que o usuario inicia o cadastro de um funcionario
    E nao informa o nome completo
    Quando tenta concluir o cadastro
    Entao o sistema deve impedir a conclusao do cadastro
    E deve indicar a obrigatoriedade do nome completo

  @P1 @employee_list
  Cenario: Lista de funcionarios deve exibir registros com colunas esperadas
    Dado que o usuario esta na pagina da lista de funcionarios
    Entao o sistema deve exibir a lista de funcionarios com as colunas esperadas
    E deve apresentar os registros de funcionarios disponiveis

  @P0 @edicao_funcionario
  Cenario: Edicao de funcionario deve atualizar dados cadastrais
    Dado que existe um funcionario cadastrado
    Quando o usuario atualiza os dados cadastrais do funcionario
    Entao os dados do funcionario devem ser atualizados no sistema

  @P0 @exclusao_de_funcionario
  Cenario: Exclusao de funcionario deve remover o cadastro e revogar o acesso associado
    Dado que existe um funcionario cadastrado
    Quando o usuario solicita a exclusao do funcionario
    E confirma a exclusao do funcionario
    Entao o funcionario deve ser removido do sistema
    E o acesso associado ao funcionario deve ser revogado
