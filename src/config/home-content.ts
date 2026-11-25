/**
 * Copy and media from the original Framer build. Running text writes "Korum";
 * uppercase type presets render it in caps.
 */
import flutedPanelLandscape from '@/assets/images/fluted-panel-landscape.png';
import flutedPanelPortrait from '@/assets/images/fluted-panel-portrait.png';
import lightOrb from '@/assets/images/light-orb.jpg';
import type { LinkItem } from '@/components/types';
import { VISIT_INTERESTS, VISIT_PERIODS, type LeadType, type VisitInterest, type VisitPeriod } from '@/features/leads';
import { anchorTo, contact, sectionIds } from './site';

const bookVisitAnchor = anchorTo(sectionIds.bookVisit);

export const heroContent = {
  id: sectionIds.top,
  intro: {
    inlineLead: '— estúdio',
    standaloneLead: 'Estúdio',
    text: 'de conteúdo e marca em Maringá. Estratégia, gravação, edição e design no mesmo lugar. Você só aparece.',
  },
  primaryAction: { href: bookVisitAnchor, label: 'Agendar uma visita' },
  secondaryAction: { href: anchorTo(sectionIds.takes), label: 'Ver os takes' },
  titleLines: ['Do “não sei', 'o que falar”', 'ao post no ar.'],
  meta: { year: '© 2026', location: 'Maringá, PR', venue: 'Atrium · Sala 31' },
  orbImage: lightOrb,
};

export const problemContent = {
  id: sectionIds.problem,
  eyebrow: 'O problema',
  titleLines: ['Seu concorrente', 'aparece todo dia.', 'E você?'],
  statementLines: ['Você é melhor.', 'Só que ninguém', 'está vendo.'],
};

export const manifestoContent = {
  id: sectionIds.manifesto,
  segments: [
    { text: 'Nenhuma câmera liga sem saber para quem você fala e o que quer vender.' },
    { text: 'Criatividade com critério.', emphasis: true },
    { text: 'Cada peça sai com um porquê: abrir conversa de negócio, não juntar visualização.' },
    { text: 'Ideias com propósito.', emphasis: true },
  ],
};

export const servicesContent = {
  id: sectionIds.services,
  intro: {
    eyebrow: 'Serviços',
    titleLines: ['Do roteiro à', 'marca, um só', 'time.'],
    description: 'Estratégia, gravação, edição e design no mesmo lugar.',
    action: { href: bookVisitAnchor, label: 'Agendar uma visita' },
  },
  items: [
    {
      index: 'A',
      title: 'Planejamento',
      text: 'Tudo definido com o estrategista antes da câmera.',
      tags: ['Linha editorial', 'Pautas', 'Roteiros'],
    },
    {
      index: 'B',
      title: 'Captação',
      text: 'O operador da casa está em toda sessão.',
      tags: ['4 ambientes', '3 câmeras Sony', '4 microfones'],
    },
    {
      index: 'C',
      title: 'Podcast',
      text: 'Também fazemos o podcast da sua empresa.',
      tags: ['Videocast multicâmera', 'Do formato ao episódio no ar'],
    },
    {
      index: 'D',
      title: 'Edição',
      text: 'Nada de arquivo bruto.',
      tags: ['Episódios', 'Cortes verticais', 'Vídeos curtos prontos para postar'],
    },
    {
      index: 'E',
      title: 'Design',
      text: 'A marca já sai aplicada no conteúdo. Projetos de marca sob proposta.',
      tags: ['Capas', 'Artes', 'Carrosséis', 'Identidade de marca'],
    },
  ],
};

export const howItWorksContent = {
  id: sectionIds.howItWorks,
  eyebrow: 'Como funciona',
  titleLines: ['Chegue sem pauta.', 'Saia com conteúdo pronto.'],
  steps: [
    {
      index: '01',
      title: 'Você chega sem pauta.',
      text: 'A pauta nasce na conversa com o estrategista: para quem você fala e o que quer vender.',
      tags: ['Para quem', 'Tema', 'Pauta', 'Roteiro'],
    },
    {
      index: '02',
      title: 'A gente define o tema, grava e edita.',
      text: 'Com o roteiro pronto, você grava no estúdio com o operador da casa. A edição fica com a gente.',
      tags: ['4 ambientes', '3 câmeras Sony', '4 microfones'],
    },
    {
      index: '03',
      title: 'Você sai com conteúdo pronto.',
      text: 'Episódio, cortes e artes prontos para postar. Nada de arquivo bruto.',
      tags: ['Episódio', 'Cortes verticais', 'Capas'],
    },
  ],
};

