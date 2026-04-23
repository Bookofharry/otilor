import { useState, useMemo } from 'react'
import type { ApiClientSummary } from '../api'
import { useClientAnalytics } from '../context/useAnalytics'

interface ClientsPageProps {
  clients: ApiClientSummary[]
  onSelectClient: (clientId: string) => void
  onCreateClient: (name: string, email: string) => Promise<void>
}

function ClientsPage({ clients, onSelectClient, onCreateClient }: ClientsPageProps) {
  const clientAnalytics = useClientAnalytics()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients
    const query = searchQuery.toLowerCase()
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query)
    )
  }, [clients, searchQuery])

  const handleSelectClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    if (client) {
      clientAnalytics.trackClientSelected(clientId, client.name, 'clients_page')
    }
    onSelectClient(clientId)
  }

  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      setFormError('Client name is required')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      await onCreateClient(newClientName.trim(), newClientEmail.trim())
      // Track client creation
      clientAnalytics.trackClientCreated('new', newClientName.trim())
      // Reset form
      setNewClientName('')
      setNewClientEmail('')
      setShowAddForm(false)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create client')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setNewClientName('')
    setNewClientEmail('')
    setFormError(null)
  }

  return (
    <section className="screen">
      <div className="section-heading">
        <h2>Clients</h2>
        <p>Manage your client list for faster invoicing.</p>
      </div>

      <div className="clients-layout">
        <article className="panel">
          <div className="panel-header">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="primary-button" type="button" onClick={() => setShowAddForm(true)}>
              Add Client
            </button>
          </div>

          <div className="clients-list">
            {filteredClients.length === 0 ? (
              <div className="empty-state">
                {searchQuery ? (
                  <>
                    <p>No clients match your search.</p>
                    <button className="ghost-button" type="button" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </button>
                  </>
                ) : (
                  <>
                    <p>No clients yet. Add your first client to get started.</p>
                    <button className="primary-button" type="button" onClick={() => setShowAddForm(true)}>
                      Add First Client
                    </button>
                  </>
                )}
              </div>
            ) : (
              <table className="clients-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="client-row">
                      <td className="client-name">{client.name}</td>
                      <td className="client-email">{client.email || '-'}</td>
                      <td className="client-actions">
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() => handleSelectClient(client.id)}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </article>

        {/* Add Client Form Modal */}
        {showAddForm && (
          <div className="overlay-wrap" role="dialog" aria-modal="true" aria-label="Add client">
            <button
              aria-label="Close add client form"
              className="overlay-backdrop"
              type="button"
              onClick={handleCancel}
            />
            <article className="modal-panel">
              <h3>Add New Client</h3>

              <div className="form-grid">
                <label>
                  Client Name *
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    autoFocus
                  />
                </label>

                <label>
                  Email (optional)
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="client@example.com"
                  />
                </label>
              </div>

              {formError && <p className="inline-error">{formError}</p>}

              <div className="action-row">
                <button className="secondary-button" type="button" onClick={handleCancel} disabled={isSubmitting}>
                  Cancel
                </button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={handleCreateClient}
                  disabled={isSubmitting || !newClientName.trim()}
                >
                  {isSubmitting ? 'Creating...' : 'Create Client'}
                </button>
              </div>
            </article>
          </div>
        )}
      </div>
    </section>
  )
}

export default ClientsPage
