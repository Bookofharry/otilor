import { useState, useMemo } from 'react'
import type { ApiClientSummary } from '../../../api'
import { useClientAnalytics } from '../../../context/useAnalytics'

interface ClientDrawerProps {
  isOpen: boolean
  clients: ApiClientSummary[]
  onClose: () => void
  onSelectClient: (clientId: string) => void
  onCreateClient: (name: string, email: string) => Promise<void>
}

function ClientDrawer({ isOpen, clients, onClose, onSelectClient, onCreateClient }: ClientDrawerProps) {
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
      clientAnalytics.trackClientSelected(clientId, client.name, 'client_drawer')
    }
    onSelectClient(clientId)
    onClose()
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

  if (!isOpen) return null

  return (
    <div className="overlay-wrap" role="dialog" aria-modal="true" aria-label="Select client">
      <button aria-label="Close client drawer" className="overlay-backdrop" type="button" onClick={onClose} />
      <article className="drawer-panel client-drawer">
        <div className="drawer-header">
          <h3>Select Client</h3>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {!showAddForm ? (
          <>
            <div className="drawer-search">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button
                className="primary-button"
                type="button"
                onClick={() => setShowAddForm(true)}
              >
                + New
              </button>
            </div>

            <div className="client-list">
              {filteredClients.length === 0 ? (
                <div className="empty-state-small">
                  {searchQuery ? (
                    <p>No clients match your search.</p>
                  ) : (
                    <>
                      <p>No clients yet.</p>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => setShowAddForm(true)}
                      >
                        Add your first client
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <ul className="client-items">
                  {filteredClients.map((client) => (
                    <li key={client.id} className="client-item">
                      <button
                        type="button"
                        className="client-button"
                        onClick={() => handleSelectClient(client.id)}
                      >
                        <span className="client-name">{client.name}</span>
                        {client.email && (
                          <span className="client-email">{client.email}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="add-client-form">
            <h4>Add New Client</h4>

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

            {formError && <p className="inline-error">{formError}</p>}

            <div className="action-row">
              <button
                className="secondary-button"
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={handleCreateClient}
                disabled={isSubmitting || !newClientName.trim()}
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )}
      </article>
    </div>
  )
}

export default ClientDrawer
