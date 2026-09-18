import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { SupportTicket } from '../../types';
import { HelpCircle, Plus, Send, MessageSquare, Clock, CheckCircle2, AlertCircle, Phone, Mail, ShieldAlert } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import confetti from 'canvas-confetti';

export const CustomerSupportCenter: React.FC = () => {
  const { currentUser, supportTickets, createSupportTicket, replySupportTicket, state } = useBank();

  const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    createSupportTicket({
      subject: `[${category}] ${subject}`,
      message,
      category,
    });

    setIsCreating(false);
    setSubject('');
    setMessage('');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    replySupportTicket(selectedTicket.id, replyText);
    setReplyText('');
    // Update local selected ticket reference
    const updated = supportTickets.find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  const activeTickets = supportTickets.filter((t) => currentUser?.role === 'admin' || t.userId === currentUser?.userId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="gradient-hero text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>24/7 Priority Concierge &amp; Support</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Help &amp; Support Center</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Get secure assistance from Greendot banking specialists, compliance officers, and treasury advisors.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-3 bg-white text-emerald-950 font-display font-bold text-xs rounded-2xl shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-700" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Main Grid: Tickets list + Support Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tickets List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-900">Your Support Tickets</h3>
            <span className="text-xs font-mono text-slate-500">{activeTickets.length} tickets</span>
          </div>

          {activeTickets.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
              <MessageSquare className="w-12 h-12 text-emerald-600 mx-auto opacity-40" />
              <h4 className="font-bold text-sm text-slate-800">No Support Tickets Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Have questions about your account status, wire transfers, or debit cards? Open a ticket above.
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 gradient-primary text-white font-bold text-xs rounded-xl shadow"
              >
                Create First Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        {t.id}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 truncate">{t.subject}</h4>
                    <p className="text-xs text-slate-500 truncate">{t.message}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-[11px] text-slate-400">{formatDate(t.createdAt)}</div>
                    <div className="text-xs font-bold text-emerald-700 mt-1">
                      {t.replies?.length || 0} replies &rarr;
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Direct Bank Contact Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-900">Direct Concierge Channels</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Support Email</div>
                  <div className="font-bold text-slate-800 font-mono">{state.appSettings.support_email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Toll-Free Hotline</div>
                  <div className="font-bold text-slate-800 font-mono">{state.appSettings.support_phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Encrypted Channels</div>
                  <div className="font-bold text-slate-800 text-[11px]">
                    Telegram: {state.appSettings.telegram_handle}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] text-emerald-900 space-y-1">
              <div className="font-bold">🔒 Bank-Grade Encryption</div>
              <div>All support conversations are securely logged and protected under federal banking privacy rules.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Ticket */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-display font-bold text-lg text-slate-900">Open Support Ticket</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700">Inquiry Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Account Security">Account Security &amp; Locking</option>
                  <option value="Wire Transfers">Wire Transfers &amp; Clearing</option>
                  <option value="Cards & ATM">Debit Cards &amp; PIN</option>
                  <option value="Loans & Credit">Loans &amp; Mortgage Underwriting</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Subject / Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Request to lift transfer limit for international wire"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Detailed Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your request or issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 gradient-primary text-white font-bold rounded-xl shadow"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Ticket Thread */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-emerald-700 font-bold">{selectedTicket.id}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 mt-1">{selectedTicket.subject}</h3>
                <div className="text-[11px] text-slate-400 mt-0.5">Opened {formatDate(selectedTicket.createdAt)}</div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            {/* Initial message */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
              <div className="font-bold text-slate-800">{selectedTicket.userName || 'Customer'} (You)</div>
              <p className="text-slate-700 whitespace-pre-wrap">{selectedTicket.message}</p>
              <div className="text-[10px] text-slate-400 pt-1">{formatDate(selectedTicket.createdAt)}</div>
            </div>

            {/* Replies thread */}
            <div className="space-y-3">
              {selectedTicket.replies?.map((rep, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-xs space-y-1 ${
                    rep.sender === 'support'
                      ? 'bg-emerald-50/70 border-emerald-200 ml-4'
                      : 'bg-slate-50 border-slate-200 mr-4'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{rep.senderName}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(rep.timestamp)}</span>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{rep.text}</p>
                </div>
              ))}
            </div>

            {/* Reply Input Form */}
            {selectedTicket.status !== 'resolved' ? (
              <form onSubmit={handleReply} className="space-y-2 pt-2 border-t border-slate-100">
                <textarea
                  required
                  rows={2}
                  placeholder="Type your reply to concierge support..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 gradient-primary text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-center text-xs font-bold">
                This ticket has been marked as resolved.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