export const takesContent = {
  id: sectionIds.takes,
  intro: {
    eyebrow: 'Takes',
    titleLines: ['Três takes', 'para começar.'],
    description: 'Preço fechado, sem hora extra.',
    action: { href: bookVisitAnchor, label: 'Agendar uma visita' },
  },
  takeAction: { href: bookVisitAnchor, label: 'Agendar visita' },
  takes: [
    {
      index: '01',
      title: 'Episódio Piloto',
      lead: 'Grave um episódio e sinta o processo.',
      price: 'R$ 590',
      note: 'Valor abatido no 1º mês do plano',
      tags: ['45 a 60 min de gravação', 'Briefing com o estrategista', '2 cortes editados'],
    },
    {
      index: '02',
      title: 'Dia Korum',
      lead: 'Um dia de estúdio. O mês resolvido.',
      price: 'R$ 3.900',
      note: 'À vista ou em 2x',
      tags: [
        '6 h de estúdio com roteiro',
        '1 episódio editado',
        '10 cortes do episódio',
        '6 vídeos roteirizados',
        'Capa',
      ],
    },
    {
      index: '03',
      title: 'Plano Autoridade',
      lead: '1 episódio por semana, em horário fixo.',
      price: 'R$ 4.900',
      priceSuffix: '/mês',
      note: 'Contrato de 6 meses',
      tags: [
        '4 episódios, 16 cortes e 4 capas no mês',
        'Pautas e roteiros',
        'Relatório mensal',
        '[Em breve] Círculo Korum',
      ],
    },
  ],
  extras: {
    titleLines: ['Adicionais', 'e avulsos'],
    conditions: 'Dia Korum reservado com 50% de sinal, remarcação até 24 h antes e 1 rodada de ajuste por entrega.',
    items: [
      { name: 'Episódio avulso', detail: '1 h editada + 3 cortes', price: 'R$ 1.290' },
      { name: '5 cortes extras', price: 'R$ 395' },
      { name: '4 capas', price: 'R$ 280' },
      { name: 'Pack de artes', price: 'R$ 350' },
      { name: 'Entrevistador na sessão', price: 'R$ 300' },
      { name: 'Edição premium', detail: 'Cor, motion, imagens de apoio', price: 'R$ 520/ep.' },
      { name: 'Onboarding estratégico', detail: '12 pautas', price: 'R$ 1.900' },
      { name: '4 carrosséis', detail: 'Por mês', price: 'R$ 600/mês' },
    ],
  },
};

export const studioContent = {
  id: sectionIds.studio,
  eyebrow: 'O estúdio',
  titleLines: ['Feito para', 'gravar em lote.'],
  description: 'Estrutura pronta para gravar em lote: um dia de estúdio vira conteúdo para o mês.',
  action: { href: bookVisitAnchor, label: 'Agendar visita' },
  features: [
    {
      title: '4 ambientes de gravação',
      text: 'Sala de reunião, sala de entrevista, cantinho do café e o mezanino do escritório. Todos se adaptam ao formato do seu conteúdo.',
    },
    { title: '3 câmeras Sony', text: 'O operador da casa está em toda sessão.' },
    { title: '4 microfones de mesa', text: 'Videocast multicâmera, do formato ao episódio no ar.' },
    { title: 'Estratégia, captação e design', text: 'Do roteiro à marca, um só time.' },
  ],
};

