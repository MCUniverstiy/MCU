'use client';

function OrgBox({
  children,
  size = 'md',
  className = '',
}: {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <div className={`org-box org-box--${size} ${className}`.trim()}>
      {children}
    </div>
  );
}

function OrgColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="org-column">
      <OrgBox size="sm">{title}</OrgBox>
      <div className="org-column__line" />
      <div className="org-column__items">
        {items.map((item) => (
          <OrgBox key={item} size="sm" className="org-box--leaf">
            {item}
          </OrgBox>
        ))}
      </div>
    </div>
  );
}

export default function OrgChart() {
  return (
    <div className="org-chart">
      {/* Top leadership */}
      <div className="org-chart__level org-chart__level--center">
        <OrgBox size="lg">Board Advisors</OrgBox>
      </div>

      <div className="org-chart__connector org-chart__connector--down" />

      <div className="org-chart__level org-chart__level--president">
        <OrgBox size="lg">MCU President</OrgBox>
        <div className="org-chart__advisor-link">
          <div className="org-chart__advisor-line" />
          <OrgBox size="md" className="org-box--advisor">
            Honary Advisor
          </OrgBox>
        </div>
      </div>

      <div className="org-chart__connector org-chart__connector--down org-chart__connector--tall" />

      {/* Four main branches */}
      <div className="org-chart__branches">
        {/* Faculty Chairman */}
        <div className="org-chart__branch org-chart__branch--faculty">
          <OrgBox size="md">Faculty Chairman</OrgBox>
          <div className="org-chart__connector org-chart__connector--down" />

          <div className="org-faculty">
            <div className="org-faculty__columns">
              <OrgColumn
                title="Business"
                items={['Wealth Management', 'Strategic Management', 'Marketing']}
              />
              <OrgColumn
                title="Technology"
                items={['IT', 'AI', 'Data Science']}
              />
              <OrgColumn
                title="Law"
                items={['Succession family office', 'Compliance', 'Ipo & M&A', 'Mediation']}
              />
              <OrgColumn
                title="Social"
                items={['ESG', 'Lifestyle', 'Social Media']}
              />
              <OrgColumn
                title="Finance"
                items={['Investment', 'Accounting', 'Risk Management']}
              />
            </div>

            <div className="org-faculty__bracket" />

            <div className="org-faculty__support">
              <OrgBox size="sm">Vice Chairman</OrgBox>
              <OrgBox size="sm">Vice Chairman</OrgBox>
              <OrgBox size="sm">Chief Secretary</OrgBox>
              <OrgBox size="sm">Committee</OrgBox>
            </div>
          </div>
        </div>

        {/* Operation & Finance */}
        <div className="org-chart__branch">
          <OrgBox size="md">Operation &amp; Finance</OrgBox>
          <div className="org-chart__connector org-chart__connector--down" />
          <div className="org-chart__children">
            <OrgBox size="sm">Admin</OrgBox>
            <OrgBox size="sm">Accounting Finance</OrgBox>
            <OrgBox size="sm">Marketing</OrgBox>
            <OrgBox size="sm">IT Technology</OrgBox>
          </div>
        </div>

        {/* Membership */}
        <div className="org-chart__branch">
          <OrgBox size="md">Membership</OrgBox>
          <div className="org-chart__connector org-chart__connector--down" />
          <div className="org-chart__children">
            <OrgBox size="sm">Wealth</OrgBox>
            <OrgBox size="sm">Talent</OrgBox>
            <div className="org-membership-elite">
              <OrgBox size="sm">Elite</OrgBox>
              <div className="org-chart__connector org-chart__connector--down org-chart__connector--short" />
              <div className="org-chart__children org-chart__children--compact">
                <OrgBox size="sm" className="org-box--leaf">Gold</OrgBox>
                <OrgBox size="sm" className="org-box--leaf">Platinum</OrgBox>
                <OrgBox size="sm" className="org-box--leaf">Diamond</OrgBox>
              </div>
            </div>
          </div>
        </div>

        {/* Intl. Exchange & Cooperation */}
        <div className="org-chart__branch org-chart__branch--single">
          <OrgBox size="md">Intl. Exchange &amp; Cooperation</OrgBox>
        </div>
      </div>
    </div>
  );
}
