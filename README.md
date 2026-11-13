# Portfólio — Daniel Souza

Site de portfólio (filmmaking, edição, motion design e desenvolvimento).
HTML, CSS e JavaScript puros, sem etapa de build.

- **Three.js** — fundo de código em shader com "vidro líquido" e cristal 3D de vidro
- **GSAP + ScrollTrigger** — animações ligadas ao scroll (troca de imagem, zoom, galeria horizontal)
- **Lenis** — scroll suave

## Rodar localmente

Os scripts são módulos ES, então o site precisa de um servidor (abrir o arquivo direto não funciona):

```bash
python3 -m http.server 4173
# abra http://localhost:4173
```

## Estrutura

```
index.html              página principal
html/identidade.html    guia da identidade visual
css/
  tokens.css            cores, fontes, espaçamentos (a identidade mora aqui)
  base.css              reset e tipografia
  components.css        vidro, botões, navegação, cursor, preloader, lightbox
  sections.css          estilos de cada seção
  brand.css             só para o guia de identidade
  vendor/               CSS de terceiros (Lenis)
js/
  main.js               ponto de entrada
  data/content.js       TEXTOS, IMAGENS E LINKS DOS PROJETOS  ← edite aqui
  core/                 scroll suave e utilitários de animação
  webgl/                cena Three.js (fundo, texturas de código, cristal)
  ui/                   navegação, cursor, vidro, preloader, lightbox
  sections/             animação de cada seção
  vendor/               Three.js, GSAP, ScrollTrigger, Lenis
assets/
  brand/                símbolo e favicon
  img/                  imagens das disciplinas e dos trabalhos
  video/                vídeos locais
```

## Trocar o conteúdo

Tudo em `js/data/content.js`:

- **Imagens**: coloque o arquivo em `assets/img/` e mude o caminho em `image` / `poster`.
  As imagens atuais são ilustrações provisórias.
- **Vídeos**: preencha `video` com um `.mp4` em `assets/video/` ou com um link de embed
  (`https://www.youtube.com/embed/ID`, `https://player.vimeo.com/video/ID`).
  Com o campo preenchido, o card vira clicável e o showreel ganha botão de play.
- **Repositórios**: lista `repos`.

A coreografia 3D de cada seção fica no objeto `KEYS` em `js/webgl/scene.js`.

## Publicar

É um site estático: funciona em GitHub Pages, Netlify ou Vercel sem configuração.
