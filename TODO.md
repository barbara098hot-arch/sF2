# TODO - Correção “Salvar Produto não funciona no celular”

- [x] Checkout: em “Link de Pagamento”, remover URL/botão “Pagar Agora” da tela e exibir mensagem informando envio do link via WhatsApp após efetuar o pedido; confirmar somente após pagamento.
- [x] Checkout: ajustar mensagem do WhatsApp para incluir instruções do link de pagamento e confirmação após pagamento.
- [x] Checkout/Admin: iniciar pedidos em “linkPagamento” com status “Aguardando pagamento” e adicionar opção “Aguardando pagamento” no Admin > Pedidos.
- [ ] Confirmar bug/escopo: Admin > Produtos > Salvar Produto (upload de imagem base64 para Firestore)
- [ ] Implementar correção: migrar upload de imagens de Base64 no Firestore para Firebase Storage (armazenar arquivos e salvar apenas URLs no Firestore)
- [ ] Atualizar `src/pages/admin/AdminProducts.tsx` para:
  - [ ] substituir FileReader/base64 por upload no Storage
  - [ ] exibir loading durante upload
  - [ ] garantir que só salva no Firestore depois do upload concluir
- [ ] Atualizar `src/services/firebaseService.ts` e/ou criar `src/services/storageService.ts`:
  - [ ] funções de upload para Storage
  - [ ] obter download URL
- [ ] Atualizar consumo das imagens (se necessário) para usar URLs.
- [ ] Testar no celular e desktop:
  - [ ] salvar produto com imagem principal
  - [ ] salvar com imagens adicionais
  - [ ] editar produto existente
- [ ] Build final

