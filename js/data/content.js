/**
 * CONTEÚDO DO SITE
 * ------------------------------------------------------------------
 * Tudo que é texto de projeto, imagem e link mora aqui.
 * Para trocar uma imagem: coloque o arquivo em assets/img/ e mude o caminho.
 * Para ligar um vídeo: preencha `video` com um .mp4 (assets/video/...)
 * ou com um link de embed do YouTube/Vimeo
 * (ex.: https://www.youtube.com/embed/ID ou https://player.vimeo.com/video/ID).
 */

export const disciplines = [
  {
    index: '01',
    title: 'Filmmaking',
    text: 'Captação em estúdio ou locação. Câmera, luz e áudio pensados para a história que a marca precisa contar.',
    tags: ['Direção de cena', 'Captação', 'Luz & áudio'],
    image: 'assets/img/daniel-producao.jpg',
    position: '50% 18%', // ponto da foto que fica visível no recorte
  },
  {
    index: '02',
    title: 'Edição de vídeo',
    text: 'Ritmo, corte, som e cor. O material bruto vira uma narrativa que prende do primeiro ao último segundo.',
    tags: ['Montagem', 'Color', 'Sound design'],
    image: 'assets/img/edicao-premiere.jpg',
  },
  {
    index: '03',
    title: 'Motion design',
    text: 'Tipografia cinética, infográficos e animações que explicam o que a câmera não alcança.',
    tags: ['Tipografia cinética', 'Infográficos', 'Animação'],
    motion: true, // peça animada com o nome (js/sections/kinetic.js)
  },
  {
    index: '04',
    title: 'Desenvolvimento',
    text: 'Python, C e SQL para resolver problemas reais, começando pelos do meu próprio fluxo de produção.',
    tags: ['Python', 'C', 'SQL', 'Front-end'],
    image: 'assets/img/dev-codigo.jpg',
    position: '50% 56%',
  },
];

export const showreel = {
  label: 'Edição para redes sociais',
  poster: 'assets/img/cliente-edicao-poster.jpg',
  video: 'assets/video/cliente-edicao.mp4',
};

export const works = [
  {
    client: 'Araújo Ferreira Engenharia',
    tags: ['Produção de vídeo'],
    logo: 'assets/img/clientes/araujo-ferreira.png',
    image: '', // foto/frame do trabalho (se houver, a logo vira selo no canto)
    video: '',
  },
  {
    client: 'Luene Guedes',
    tags: ['Produção de vídeo'],
    logo: '', // sem logo: mostra o nome
    image: '',
    video: '',
  },
  {
    client: 'Yes DF',
    tags: ['Produção de vídeo'],
    logo: 'assets/img/clientes/yes-df.png',
    image: '',
    video: '',
  },
  {
    client: 'Arranjô',
    tags: ['Produção de vídeo'],
    logo: 'assets/img/clientes/arranjo.png',
    image: '',
    video: '',
  },
];

export const repos = [
  {
    name: 'gestao-estoque-cli',
    url: 'https://github.com/danielsouzap/gestao-estoque-cli',
    stack: ['Python', 'SQLite'],
    text: 'CLI de controle de estoque para pequenos negócios: produtos, entradas e saídas, alerta de estoque baixo e KPIs de giro, nível de serviço e lead time. Queries parametrizadas contra SQL injection.',
  },
  {
    name: 'academia-boaforma-bd',
    url: 'https://github.com/danielsouzap/academia-boaforma-bd',
    stack: ['MySQL', 'SQL'],
    text: 'Banco de dados de uma academia, do modelo conceitual ao script físico: 11 tabelas, 31 consultas, 2 triggers e 3 stored procedures.',
  },
  {
    name: 'reserva-carros-sql',
    url: 'https://github.com/danielsouzap/reserva-carros-sql',
    stack: ['MySQL', 'SQL'],
    text: 'Banco relacional de uma locadora com várias sedes: 5 tabelas, 7 chaves estrangeiras, constraints UNIQUE e CHECK e testes de integridade que provam a rejeição de dados inválidos.',
  },
  {
    name: 'algoritmos-udf',
    url: 'https://github.com/danielsouzap/algoritmos-udf',
    stack: ['C'],
    text: 'Programas em C da disciplina de Algoritmos e Pensamento Computacional, com validação de entrada e casos-limite documentados.',
  },
];

export const stack = [
  { title: 'Construindo com', items: ['Python', 'C', 'SQL', 'MySQL', 'SQLite', 'Git'] },
  { title: 'Aprendendo agora', items: ['HTML', 'CSS', 'JavaScript'] },
  { title: 'Kit de criação', items: ['Premiere Pro', 'Lightroom', 'Photoshop', 'Canon'] },
];
