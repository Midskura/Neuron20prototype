export function ReportingHeader() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: 0
    }}>
      {/* Title */}
      <h1 style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '28px',
        fontWeight: 700,
        color: '#0F172A',
        letterSpacing: '-0.01em',
        lineHeight: '120%',
        margin: 0
      }}>
        Reporting
      </h1>
      
      {/* Subtitle */}
      <p style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        fontWeight: 400,
        color: '#64748B',
        lineHeight: '150%',
        margin: 0
      }}>
        Revenue & expenses overview across selected companies and dates
      </p>

      {/* Divider */}
      <div style={{
        height: '1px',
        backgroundColor: '#EEF1F4',
        width: '100%',
        marginTop: '12px',
        marginBottom: '16px'
      }} />
    </div>
  );
}
