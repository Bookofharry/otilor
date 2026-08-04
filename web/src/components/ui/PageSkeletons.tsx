import Skeleton from './Skeleton'

export function DashboardSkeleton() {
  return (
    <div className="screen dashboard-page" aria-busy="true" aria-label="Loading dashboard content">
      <div className="screen-header">
        <Skeleton variant="title" width="220px" />
        <Skeleton variant="text" width="340px" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Skeleton variant="card" height="120px" />
        <Skeleton variant="card" height="120px" />
        <Skeleton variant="card" height="120px" />
        <Skeleton variant="card" height="120px" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
          <Skeleton variant="title" width="180px" />
          <Skeleton variant="table-row" />
          <Skeleton variant="table-row" />
          <Skeleton variant="table-row" />
          <Skeleton variant="table-row" />
        </div>
      </div>
    </div>
  )
}

export function BuilderSkeleton() {
  return (
    <div className="screen builder-page" aria-busy="true" aria-label="Loading invoice builder">
      <div className="screen-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Skeleton variant="title" width="200px" />
          <Skeleton variant="text" width="280px" />
        </div>
        <Skeleton variant="text" width="120px" height="40px" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
          <Skeleton variant="title" width="160px" />
          <Skeleton variant="text" height="44px" style={{ marginBottom: '1rem' }} />
          <Skeleton variant="text" height="44px" style={{ marginBottom: '1rem' }} />
          <Skeleton variant="title" width="140px" style={{ marginTop: '1.5rem' }} />
          <Skeleton variant="table-row" />
          <Skeleton variant="table-row" />
        </div>

        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
          <Skeleton variant="title" width="180px" />
          <Skeleton variant="card" height="300px" />
        </div>
      </div>
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="screen detail-page" aria-busy="true" aria-label="Loading invoice details">
      <div className="screen-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Skeleton variant="title" width="180px" />
          <Skeleton variant="text" width="240px" />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Skeleton variant="text" width="100px" height="38px" />
          <Skeleton variant="text" width="100px" height="38px" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
          <Skeleton variant="title" width="220px" />
          <Skeleton variant="text" width="100%" height="200px" />
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
          <Skeleton variant="title" width="140px" />
          <Skeleton variant="text" height="30px" />
          <Skeleton variant="text" height="30px" />
          <Skeleton variant="text" height="30px" />
        </div>
      </div>
    </div>
  )
}

export function ClientsSkeleton() {
  return (
    <div className="screen clients-page" aria-busy="true" aria-label="Loading clients">
      <div className="screen-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Skeleton variant="title" width="160px" />
          <Skeleton variant="text" width="260px" />
        </div>
        <Skeleton variant="text" width="130px" height="40px" />
      </div>

      <Skeleton variant="text" height="48px" style={{ marginBottom: '1.5rem' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        <Skeleton variant="card" height="110px" />
        <Skeleton variant="card" height="110px" />
        <Skeleton variant="card" height="110px" />
        <Skeleton variant="card" height="110px" />
      </div>
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div className="screen settings-page" aria-busy="true" aria-label="Loading settings">
      <div className="screen-header">
        <Skeleton variant="title" width="180px" />
        <Skeleton variant="text" width="300px" />
      </div>

      <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--color-border)', maxWidth: '720px' }}>
        <Skeleton variant="title" width="150px" />
        <Skeleton variant="text" height="44px" style={{ marginBottom: '1rem' }} />
        <Skeleton variant="text" height="44px" style={{ marginBottom: '1rem' }} />
        <Skeleton variant="text" height="44px" style={{ marginBottom: '1rem' }} />
        <Skeleton variant="text" width="140px" height="40px" style={{ marginTop: '1rem' }} />
      </div>
    </div>
  )
}
