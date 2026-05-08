import { useEffect, useState } from 'react';
import { Client, ClientFilters, FilterOptions, GeneratedTextResult } from './types';
import { api } from './services/api';
import './App.css';

function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<ClientFilters>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ roles: [], company_types: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [instruction, setInstruction] = useState('');
  const [generating, setGenerating] = useState(false);
  const [modalResults, setModalResults] = useState<GeneratedTextResult[] | null>(null);

  const [sendStatus, setSendStatus] = useState<Record<number, { whatsapp?: boolean; email?: boolean; emailError?: boolean }>>({});
  const [sendingEmail, setSendingEmail] = useState<Set<number>>(new Set());

  const SENT_STORAGE_KEY = 'outreach_sent_status';

  const loadSentStatus = () => {
    try {
      const stored = localStorage.getItem(SENT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const saveToLocalStorage = (clientId: number, method: 'whatsapp' | 'email') => {
    const stored = loadSentStatus();
    if (!stored[clientId]) stored[clientId] = {};
    stored[clientId][method] = true;
    localStorage.setItem(SENT_STORAGE_KEY, JSON.stringify(stored));
  };

  useEffect(() => {
    const stored = loadSentStatus();
    const initialStatus: Record<number, { whatsapp?: boolean; email?: boolean }> = {};
    for (const [id, methods] of Object.entries(stored)) {
      const clientId = parseInt(id);
      initialStatus[clientId] = methods as { whatsapp?: boolean; email?: boolean };
    }
    setSendStatus(initialStatus);
  }, []);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await api.getFilterOptions();
        setFilterOptions(options);
      } catch {
        setError('Failed to load filter options');
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getClients(filters);
        setClients(data);
      } catch {
        setError('Failed to load clients');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [filters]);

  const handleClear = () => {
    setFilters({});
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === clients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clients.map(c => c.id)));
    }
  };

  const MOCK_TEMPLATES = [
    (c: Client) =>
      `Prezado(a) ${c.name.split(' ')[0]},\n\nComo ${c.role} da ${c.company_name}, sei que otimizar processos no setor de ${c.company_type} é uma prioridade constante. Nossa solução já ajudou empresas similares a reduzir custos operacionais em até 30%.\n\nTeria 15 minutos na próxima semana para uma conversa rápida?`,
    (c: Client) =>
      `Olá, ${c.name.split(' ')[0]}!\n\nA ${c.company_name} tem se destacado no mercado de ${c.company_type} e gostaríamos de explorar como podemos contribuir ainda mais para o seu crescimento. Nossa plataforma foi desenvolvida pensando em profissionais como você, ${c.role}.\n\nPosso enviar um case de sucesso do setor?`,
    (c: Client) =>
      `Caro(a) ${c.name.split(' ')[0]},\n\nEmpresaas de ${c.company_type} como a ${c.company_name} enfrentam desafios únicos que exigem soluções sob medida. Como ${c.role}, você certamente busca ferramentas que tragam resultado real, sem complexidade desnecessária.\n\nQue tal uma demonstração personalizada de 20 minutos?`,
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(res => setTimeout(res, 800));
    const selected = clients.filter(c => selectedIds.has(c.id));
    const results: GeneratedTextResult[] = selected.map((c, i) => ({
      client_id: c.id,
      name: c.name,
      generated_text: MOCK_TEMPLATES[i % MOCK_TEMPLATES.length](c),
    }));
    setModalResults(results);
    setGenerating(false);
  };

  const clientById = (id: number) => clients.find(c => c.id === id);

  const handleWhatsAppClick = (clientId: number, text: string, whatsapp: string) => {
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setSendStatus(prev => ({ ...prev, [clientId]: { ...prev[clientId], whatsapp: true, emailError: false } }));
    saveToLocalStorage(clientId, 'whatsapp');
  };

  const handleEmailClick = async (clientId: number, text: string, email: string) => {
    setSendingEmail(prev => new Set([...prev, clientId]));
    try {
      await api.sendEmail(clientId, text, email);
      setSendStatus(prev => ({ ...prev, [clientId]: { ...prev[clientId], email: true, emailError: false } }));
      saveToLocalStorage(clientId, 'email');
    } catch {
      setSendStatus(prev => ({ ...prev, [clientId]: { ...prev[clientId], emailError: true } }));
    } finally {
      setSendingEmail(prev => {
        const newSet = new Set(prev);
        newSet.delete(clientId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Outreach MVP</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-[260px] bg-white border-r border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Cargo</label>
            <select
              value={filters.role || ''}
              onChange={(e) => setFilters({ ...filters, role: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Todos</option>
              {filterOptions.roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tipo de Empresa</label>
            <select
              value={filters.company_type || ''}
              onChange={(e) => setFilters({ ...filters, company_type: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Todos</option>
              {filterOptions.company_types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters })}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              Filtrar
            </button>
            <button
              onClick={handleClear}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
              disabled={loading}
            >
              Limpar
            </button>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 p-6 pb-48">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && clients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum cliente encontrado
            </div>
          )}

          {!loading && clients.length > 0 && (
            <table className="w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === clients.length && clients.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">WhatsApp</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Cargo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Tipo de Empresa</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr
                    key={client.id}
                    className={`border-t ${selectedIds.has(client.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-3 relative">
                      {(sendStatus[client.id]?.whatsapp || sendStatus[client.id]?.email) && (
                        <span className="absolute top-2 left-1 w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                      <input
                        type="checkbox"
                        checked={selectedIds.has(client.id)}
                        onChange={() => toggleSelection(client.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-3">{client.name}</td>
                    <td className="px-4 py-3">{client.email}</td>
                    <td className="px-4 py-3">{client.whatsapp}</td>
                    <td className="px-4 py-3">{client.role}</td>
                    <td className="px-4 py-3">{client.company_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>

      {/* Selection Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white px-6 py-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {selectedIds.size} cliente{selectedIds.size > 1 ? 's' : ''} selecionado{selectedIds.size > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 bg-white text-blue-700 font-semibold px-4 py-1.5 rounded hover:bg-blue-50 disabled:opacity-60 transition-colors text-sm"
            >
              {generating && (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 inline-block"></span>
              )}
              Gerar textos com IA
            </button>
          </div>
          <div>
            <label className="block text-xs text-blue-100 mb-1">Instrução para a IA</label>
            <textarea
              rows={2}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Ex: foque em redução de custo operacional"
              className="w-full rounded px-3 py-2 text-sm text-gray-900 bg-white border border-blue-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      )}

      {/* Modal */}
      {modalResults !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen flex flex-col mx-4">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Textos gerados ({modalResults.length} cliente{modalResults.length !== 1 ? 's' : ''})
              </h2>
              <button
                onClick={() => setModalResults(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {modalResults.map((result) => {
                const client = clientById(result.client_id);
                const status = sendStatus[result.client_id] || {};
                const isSending = sendingEmail.has(result.client_id);
                return (
                  <div key={result.client_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-1">
                      <span className="font-semibold text-gray-900">{result.name}</span>
                      {client?.company_name && (
                        <span className="text-sm text-gray-500 ml-2">— {client.company_name}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line mb-3">
                      {result.generated_text}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => client && handleWhatsAppClick(result.client_id, result.generated_text, client.whatsapp)}
                        className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                        disabled={status.whatsapp}
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => client && handleEmailClick(result.client_id, result.generated_text, client.email)}
                        className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        disabled={status.email || isSending}
                      >
                        {isSending && (
                          <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white inline-block"></span>
                        )}
                        Email
                      </button>
                      {status.whatsapp && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Enviado via WhatsApp
                        </span>
                      )}
                      {status.email && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Email enviado
                        </span>
                      )}
                      {status.emailError && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Erro no envio
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setModalResults(null)}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
