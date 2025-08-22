# Funcionalidades Desabilitadas

Esta pasta contém funcionalidades que foram temporariamente desabilitadas para evitar erros no desenvolvimento.

## Conteúdo

- `api-tendencias/` - API original com integração Gemini e Firebase
- `api-tendencias-simple/` - API simplificada de fallback
- `api-cron/` - Endpoints para automação diária
- `api-debug/` - Ferramentas de diagnóstico

## Motivo da Desabilitação

As funcionalidades de IA foram desabilitadas devido a:
- Erros de parsing JSON na resposta do Gemini
- Problemas de permissão no Firebase
- Instabilidade durante desenvolvimento

## Como Reativar

1. Mova os arquivos de volta para `app/api/`
2. Configure as variáveis de ambiente necessárias
3. Atualize as regras do Firestore
4. Teste as APIs individualmente

## Estado Atual

A aba de Tendências agora funciona com:
- ✅ Dados estáticos locais
- ✅ Interface funcional
- ✅ Botão de "embaralhar" conteúdo
- ✅ Sem dependências externas
- ✅ Totalmente offline

## Para Desenvolvedores

O hook `useTendencias()` foi simplificado para usar apenas dados locais.
O componente `Tendencias` foi atualizado para remover referências à IA.

Esta é uma solução temporária até que os problemas com as APIs sejam resolvidos.
