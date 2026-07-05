## Layout

O layout raiz, `app/layout.tsx`, é o único local para provedores de toda a aplicação e infraestrutura global.

**Não remova nenhuma entrada existente sem motivo.** Infraestrutura atual no layout:

| Entrada | Finalidade |
|-------|---------|
| `ThemeProvider` | Modo claro/escuro via `next-themes` |
| `Toaster` | Notificações toast globais via Sonner |
| `ChunkLoadErrorHandler` | Obrigatório — previne bug conhecido de condição de corrida ChunkLoadError |

---

## Tipografia

| Função | Fonte | Classe Tailwind | Uso Padrão |
|------|------|---------------|-------|
| Corpo | DM Sans | `font-sans` | Texto geral, rótulos, descrições |
| Título | Plus Jakarta Sans | `font-display` | Títulos de página, cabeçalhos hero, seções |
| Mono | JetBrains Mono | `font-mono` | Trechos de código, dados numéricos, IDs, timestamps |

**Hierarquia de tamanhos:** Use a escala do Tailwind. Títulos: `text-4xl`→`text-3xl`→`text-2xl`→`text-xl`. Corpo: `text-base`→`text-sm`. Legendas: `text-xs`.

Sempre use `tracking-tight` em títulos grandes (`text-2xl` ou superior).

---

## Sistema de Cores (Tokens de Design)

Todas as cores usam variáveis CSS — **nunca codifique valores de cor diretamente**.

| Token | Finalidade |
|-------|---------|
| `background` / `foreground` | Fundo e texto da página |
| `card` / `card-foreground` | Superfícies de cards |
| `primary` / `primary-foreground` | Botões, links, destaques da marca |
| `secondary` / `secondary-foreground` | Botões secundários, destaques sutis |
| `muted` / `muted-foreground` | Estados desabilitados, texto auxiliar, fundos sutis |
| `accent` / `accent-foreground` | Estados de hover, itens de navegação ativos |
| `destructive` / `destructive-foreground` | Erros, ações de exclusão |
| `border` | Bordas e divisores |
| `input` | Bordas de campos de formulário |
| `ring` | Anéis de foco |

Uso: `bg-primary`, `text-muted-foreground`, `border-border`, etc.

---

## Escala de Espaçamento

Baseada em grade de 8px. Use estas variáveis CSS ou equivalentes do Tailwind:

| Token | Valor | Tailwind |
|-------|-------|----------|
| `--spacing-xs` | 4px | `p-1`, `gap-1` |
| `--spacing-sm` | 8px | `p-2`, `gap-2` |
| `--spacing-md` | 16px | `p-4`, `gap-4` |
| `--spacing-lg` | 24px | `p-6`, `gap-6` |
| `--spacing-xl` | 32px | `p-8`, `gap-8` |
| `--spacing-2xl` | 48px | `p-12`, `gap-12` |
| `--spacing-3xl` | 64px | `p-16`, `gap-16` |

**Varie o ritmo de espaçamento** — não use o mesmo gap em todos os lugares. Hero → gap grande → conteúdo → gap médio → rodapé.

---

## Escala de Sombras

| Token | Uso Padrão |
|-------|-------|
| `--shadow-sm` | Elevação sutil de card, foco de input |
| `--shadow-md` | Cards, dropdowns, popovers |
| `--shadow-lg` | Modais, painéis elevados |

Estas são apenas variáveis CSS — use-as diretamente em estilos inline ou CSS customizado como `var(--shadow-sm)` etc. Elas não estão mapeadas para as utilidades `shadow-*` do Tailwind.

---

## Raio de Borda

| Token | Valor | Uso Padrão |
|-------|-------|-------|
| `--radius` | 0.625rem | Padrão (botões, inputs, cards) |
| `--radius-sm` | calc(var(--radius) - 4px) | Elementos pequenos (emblemas, chips) |
| `--radius-lg` | calc(var(--radius) + 4px) | Contêineres grandes, cards hero |
| `--radius-full` | 9999px | Avatares, pílulas, botões circulares |

---

## Temporização de Animação

| Token | Valor | Classe Tailwind | Uso Padrão |
|-------|-------|---------------|-------|
| `--duration-fast` | 150ms | `duration-fast` | Estados de hover, toggles |
| `--duration-normal` | 250ms | `duration-normal` | Transições de página, revelações |
| `--duration-slow` | 350ms | `duration-slow` | Animações complexas, modais |

---

## Componentes de Layout

### `Container` — `@/components/layouts/container`
Centraliza conteúdo com padding responsivo. Props: `size` (`sm`|`md`|`lg`|`xl`|`full`).
```tsx
<Container size="lg">{children}</Container>
```

### `Section` — `@/components/layouts/section`
Wrapper de espaçamento vertical para seções de página. Props: `id`, `className`.
```tsx
<Section id="features">{children}</Section>
```

### `PageHeader` — `@/components/layouts/page-header`
Título + descrição + botões de ação. Use no topo de cada página da aplicação.
```tsx
<PageHeader title="Painel" description="Visão geral da sua conta" actions={<Button>Exportar</Button>} />
```

### `AppShell` — `@/components/layouts/app-shell`
Sidebar + cabeçalho + conteúdo principal. O layout padrão para painéis e áreas administrativas.
```tsx
<AppShell sidebar={<nav>...</nav>} header={<div>...</div>}>{children}</AppShell>
```

