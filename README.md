# Mater

**Mater** é um aplicativo inovador que funciona de maneira semelhante ao Uber, mas com foco em serviços de guincho. Com o Mater, você pode solicitar um guincho de forma rápida e fácil, diretamente pelo seu smartphone, tornando as solicitações de socorro na estrada muito mais simples e eficientes.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Execução](#instalação-e-execução)
- [Como Contribuir](#como-contribuir)
- [Licença](#licença)
- [Contato](#contato)

---

## Funcionalidades

- **Solicitação de Guincho:** Solicite um guincho com apenas alguns toques na tela, de forma rápida e intuitiva.  
- **Localização em Tempo Real:** Acompanhe a localização do seu guincho enquanto ele se dirige até você.  
- **Escolha de Serviços:** Selecione entre diferentes tipos de assistência, como reboque, troca de pneu, entrega de combustível, entre outros.  
- **Histórico de Solicitações:** Consulte todas as suas solicitações de guincho anteriores diretamente no aplicativo.  
- **Avaliação de Serviços:** Avalie o serviço prestado, contribuindo para a melhoria contínua dos profissionais cadastrados.

---

## Tecnologias Utilizadas

- **[React Native](https://reactnative.dev/):** Para desenvolvimento multiplataforma (iOS e Android).  
- **[Expo](https://expo.dev/):** Para simplificar o desenvolvimento, testes e execução do aplicativo.  
- **[TypeScript](https://www.typescriptlang.org/):** Para tipagem estática, auxiliando na qualidade e manutenção do código.  
- **[React Navigation](https://reactnavigation.org/):** Para navegação entre telas.  
- *(Opcional)* **Axios, Redux, Context API, etc.** dependendo da evolução do projeto, para requisições HTTP e gerenciamento de estado.

---

## Estrutura do Projeto

```plaintext
Mater/
├── .expo/
│   ├── devices.json
│   └── README.md
├── assets/
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── App.tsx
├── app.json
├── index.ts
├── LICENSE
├── package.json
├── README.md
└── tsconfig.json
```

## Instalação e Execução
- **Pré-requisitos**
  - Node.js (versão 14 ou superior)
  - Expo CLI instalada globalmente:
    ```
      npm install --global expo-cli
    ```
- **Clonar o Repositório**
  ```
    git clone https://github.com/seu-usuario/mater.git
    cd mater
  ```
- **Instalar Dependências**
  ```
    npm install
    # ou
    yarn
  ```
- **Executar o Projeto**
  ```npx expo start```
  - Será aberto o Expo DevTools no navegador.
  - Use um emulador ou o aplicativo Expo Go (iOS/Android) para rodar o app em seu dispositivo.
- **Construir para Produção (Opcional)**
  - Consulte a documentação do Expo para gerar APK (Android) ou IPA (iOS).

## Como Contribuir
- **Faça um Fork** do projeto.
- **Crie uma Branch** para a nova feature ou correção:
  ```git checkout -b minha-feature```
- **Implemente** suas alterações.
- **Commit** e **Push** para sua branch:
  ```
    git add .
    git commit -m "Implementa minha nova feature"
    git push origin minha-feature
  ```
- **Abra um Pull Request** no repositório principal descrevendo suas mudanças.

## Licença
Este projeto está licenciado sob os termos da LICENÇA MIT. Sinta-se livre para usar e modificar este código da maneira que desejar, respeitando os termos da licença.

## Contato
Caso tenha dúvidas, sugestões ou queira dar algum feedback, entre em contato:

- E-mail: matheushgevangelista@gmail.com
- LinkedIn: Matheus Henrique Gonzaga Evangelista

### Obrigado por usar o Mater!
Agradecemos a sua contribuição e feedback para tornar este aplicativo cada vez melhor.


> **Dica**: Ajuste as informações (como o link do repositório, nome do usuário e contato) conforme necessário para refletir o seu projeto.