export const circleContent = {
  id: sectionIds.circle,
  eyebrow: 'Em breve · Círculo Korum',
  titleLines: ['Quem grava aqui', 'se conhece.'],
  lead: {
    emphasis: 'A gravação acaba, a conversa continua.',
    text: 'Uma vez por mês, quem grava na Korum senta à mesma mesa para trocar contatos, indicações e negócios.',
  },
  action: { href: anchorTo(sectionIds.takes), label: 'Ver o Plano Autoridade' },
  pillars: [
    { title: 'Uma vez por mês', text: 'Um encontro mensal, só para empresários que gravam na Korum.' },
    { title: 'Com curadoria', text: 'Quem entra na mesa passa por curadoria da Korum.' },
    {
      title: 'Vaga no Plano Autoridade',
      text: 'A vaga já vem incluída no plano. As primeiras mesas abrem em breve.',
    },
  ],
  orbImage: lightOrb,
};

export const comparisonContent = {
  id: sectionIds.comparison,
  eyebrow: 'Comparativo',
  baselineTitleLines: ['Estúdio por hora', 'entrega arquivo.'],
  ourTitleLines: ['A Korum entrega', 'posicionamento.'],
  tableLabel: 'Estúdio por hora comparado à Korum',
  columns: { baseline: 'Estúdio por hora', ours: 'Korum' },
  rows: [
    { baseline: 'Você chega com a pauta pronta', ours: 'A pauta nasce na conversa com o estrategista' },
    { baseline: 'Sai com arquivo bruto', ours: 'Sai com episódio, cortes e artes para postar' },
    { baseline: 'Um operador de câmera', ours: 'Estrategista, videomaker e designer' },
    { baseline: 'Hora extra cobrada à parte', ours: 'Preço fechado por take' },
    { baseline: 'Você grava e vai embora', ours: 'Você entra num ambiente de empresários' },
  ],
};

export const faqContent = {
  id: sectionIds.faq,
  intro: {
    eyebrow: 'Dúvidas',
    titleLines: ['Dúvidas antes', 'de gravar.'],
    description: 'Prefere WhatsApp?',
    action: { href: contact.whatsappUrl, label: contact.whatsappDisplay },
  },
  items: [
    {
      question: 'Não sei o que gravar. Dá para começar assim?',
      answer:
        'Dá, e é o caso da maioria. Antes de ligar a câmera, o estrategista conversa com você e sai com tema, pauta e roteiro. Você só precisa falar do seu negócio.',
    },
    {
      question: 'Preciso levar equipamento ou equipe?',
      answer:
        'Não. Estúdio, câmeras, áudio, luz e o time da casa (estrategista, videomaker e designer) já estão no preço.',
    },
    {
      question: 'O Plano Autoridade tem fidelidade?',
      answer:
        'Sim, 6 meses. Posicionamento se constrói com constância, e em menos tempo que isso não dá para medir resultado. Todo mês você recebe um relatório do que foi publicado e do que voltou.',
    },
    {
      question: 'Vocês criam a identidade da minha marca?',
      answer:
        'Criamos. O projeto de marca é feito pelo mesmo time que produz o seu conteúdo, então a marca já sai aplicada em episódios, cortes e redes. O orçamento é sob proposta.',
    },
    {
      question: 'Posso só alugar o estúdio?',
      answer:
        'Pode, sob consulta, com operador e mínimo de 2 horas. Mas o foco da casa é entregar conteúdo pronto, não arquivo bruto.',
    },
    {
      question: 'Onde fica a Korum?',
      answer: 'No Atrium, térreo, sala 31, em Maringá (PR). Agende uma visita e venha conhecer o estúdio.',
    },
  ],
};

const visitInterestLabels: Record<VisitInterest, string> = {
  undecided: 'Ainda não sei',
  'pilot-episode': 'Episódio Piloto',
  'studio-day': 'Dia Korum',
  'authority-plan': 'Plano Autoridade',
  'brand-design': 'Design de marca',
};

const visitPeriodLabels: Record<VisitPeriod, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
};

const formMessages = {
  invalid: 'Confira os campos destacados.',
  rateLimited: `Muitas tentativas seguidas. Espere alguns minutos ou chame no WhatsApp ${contact.whatsappDisplay}.`,
  error: `Não foi possível enviar agora. Tente de novo ou chame no WhatsApp ${contact.whatsappDisplay}.`,
};