### `AuthLayout` — `@/components/layouts/auth-layout`
Card centralizado em fundo gradiente. Use para login, cadastro, fluxos de integração.
```tsx
<AuthLayout title="Bem-vindo de volta" description="Faça login para continuar">{form}</AuthLayout>
```

---

## Componentes de Animação — `@/components/ui/animate`

| Componente | Uso Padrão | Principais Props |
|-----------|-------|-----------|
| `FadeIn` | Revelar conteúdo ao rolar | `delay`, `duration` |
| `ScaleIn` | Efeito pop-in | `delay` |
| `SlideIn` | Entrada direcional | `from` (`top`\|`bottom`\|`left`\|`right`), `delay` |
| `Stagger` + `StaggerItem` | Revelação sequencial para listas/grades | `staggerDelay` |
| `HoverLift` | Efeito de elevação no hover (cards, links) | — |
| `PressScale` | Feedback de pressionamento para botões | — |
| `SkeletonPulse` | Placeholder de carregamento | `className` (definir largura/altura) |

**Padrão:** Envolva seções de página em `FadeIn`, itens de lista em `Stagger`/`StaggerItem`, cards interativos em `HoverLift`.

---

## Componentes UI — `@/components/ui/`

### Essenciais
| Componente | Import | Principais Props |
|-----------|--------|-----------|
| `Button` | `@/components/ui/button` | `variant` (`default`\|`secondary`\|`outline`\|`ghost`\|`destructive`\|`link`\|`glass-dark`\|`glass-light`), `size` (`default`\|`xs`\|`sm`\|`lg`\|`icon`\|`icon-sm`), `loading` (boolean). **`glass-dark`**: para fundos escuros/vívidos. **`glass-light`**: para fundos claros/pálidos. **Link**: foco usa sublinhado, não anel. |
| `Badge` | `@/components/ui/badge` | `variant` (`default`\|`secondary`\|`outline`\|`destructive`) |
| `Card` | `@/components/ui/card` | `variant` (`default`\|`interactive`\|`glass-dark`\|`glass-dark-interactive`\|`glass-light`\|`glass-light-interactive`\|`ghost`). Composto: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. **Interactive**: sempre envolva em `<a>` ou `<button>` para acesso por teclado. |
| `Separator` | `@/components/ui/separator` | `orientation` (`horizontal`\|`vertical`) |

### Formulários
| Componente | Import |
|-----------|--------|
| `Input` | `@/components/ui/input` | `variant` (`default`\|`error`\|`success`\|`ghost`), `size` (`default`\|`sm`\|`lg`) |
| `Textarea` | `@/components/ui/textarea` | `variant` (`default`\|`error`\|`success`\|`ghost`) |
| `Label` | `@/components/ui/label` |
| `Select` | `@/components/ui/select` |
| `Checkbox` | `@/components/ui/checkbox` |
| `RadioGroup` | `@/components/ui/radio-group` |
| `Switch` | `@/components/ui/switch` |
| `Slider` | `@/components/ui/slider` |
| `Calendar` | `@/components/ui/calendar` |
| `DateRangePicker` | `@/components/ui/date-range-picker` |
| `InputOTP` | `@/components/ui/input-otp` |
| `Form` | `@/components/ui/form` (integração com react-hook-form) |

### Navegação e Layout
| Componente | Import |
|-----------|--------|
| `Tabs` | `@/components/ui/tabs` — `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| `Accordion` | `@/components/ui/accordion` — `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` |
| `NavigationMenu` | `@/components/ui/navigation-menu` |
| `Breadcrumb` | `@/components/ui/breadcrumb` |
| `Pagination` | `@/components/ui/pagination` |
| `Menubar` | `@/components/ui/menubar` |
| `ScrollArea` | `@/components/ui/scroll-area` |
| `Resizable` | `@/components/ui/resizable` |

### Sobreposições e Feedback
| Componente | Import |
|-----------|--------|
| `Dialog` | `@/components/ui/dialog` |
| `AlertDialog` | `@/components/ui/alert-dialog` |
| `Sheet` | `@/components/ui/sheet` — painel lateral |
| `Drawer` | `@/components/ui/drawer` — painel inferior (ótimo para mobile) |
| `Popover` | `@/components/ui/popover` |
| `Tooltip` | `@/components/ui/tooltip` |
| `HoverCard` | `@/components/ui/hover-card` |
| `ContextMenu` | `@/components/ui/context-menu` |
| `DropdownMenu` | `@/components/ui/dropdown-menu` |
| `Command` | `@/components/ui/command` — paleta de comandos / lista pesquisável |
| `Alert` | `@/components/ui/alert` |
| `toast` | `import { toast } from 'sonner'` — `toast.success()`, `toast.error()` |

### Exibição de Dados
| Componente | Import |
|-----------|--------|
| `Table` | `@/components/ui/table` — `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` |
| `Avatar` | `@/components/ui/avatar` |
| `Progress` | `@/components/ui/progress` |
| `Skeleton` | `@/components/ui/skeleton` |
| `AspectRatio` | `@/components/ui/aspect-ratio` |
| `Carousel` | `@/components/ui/carousel` |

### Outros
| Componente | Import |
|-----------|--------|
| `Toggle` | `@/components/ui/toggle` |
| `ToggleGroup` | `@/components/ui/toggle-group` |
| `Collapsible` | `@/components/ui/collapsible` |
| `ThemeToggle` | `@/components/theme-toggle` — alternador de modo claro/escuro |