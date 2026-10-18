# Auditoria Lighthouse

O build de demonstração foi auditado em Chrome 155 no Windows, com MSW ativo, armazenamento novo a cada execução e as configurações padrão de rede e CPU do Lighthouse 12.8.2. Cada linha abaixo é a **mediana de três medições** da mesma versão do código. A meta de Performance 95 ainda não foi atingida no mobile.

| Página | Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | TBT | CLS |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | Mobile | 77 | 98 | 100 | 100 | 3.989 ms | 303 ms | 0 |
| Detalhe | Mobile | 78 | 100 | 100 | 100 | 4.129 ms | 251 ms | 0,003 |
| Home | Desktop | 98 | 98 | 100 | 100 | 1.022 ms | 2 ms | 0,0002 |
| Detalhe | Desktop | 99 | 100 | 100 | 100 | 968 ms | 0 ms | 0,037 |

A série completa está em [`artifacts/lighthouse/validated/2026-10-18T04-04-27.145Z/`](../artifacts/lighthouse/validated/2026-10-18T04-04-27.145Z/summary.json). O diretório contém `summary.json` e os relatórios HTML/JSON individuais. Os nomes dos diretórios usam UTC; as medições ocorreram em 18/10/2026 no horário de São Paulo.

Após isolar o estado do carrossel, a navegação móvel e as assinaturas dos cards, foi executada uma nova série **somente mobile** de três medições por página. A Home obteve Performance 67, LCP 3.988 ms e TBT 692 ms; detalhe obteve Performance 79, LCP 3.996 ms e TBT 262 ms. Os relatórios estão em [`artifacts/lighthouse/validated/2026-10-18T05-03-29.093Z/`](../artifacts/lighthouse/validated/2026-10-18T05-03-29.093Z/summary.json). O índice de desempenho do host variou de 1.165 a 1.938 entre essas execuções, então a queda da Home não prova uma regressão causada pela refatoração; também não há evidência de ganho no Lighthouse. O desktop não foi medido novamente nessa série.

## Diagnóstico

No mobile, o LCP é uma imagem do catálogo na Home e a imagem principal no detalhe. A requisição da imagem do catálogo começa cedo, mas o maior atraso é de renderização: em uma medição anterior da Home, aproximadamente 87% do tempo do LCP ocorreu depois da chegada do recurso. O pacote de inicialização do MSW e o bundle da aplicação são os principais contribuintes de trabalho na thread principal. O `Select` Radix, a área editorial e os filtros exclusivos do desktop foram separados em chunks. No mobile, editorial e filtros não são importados; o bundle inicial da aplicação caiu de aproximadamente 276 para 270 KB brutos. Ainda assim, as medianas mobile ficam abaixo de 95.

No detalhe desktop, o fallback curto da rota deixava o rodapé aparecer antes do conteúdo e depois deslocar-se. A reserva de altura durante a importação do módulo reduziu a mediana de CLS de 0,281 para 0,037 e elevou Performance de 84 para 99 em medições separadas. A série completa atual confirmou CLS 0,037 e Performance 99.

Experimentos descartados: adiar a conexão Socket.IO, deixar de montar componentes ocultos sem dividir seus módulos e registrar o Service Worker antes do runtime MSW. As medianas da Home mobile nesses ensaios foram 74, 73 e 71, respectivamente, contra 75 no ensaio de controle próximo. Foram revertidos; a variação entre execuções impede atribuir pequenos ganhos sem comparação A/B.

## Reproduzir

```bash
npm run build
npm run audit:lighthouse
```

O comando inicia um preview próprio, abre Chrome sem extensões e mede Home e detalhe em mobile e desktop três vezes cada. Os relatórios são salvos em `artifacts/lighthouse/validated/<data-UTC>/`. Ele retorna erro enquanto alguma mediana ficar abaixo de Performance 95, Acessibilidade 95, Boas práticas 95 ou SEO 90. Para uma amostra diagnóstica isolada, use `node scripts/audit-lighthouse.mjs --profile=mobile --page=home --runs=1`; ela não satisfaz o requisito de três execuções.
