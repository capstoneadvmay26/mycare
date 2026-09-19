// src/pages/PrivacyPolicy.jsx
import { ChevronLeft } from "react-bootstrap-icons";
import { useApp } from "../context/useApp";
import { useTheme } from "../context/ThemeContext";

const Section = ({ title, children, isDark }) => (
  <div className="mb-4">
    <h5
      className="fw-bold mb-2"
      style={{ fontSize: "16px", color: isDark ? "#FFF" : "#000" }}
    >
      {title}
    </h5>
    <div
      className="text-secondary"
      style={{ fontSize: "13px", lineHeight: 1.6, color: isDark ? "#A0A0A0" : "#666" }}
    >
      {children}
    </div>
  </div>
);

const PrivacyPolicy = () => {
  const { setCurrentTab } = useApp();
  const { isDark } = useTheme();

  return (
    <div
      className="d-flex flex-column h-100"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      {/* Header */}
      <div
        className="d-flex align-items-center p-3 border-bottom"
        style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
      >
        <button
          className="btn p-0 border-0"
          onClick={() => setCurrentTab("Settings")}
          style={{ color: isDark ? "#FFF" : "#000" }}
        >
          <ChevronLeft size={28} />
        </button>
        <h1
          className="fw-bold m-0 ms-3"
          style={{ fontSize: "22px", color: isDark ? "#FFF" : "#000" }}
        >
          Privacy Policy
        </h1>
      </div>

      {/* Content */}
      <div className="p-3 overflow-auto flex-grow-1">
        <p className="text-secondary mb-4" style={{ fontSize: "12px", fontStyle: "italic" }}>
          Last updated: September 2026
        </p>

        <Section title="1. About MyCare" isDark={isDark}>
          MyCare is a healthcare technology application designed to help users
          manage medication schedules, record adherence, track symptoms, and
          monitor the health information of dependent profiles. MyCare is not
          intended to replace a doctor, pharmacist, hospital, or other
          qualified healthcare professional.
        </Section>

        <Section title="2. Information We Collect" isDark={isDark}>
          <strong>Account:</strong> Phone/email, OTP verification, profile info.
          <br />
          <strong>Medication:</strong> Name, dosage, frequency, schedule times,
          start/end dates, adherence records.
          <br />
          <strong>Symptoms:</strong> Type, severity, timestamps, check-in
          responses.
          <br />
          <strong>Dependents:</strong> Name, relationship, condition, and related
          health data you choose to enter.
          <br />
          <strong>Technical:</strong> Push notification tokens and device
          permissions.
        </Section>

        <Section title="3. How We Use Your Information" isDark={isDark}>
          To provide medication reminders, record adherence, track symptoms,
          schedule follow-up check-ins, manage dependent profiles, send
          notifications, and comply with legal obligations.
        </Section>

        <Section title="4. Health Information" isDark={isDark}>
          Medication and symptom information can reveal information about a
          person's health. MyCare treats this as sensitive data and applies
          encryption in transit and at rest, plus role-based access controls
          for dependent profiles.
        </Section>

        <Section title="5. Push Notifications" isDark={isDark}>
          MyCare uses push notifications for medication reminders, missed-dose
          alerts, symptom follow-ups, and subscription notices. You can manage
          notification preferences in Settings or your device settings.
        </Section>

        <Section title="6. Data Storage & Security" isDark={isDark}>
          MyCare's backend infrastructure uses a Node.js/Express API with
          PostgreSQL database hosted on AWS or Google Cloud. We apply encryption
          at rest, encryption in transit, and role-based access controls. No
          system can guarantee absolute security.
        </Section>

        <Section title="7. Sharing of Information" isDark={isDark}>
          <strong>We do not sell your health information.</strong> We only share
          data with third-party service providers where necessary to deliver
          the service (Firebase for notifications, AWS/Google Cloud for
          hosting, Paystack for payments).
        </Section>

        <Section title="8. Data Retention" isDark={isDark}>
          We retain information for as long as reasonably necessary to provide
          the services, meet legal obligations, and protect the security of the
          service. When no longer required, data may be deleted, anonymized, or
          securely disposed of.
        </Section>

        <Section title="9. Your Privacy Rights" isDark={isDark}>
          Subject to applicable law, you may have rights to access, correct,
          delete, or export your information, and to withdraw consent where
          processing is based on consent. MyCare includes privacy/data settings
          for these actions.
        </Section>

        <Section title="10. Nigerian Data Protection" isDark={isDark}>
          MyCare operates in accordance with the Nigeria Data Protection Act
          and applicable regulations. Because we process health-related
          information, additional privacy and security safeguards apply.
        </Section>

        <Section title="11. International Processing" isDark={isDark}>
          Some technology providers may process information outside Nigeria.
          Where this occurs, MyCare will apply the safeguards required by
          applicable data-protection law.
        </Section>

        <Section title="12. Children's Information" isDark={isDark}>
          MyCare is not a children's healthcare service. If the App is intended
          to collect or manage information concerning children, additional
          safeguards and consent requirements will be implemented before
          offering that functionality.
        </Section>

        <Section title="13. Changes to This Policy" isDark={isDark}>
          We may update this Privacy Policy when practices, technology,
          features, or legal obligations change. The "Last Updated" date
          identifies the latest version.
        </Section>

        <Section title="14. Contact" isDark={isDark}>
          For questions or requests about your personal information, please
          contact us at{" "}
          <a href="mailto:privacy@mycare-consortium.com" style={{ color: "#0033CC" }}>
            privacy@mycare-consortium.com
          </a>
          .
        </Section>

        <div
          className="rounded-3 p-3 mb-4"
          style={{
            backgroundColor: "rgba(0, 51, 204, 0.04)",
            border: "1px solid rgba(0, 51, 204, 0.15)",
          }}
        >
          <p className="m-0" style={{ fontSize: "12px", color: "#0033CC" }}>
            This document is a product-level summary. Please consult MyCare's
            legal team for the full, binding version of our Terms & Privacy
            Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;