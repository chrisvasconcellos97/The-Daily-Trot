import { useNavigate } from 'react-router-dom'
import ScallopHeader, { IconBtn } from '../components/ScallopHeader'
import C from '../colors'

function Divider() {
  const width = 60
  const mid = width / 2
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
      <svg width={width} height="12" viewBox={`0 0 ${width} 12`} style={{ display: 'block' }}>
        <line x1="0" y1="6" x2={mid - 8} y2="6" stroke={C.gold} strokeWidth="0.6"/>
        <line x1={mid + 8} y1="6" x2={width} y2="6" stroke={C.gold} strokeWidth="0.6"/>
        <g transform={`translate(${mid}, 6) rotate(45)`}>
          <rect x="-3" y="-3" width="6" height="6" fill="none" stroke={C.gold} strokeWidth="0.7"/>
        </g>
      </svg>
    </div>
  )
}

function Section({ heading, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontFamily: C.serif, fontSize: 18, color: C.ink, fontWeight: 600, marginBottom: 10 }}>{heading}</div>
      <div style={{ fontFamily: C.sans, fontSize: 13, color: C.inkSoft, lineHeight: 1.65 }}>{children}</div>
    </div>
  )
}

function BulletList({ items }) {
  return (
    <ul style={{ margin: '8px 0 0', paddingLeft: 16 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontFamily: C.sans, fontSize: 13, color: C.inkSoft, lineHeight: 1.65, marginBottom: 4 }}>{item}</li>
      ))}
    </ul>
  )
}

export default function PrivacyView() {
  const navigate = useNavigate()

  return (
    <div className="view-enter" style={{ paddingBottom: 60 }}>
      <ScallopHeader
        title="PRIVACY & DATA"
        leading={
          <IconBtn onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </IconBtn>
        }
      />

      <div style={{ padding: '28px 24px' }}>
        <Section heading="Your data is yours.">
          Everything you add to Daily Trot — your family's schedule, kids' health records, grocery lists — is stored securely in your private account. No one else can see it.
        </Section>

        <Divider />

        <Section heading="What we store">
          <BulletList items={[
            "Your family's name and account email",
            "Kids' names and ages (needed for the app to work)",
            "Events, schedules, grocery lists, health visits, and vaccines you add",
            "Nothing else",
          ]} />
        </Section>

        <Divider />

        <Section heading="What we don't store">
          <BulletList items={[
            "Photos you scan — images are sent to Claude to read, then immediately discarded. Only the extracted text (height, vaccine name, event date) is saved.",
            "Location data — we never track where you are.",
            "Your browsing or usage patterns.",
          ]} />
        </Section>

        <Divider />

        <Section heading="Who can see your data">
          Only you. Data is protected at the database level — even if someone had your account ID, they cannot access your family's records without your login.
        </Section>

        <Divider />

        <Section heading="Community">
          Community posts are visible to members of your invite group only — people you've chosen to share with. They're not public.
        </Section>

        <Divider />

        <Section heading="No ads. Ever.">
          Daily Trot is not free because we sell your data. Your family's information is never shared with advertisers or third parties.
        </Section>
      </div>
    </div>
  )
}