export const visitBookingContent = {
  id: sectionIds.bookVisit,
  eyebrow: 'Agende uma visita',
  titleLines: ['Venha', 'conhecer', 'o estúdio.'],
  lead: 'Uma visita de 20 minutos no Atrium. Você conhece o set, conversa com o estrategista e sai sabendo por onde começar.',
  address: contact.address,
  action: { href: contact.whatsappUrl, label: `Prefere WhatsApp? ${contact.whatsappDisplay}` },
  background: { landscape: flutedPanelLandscape, portrait: flutedPanelPortrait },
  form: {
    action: '/api/visit-requests/',
    fields: {
      name: { label: 'Nome*', placeholder: 'Seu nome', error: 'Informe seu nome.' },
      company: { label: 'Empresa*', placeholder: 'Nome da empresa', error: 'Informe o nome da empresa.' },
      whatsapp: { label: 'WhatsApp*', placeholder: '(44) 90000-0000', error: 'Informe um WhatsApp com DDD.' },
      email: { label: 'E-mail', placeholder: 'voce@empresa.com.br', error: 'Confira o e-mail informado.' },
      interest: { label: 'O que você procura', error: 'Escolha uma opção.' },
      period: { label: 'Melhor período para a visita', error: 'Escolha um período.' },
      message: {
        label: 'Mensagem',
        placeholder: 'Conte em uma linha o que você quer gravar (opcional)',
        error: 'Use no máximo 1.000 caracteres.',
      },
    },
    interestOptions: VISIT_INTERESTS.map((value) => ({ value, label: visitInterestLabels[value] })),
    periodOptions: VISIT_PERIODS.map((value) => ({ value, label: visitPeriodLabels[value] })),
    submitLabel: 'Agendar minha visita',
    note: 'A gente responde pelo WhatsApp para fechar o horário.',
    messages: { ...formMessages, success: 'Pedido recebido. A gente chama no seu WhatsApp para marcar o horário.' },
  },
};

export const newsletterContent = {
  id: sectionIds.newsletter,
  eyebrow: 'A Pauta · newsletter semanal',
  description: 'Toda segunda, uma ideia de vídeo pronta para gravar, pensada para empresário.',
  titleLines: ['Uma pauta', 'por semana.'],
  form: {
    action: '/api/newsletter-subscriptions/',
    emailLabel: 'E-mail',
    emailPlaceholder: 'seu@email.com.br',
    submitLabel: 'Quero a pauta',
    note: 'Sai quando quiser, com um clique.',
    messages: { ...formMessages, success: 'Inscrição feita. A primeira pauta chega na segunda.' },
  },
};

export interface MessagePageContent {
  title: string;
  eyebrow: string;
  headingLines: readonly string[];
  lead: string;
  actions: readonly LinkItem[];
}

const backToSite: LinkItem = { href: '/', label: 'Voltar ao site' };

export const thankYouContent: Record<LeadType, MessagePageContent> = {
  'visit-request': {
    title: 'Pedido recebido · Korum',
    eyebrow: 'Agende uma visita',
    headingLines: ['Pedido', 'recebido.'],
    lead: `A gente chama no seu WhatsApp para marcar o horário da visita. Se quiser adiantar, fale com a gente: ${contact.whatsappDisplay}.`,
    actions: [backToSite, { href: contact.whatsappGreetingUrl, label: 'Falar no WhatsApp' }],
  },
  'newsletter-subscription': {
    title: 'Inscrição feita · Korum',
    eyebrow: 'A Pauta · newsletter semanal',
    headingLines: ['Inscrição', 'feita.'],
    lead: 'A primeira pauta chega na segunda. Sai quando quiser, com um clique.',
    actions: [backToSite],
  },
};

export const notFoundContent: MessagePageContent = {
  title: 'Página não encontrada · Korum',
  eyebrow: 'Erro 404',
  headingLines: ['Página', 'não encontrada.'],
  lead: 'Este endereço não existe ou mudou de lugar. Volte ao início ou agende uma visita ao estúdio.',
  actions: [backToSite, { href: `/${bookVisitAnchor}`, label: 'Agendar visita' }],
};
