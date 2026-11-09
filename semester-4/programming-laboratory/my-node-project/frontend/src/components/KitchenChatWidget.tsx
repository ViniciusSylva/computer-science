import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import type { Order, OrderChatMessage } from '../types';

interface KitchenChatWidgetProps {
  order: Order;
  senderRole: OrderChatMessage['senderRole'];
  tableNumber?: number;
  onClose: () => void;
}

export const KitchenChatWidget: React.FC<KitchenChatWidgetProps> = ({
  order,
  senderRole,
  tableNumber,
  onClose,
}) => {
  const [messages, setMessages] = useState<OrderChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const eventSource = api.subscribeToOrderChat(order.id, (message) => {
      setMessages((current) => current.some((item) => item.id === message.id)
        ? current
        : [...current, message]);
    });

    api.getOrderChatMessages(order.id)
      .then((data) => {
        if (isMounted) setMessages(data);
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar as mensagens.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      eventSource.close();
    };
  }, [order.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    setError('');
    try {
      const created = await api.sendOrderChatMessage(order.id, {
        senderRole,
        senderName: senderRole === 'KITCHEN' ? 'Cozinha' : `Mesa ${tableNumber ?? order.table?.number ?? ''}`.trim(),
        message: input,
      });
      setMessages((current) => current.some((item) => item.id === created.id)
        ? current
        : [...current, created]);
      setInput('');
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Não foi possível enviar a mensagem.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-chat-title"
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 id="order-chat-title" className="font-bold text-slate-100">
              Conversa do pedido {order.code}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {order.table?.number ?? tableNumber
                ? `Mesa ${order.table?.number ?? tableNumber} · `
                : ''}Mensagens visíveis para este pedido
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar conversa"
            className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </header>

        <div className="flex min-h-56 flex-1 flex-col gap-3 overflow-y-auto bg-slate-950/60 p-4">
          {loading && <p className="m-auto text-sm text-slate-500">Carregando conversa...</p>}
          {!loading && messages.length === 0 && (
            <p className="m-auto max-w-xs text-center text-sm text-slate-500">
              Ainda não há mensagens. Envie uma mensagem para conversar sobre este pedido.
            </p>
          )}
          {messages.map((message) => {
            const isMine = message.senderRole === senderRole;
            return (
              <article
                key={message.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 ${
                  isMine
                    ? 'ml-auto rounded-br-sm bg-blue-700 text-white'
                    : 'mr-auto rounded-bl-sm bg-slate-800 text-slate-100'
                }`}
              >
                <p className="text-[11px] font-semibold opacity-75">{message.senderName}</p>
                <p className="whitespace-pre-wrap break-words text-sm">{message.message}</p>
                <time className="mt-1 block text-right text-[10px] opacity-60">
                  {new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </time>
              </article>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={(event) => void handleSend(event)} className="space-y-3 border-t border-slate-800 p-4">
          {error && (
            <p role="alert" className="rounded-lg border border-rose-800 bg-rose-950/50 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={1000}
              placeholder="Escreva uma mensagem sobre o pedido..."
              aria-label="Mensagem"
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
