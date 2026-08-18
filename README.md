# 📖 Caderno de Receitas

Um caderno de receitas pessoal, digital e bonito — feito para guardar suas receitas com carinho e encontrar qualquer uma delas em segundos. Sem backend, sem cadastro, sem complicação: tudo roda no seu próprio navegador.

![status](https://img.shields.io/badge/status-em%20uso-99582A) ![tipo](https://img.shields.io/badge/tipo-projeto%20pessoal-3E6E76)

---

## ✨ Funcionalidades

- **Busca em tempo real** — encontre receitas pelo nome ou por qualquer ingrediente/passo digitado.
- **Categorias livres e coloridas** — crie categorias com o nome que quiser (Doces, Salgados, Bebidas...); cada uma ganha uma cor própria automaticamente, e vira um filtro rápido no topo da tela.
- **Tempo de preparo e porções** — campos dedicados para essas informações, exibidos direto no card da receita.
- **Seções flexíveis** — divida a receita em quantas partes quiser (ex: Massa, Recheio, Cobertura, Tempero), cada uma com seu próprio título e texto livre.
- **Modo de Preparo com passo a passo** — uma seção especial para os passos da receita, numerados automaticamente. Adicione, remova ou reordene passos e a numeração se ajusta sozinha.
- **Compartilhamento** — compartilhe qualquer receita com um clique (ícone de compartilhar no card ou dentro do editor). Se o dispositivo suportar, abre o menu nativo de compartilhamento (WhatsApp, e-mail, etc.); caso contrário, copia o texto formatado da receita para você colar onde quiser.
- **Tudo salvo no seu navegador** — as receitas ficam guardadas localmente (`localStorage`), sem precisar de internet ou de uma conta.
- **Design responsivo** — funciona bem tanto no computador quanto no celular.

---

## 🚀 Como usar

1. **Abra o arquivo `index.html`** no navegador (duplo clique nele, ou veja a seção [Como rodar localmente](#-como-rodar-localmente) abaixo).
2. Clique em **"Nova receita"** (ou no card tracejado com o `+`) para começar a anotar.
3. Preencha:
   - **Nome da receita**
   - **Categoria** (digite livremente — se já existir uma parecida, ela vai sugerir)
   - **Tempo de preparo** e **Porções** (opcionais)
4. Em **"Partes da receita"**, adicione seções:
   - **"+ Adicionar seção"** cria uma parte de texto livre (ideal para ingredientes, massa, recheio, observações...).
   - **"+ Adicionar modo de preparo"** cria uma lista de passos numerados — ótimo para o passo a passo do preparo.
5. Clique em **"Salvar receita"**.
6. Para editar ou excluir, basta clicar no card da receita na tela principal.
7. Use a **barra de busca** para localizar receitas rapidamente, ou clique nas **categorias** no topo para filtrar.
8. Para **compartilhar**, clique no ícone de compartilhar no card da receita (ou no editor, no canto superior) — a receita é formatada em texto e enviada pelo menu de compartilhamento do dispositivo ou copiada para a área de transferência.

> 💡 Todos os dados ficam guardados no navegador que você está usando. Se abrir o caderno em outro navegador ou computador, ele começará vazio — use o botão de compartilhar para levar receitas de um lugar a outro.

---

## 🗂️ Estrutura de arquivos

```
caderno-de-receitas/
├── index.html        → estrutura da página
├── css/
│   └── style.css      → toda a identidade visual
└── js/
    └── script.js       → lógica do app (busca, categorias, seções, salvar/editar/excluir, compartilhar)
```

---

## 🛠️ Tecnologias

Construído com **HTML, CSS e JavaScript puros** — sem frameworks, sem dependências externas, sem processo de build. Só abrir e usar.

- Fontes: [Fraunces](https://fonts.google.com/specimen/Fraunces), [Inter](https://fonts.google.com/specimen/Inter) e [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono), via Google Fonts.
- Armazenamento: `localStorage` do navegador.
- Compartilhamento: Web Share API (com fallback para área de transferência).

---

## 🎨 Identidade visual

O caderno usa uma paleta quente e artesanal, inspirada em papel e caramelo:

| Cor | Uso |
|---|---|
| `#99582A` Caramelo | cor principal, botões e categorias |
| `#FFE6A7` Amarelo pergaminho | fundo dos cards |
| `#3E6E76` Verde-azulado | categorias |
| `#B5657A` Rosa envelhecido | categorias |
| `#6E7F4A` Verde-oliva | categorias |
| `#8A6B1E` Dourado | categorias |

---

## 📌 Notas

- Não há sincronização entre dispositivos nem backup automático na nuvem — os dados vivem no navegador local. Para levar suas receitas para outro lugar, use o botão de compartilhar.
- Projeto pessoal, em evolução contínua: novas funcionalidades vão sendo adicionadas aos poucos.