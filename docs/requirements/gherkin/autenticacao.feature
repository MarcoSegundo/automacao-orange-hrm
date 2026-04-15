# language: pt
@autenticacao
Funcionalidade: Autenticacao no OrangeHRM
  Como usuario do sistema
  Quero me autenticar com seguranca
  Para acessar apenas areas permitidas

  Contexto:
    Dado que o usuario esta na tela de login

  @P0 @login_valido
  Cenario: Login valido deve conceder acesso ao painel principal
    Dado que o usuario possui credenciais validas
    Quando solicita autenticacao
    Entao o sistema deve conceder acesso ao painel principal

  @P0 @login_invalido
  Cenario: Login invalido deve ser rejeitado com mensagem especifica
    Dado que o usuario possui credenciais invalidas
    Quando solicita autenticacao
    Entao o sistema deve permanecer na tela de login
    E deve sinalizar credenciais invalidas

  @P0 @rota_protegida
  Cenario: Acesso a rota protegida sem sessao deve ser negado
    Dado que o usuario nao possui sessao autenticada
    Quando tenta acessar uma area protegida
    Entao o sistema deve negar acesso a area protegida

  @P1 @logout
  Cenario: Logout deve encerrar a sessao
    Dado que o usuario esta autenticado
    Quando solicita logout
    Entao o sistema deve encerrar a sessao
    E deve retornar para a tela de login

  @P2 @sessao_expirada
  Cenario: Sessao expirada deve exigir nova autenticacao
    Dado que a sessao do usuario expirou
    Quando tenta acessar uma area protegida
    Entao o sistema deve redirecionar para a tela de login
    E deve sinalizar que a sessao expirou


