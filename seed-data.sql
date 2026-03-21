-- =============================================================================
-- ICE Website — Seed Data
-- =============================================================================
-- Run this file in the Supabase SQL Editor AFTER running supabase-setup.sql.
-- Contents:
--   1. contacts + subscribers tables (if missing) + RLS policies
--   2. pages seed data (24 rows)
--   3. navigation_items seed data (~29 rows)
--   4. page_sections seed data (homepage + key pages)
-- =============================================================================


-- =============================================================================
-- PART 0: FIX client_users RLS (circular dependency fix)
-- =============================================================================
-- Without this, client login loops because the user can't read their own
-- client_users row to pass the middleware check.

DROP POLICY IF EXISTS "client_users: users can select self" ON client_users;
CREATE POLICY "client_users: users can select self"
  ON client_users FOR SELECT TO authenticated
  USING (id = auth.uid());

-- =============================================================================
-- PART 1: CREATE contacts + subscribers TABLES + RLS
-- =============================================================================

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  phone text,
  service text,
  message text NOT NULL,
  sms_consent boolean DEFAULT false,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add is_read column if table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'is_read') THEN
    ALTER TABLE contacts ADD COLUMN is_read boolean DEFAULT false;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  phone text,
  sms_consent boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Policies: anonymous can insert, admins can select/manage
DO $$
BEGIN
  -- contacts policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'contacts: anon can insert') THEN
    EXECUTE 'CREATE POLICY "contacts: anon can insert" ON contacts FOR INSERT TO anon WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'contacts: authenticated can insert') THEN
    EXECUTE 'CREATE POLICY "contacts: authenticated can insert" ON contacts FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'contacts: admins can select') THEN
    EXECUTE 'CREATE POLICY "contacts: admins can select" ON contacts FOR SELECT TO authenticated USING (is_admin())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'contacts: admins can delete') THEN
    EXECUTE 'CREATE POLICY "contacts: admins can delete" ON contacts FOR DELETE TO authenticated USING (is_admin())';
  END IF;

  -- subscribers policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'subscribers: anon can insert') THEN
    EXECUTE 'CREATE POLICY "subscribers: anon can insert" ON subscribers FOR INSERT TO anon WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'subscribers: authenticated can insert') THEN
    EXECUTE 'CREATE POLICY "subscribers: authenticated can insert" ON subscribers FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'subscribers: admins can select') THEN
    EXECUTE 'CREATE POLICY "subscribers: admins can select" ON subscribers FOR SELECT TO authenticated USING (is_admin())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'subscribers: admins can delete') THEN
    EXECUTE 'CREATE POLICY "subscribers: admins can delete" ON subscribers FOR DELETE TO authenticated USING (is_admin())';
  END IF;
END
$$;


-- =============================================================================
-- PART 2: SEED pages TABLE (24 rows)
-- =============================================================================

-- Clear existing seed data if re-running
DELETE FROM page_sections;
DELETE FROM pages;

-- Static pages
INSERT INTO pages (slug, title, meta_title, meta_description, page_type, is_published, sort_order) VALUES
  ('home', 'Home', 'International Computer Exchange | IBM Business Partner Since 1990', 'Enterprise technology solutions including cloud hosting, data protection, security, and managed services.', 'static', true, 0),
  ('solutions', 'Solutions', 'Enterprise Solutions | ICE', 'Comprehensive managed cloud, data protection, security, and IT services.', 'static', true, 1),
  ('partners', 'Partners', 'Technology Partners | ICE', 'Authorized partnerships with IBM, Lenovo, Cisco, Dell, and more.', 'static', true, 2),
  ('why-ice', 'Why ICE', 'Why Choose ICE | 35+ Years of Enterprise IT', 'Over 35 years as an IBM Business Partner delivering enterprise technology solutions.', 'static', true, 3),
  ('contact', 'Contact Us', 'Contact Us | ICE', 'Get in touch with International Computer Exchange for enterprise IT solutions.', 'static', true, 4);

-- Legal pages
INSERT INTO pages (slug, title, meta_title, meta_description, page_type, is_published, sort_order) VALUES
  ('terms-of-service', 'Terms of Service', 'Terms of Service | ICE', 'Terms and conditions for using ICE services.', 'legal', true, 50),
  ('sms-consent', 'SMS Consent', 'SMS Consent | ICE', 'SMS messaging consent and opt-in policy.', 'legal', true, 51);

-- Solution pages
INSERT INTO pages (slug, title, meta_title, meta_description, page_type, is_published, sort_order) VALUES
  -- Managed Cloud Services
  ('managed-cloud-hosting', 'Managed Cloud Hosting', 'Managed Cloud Hosting | ICE', 'Enterprise-grade cloud hosting with 24/7 management and support.', 'solution', true, 10),
  ('managed-private-cloud', 'Managed Private Cloud', 'Managed Private Cloud | ICE', 'Dedicated private cloud environments for maximum control and security.', 'solution', true, 11),
  ('managed-hybrid-cloud', 'Managed Hybrid Cloud', 'Managed Hybrid Cloud | ICE', 'Seamless hybrid cloud solutions bridging on-premise and cloud infrastructure.', 'solution', true, 12),
  ('cloud-migration', 'Cloud Migration Services', 'Cloud Migration | ICE', 'Expert-led cloud migration with minimal downtime and risk.', 'solution', true, 13),

  -- Managed Data Protection
  ('backup-as-a-service', 'Backup as a Service', 'Backup as a Service | ICE', 'Automated enterprise backup solutions with guaranteed recovery.', 'solution', true, 20),
  ('disaster-recovery', 'Disaster Recovery as a Service', 'Disaster Recovery | ICE', 'Business continuity with rapid disaster recovery solutions.', 'solution', true, 21),
  ('high-availability', 'High Availability as a Service', 'High Availability | ICE', 'Maximize uptime with high availability clustering and failover.', 'solution', true, 22),
  ('ransomware-recovery', 'Ransomware Recovery', 'Ransomware Recovery | ICE', 'Rapid recovery from ransomware attacks with air-gapped backups.', 'solution', true, 23),

  -- Managed Security
  ('ibm-i-security', 'IBM i Security', 'IBM i Security | ICE', 'Comprehensive security solutions for IBM i environments.', 'solution', true, 30),
  ('protection-suite', 'Protection Suite', 'Protection Suite | ICE', 'Multi-layered endpoint and network protection.', 'solution', true, 31),
  ('security-monitoring', 'Security Monitoring', 'Security Monitoring | ICE', '24/7 security monitoring and incident response.', 'solution', true, 32),
  ('threat-detection', 'Threat Detection and Response', 'Threat Detection | ICE', 'Advanced threat detection with real-time response capabilities.', 'solution', true, 33),
  ('endpoint-security', 'Endpoint Security', 'Endpoint Security | ICE', 'Enterprise endpoint protection and management.', 'solution', true, 34),

  -- Managed Services
  ('managed-microsoft', 'Managed Microsoft Services', 'Managed Microsoft | ICE', 'Expert management of Microsoft 365, Azure, and enterprise applications.', 'solution', true, 40),
  ('automation-suite', 'Automation Suite', 'Automation Suite | ICE', 'IT process automation for operational efficiency.', 'solution', true, 41),
  ('systems-management', 'Systems Management', 'Systems Management | ICE', 'Proactive systems management and monitoring.', 'solution', true, 42),
  ('ibm-power-vs', 'IBM Power VS', 'IBM Power VS | ICE', 'IBM Power Virtual Server solutions for flexible, scalable infrastructure.', 'solution', true, 43);


-- =============================================================================
-- PART 3: SEED navigation_items TABLE
-- =============================================================================

DELETE FROM navigation_items;

-- Navbar top-level items
INSERT INTO navigation_items (location, label, href, sort_order, is_visible) VALUES
  ('navbar', 'Home', '/', 0, true),
  ('navbar', 'Solutions', '/solutions', 1, true),
  ('navbar', 'Partners', '/partners', 2, true),
  ('navbar', 'Why ICE', '/why-ice', 3, true),
  ('navbar', 'Contact Us', '/contact', 4, true);

-- Mega menu items (linked to Solutions parent)
WITH solutions_parent AS (
  SELECT id FROM navigation_items WHERE location = 'navbar' AND label = 'Solutions' LIMIT 1
)
INSERT INTO navigation_items (location, parent_id, label, href, mega_column_title, mega_column_icon, sort_order, is_visible) VALUES
  -- Managed Cloud Services column
  ('navbar_mega', (SELECT id FROM solutions_parent), 'Managed Cloud Hosting', '/solutions/managed-cloud-hosting', 'Managed Cloud Services', 'Cloud', 0, true),
  ('navbar_mega', (SELECT id FROM solutions_parent), 'Managed Private Cloud', '/solutions/managed-private-cloud', 'Managed Cloud Services', 'Cloud', 1, true),
  ('navbar_mega', (SELECT id FROM solutions_parent), 'Managed Hybrid Cloud', '/solutions/managed-hybrid-cloud', 'Managed Cloud Services', 'Cloud', 2, true),
  ('navbar_mega', (SELECT id FROM solutions_parent), 'Cloud Migration Services', '/solutions/cloud-migration', 'Managed Cloud Services', 'Cloud', 3, true),

  -- Managed Data Protection column
  ('navbar_mega', (SELECT id FROM solutions_parent), 'Backup as a Service', '/solutions/backup-as-a-service', 'Managed Data Protection', 'Shield', 10, true),
  ('navbar_mega', (SELECT id FROM solutions_parent), 'Disaster Recovery as a Service', '/solutions/disaster-recovery', 'Managed Data Protection', 'Shield', 11, true),
  ('navbar_mega', (SELECT id FROM solutions_parent), 'High Availability as a Service', '/solutions/high-availability', 'Managed Data Protection', 'Shield', 12, true),
  ('navbar_mega', (SELECT id FROM solutions_parent), 'Ransomware Recovery', '/solutions/ransomware-recovery', 'Managed Data Protection', 'Shield', 13, true),

  -- Managed Security column
  ('navbar_mega', (SELECT id FROM solutions_parent), 'IBM i Security', '/solutions/ibm-i-security', 'Managed Security', 'Lock', 20, true),
  ('navbar_mega', (SELECT id FROM solutions_parent), 'Protection Suite', '/solutions/protection-suite', 'Managed Security', 'Lock', 21, true),
  ('navbar_mega', (SELECT id FROM solutions_parent), 'Security Monitoring', '/solutions/security-monitoring', 'Managed Security', 'Lock', 22, true),
  ('navbar_mega', (SELECT id FROM solutions_parent), 'Threat Detection and Response', '/solutions/threat-detection', 'Managed Security', 'Lock', 23, true),
  ('navbar_mega', (SELECT id FROM solutions_parent), 'Endpoint Security', '/solutions/endpoint-security', 'Managed Security', 'Lock', 24, true),

  -- Managed Services column
  ('navbar_mega', (SELECT id FROM solutions_parent), 'Managed Microsoft Services', '/solutions/managed-microsoft', 'Managed Services', 'Server', 30, true),
  ('navbar_mega', (SELECT id FROM solutions_parent), 'Automation Suite', '/solutions/automation-suite', 'Managed Services', 'Server', 31, true),
  ('navbar_mega', (SELECT id FROM solutions_parent), 'Systems Management', '/solutions/systems-management', 'Managed Services', 'Server', 32, true),
  ('navbar_mega', (SELECT id FROM solutions_parent), 'IBM Power VS', '/solutions/ibm-power-vs', 'Managed Services', 'Server', 33, true);

-- Footer quick links
INSERT INTO navigation_items (location, label, href, sort_order, is_visible) VALUES
  ('footer_quick', 'Home', '/', 0, true),
  ('footer_quick', 'Solutions', '/solutions', 1, true),
  ('footer_quick', 'Partners', '/partners', 2, true),
  ('footer_quick', 'Why ICE', '/why-ice', 3, true),
  ('footer_quick', 'Contact Us', '/contact', 4, true);

-- Footer legal links
INSERT INTO navigation_items (location, label, href, sort_order, is_visible) VALUES
  ('footer_legal', 'Terms of Service', '/terms-of-service', 0, true),
  ('footer_legal', 'SMS Consent', '/sms-consent', 1, true);


-- =============================================================================
-- PART 4: SEED page_sections TABLE
-- =============================================================================

-- ─── Homepage Sections ───────────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{
  "headline": "Enterprise Technology. Redefined.",
  "subheadline": "IBM Business Partner since 1990 — powering cloud, security & managed services for 500+ enterprises.",
  "cta_primary": {"label": "Explore Solutions", "href": "/solutions"},
  "cta_secondary": {"label": "Contact Us", "href": "/contact"}
}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'home';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'services_grid', 'content', '{
  "heading": "Enterprise Solutions",
  "items": [
    {"icon": "Cloud", "title": "Managed Cloud Services", "description": "Scalable cloud hosting, private cloud, hybrid cloud, and seamless migration services for enterprise workloads.", "href": "/solutions/managed-cloud-hosting"},
    {"icon": "Shield", "title": "Data Protection", "description": "Enterprise backup, disaster recovery, high availability, and ransomware recovery to safeguard critical data.", "href": "/solutions/backup-as-a-service"},
    {"icon": "Lock", "title": "Managed Security", "description": "IBM i security, endpoint protection, threat detection, and 24/7 security monitoring for complete coverage.", "href": "/solutions/ibm-i-security"},
    {"icon": "Server", "title": "Managed Services", "description": "Microsoft services, automation, systems management, and IBM Power VS — fully managed by our experts.", "href": "/solutions/managed-microsoft"}
  ]
}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'home';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'stats', 'metrics', '{
  "items": [
    {"value": 35, "suffix": "+", "label": "Years of Experience"},
    {"value": 1200, "suffix": "+", "label": "Successful Projects"},
    {"value": 500, "suffix": "+", "label": "Enterprise Clients"},
    {"value": 100, "suffix": "%", "label": "Uptime SLA"}
  ]
}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'home';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'data_centers', 'content', '{
  "heading": "High-Security Data Centers",
  "description": "Tier-3 facilities with geographically separated infrastructure. PCI, HIPAA, SOX, and GDPR compliant.",
  "features": ["Redundant Power Systems", "Enterprise-Grade Cooling", "Flash Systems Storage", "24/7 Physical Security", "Multiple Network Carriers", "SOC 1-SSAE 18 Certified"]
}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'home';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'infrastructure', 'content', '{
  "heading": "Enterprise Infrastructure",
  "description": "Our infrastructure spans data centers, cloud platforms, and security layers."
}'::jsonb, 4, true
FROM pages p WHERE p.slug = 'home';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'timeline', 'timeline', '{
  "heading": "35 Years of Innovation",
  "items": [
    {"year": "1990", "title": "Founded", "description": "Established as an IBM Business Partner in Boca Raton, Florida."},
    {"year": "2000", "title": "Cloud Pioneer", "description": "Early adoption of cloud infrastructure and managed hosting solutions."},
    {"year": "2010", "title": "Security Focus", "description": "Expanded into managed security, threat detection, and data protection."},
    {"year": "2020", "title": "Hybrid Cloud Era", "description": "Full-suite hybrid cloud, disaster recovery, and automation services."},
    {"year": "2025", "title": "35 Years Strong", "description": "Serving 500+ enterprises across manufacturing, finance, healthcare, and more."}
  ]
}'::jsonb, 5, true
FROM pages p WHERE p.slug = 'home';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'partners_marquee', 'gallery', '{
  "heading": "Trusted Technology Partners",
  "partners": ["IBM", "Lenovo", "Cisco", "Dell", "Printronix", "CloudSafe", "Acronix", "DASCOM"]
}'::jsonb, 6, true
FROM pages p WHERE p.slug = 'home';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'industries_cta', 'industries', '{
  "heading": "Industries We Serve",
  "items": [
    {"name": "Manufacturing", "icon": "Factory"},
    {"name": "Financial Services", "icon": "Landmark"},
    {"name": "Healthcare", "icon": "HeartPulse"},
    {"name": "Insurance", "icon": "Shield"},
    {"name": "Legal", "icon": "Scale"}
  ]
}'::jsonb, 7, true
FROM pages p WHERE p.slug = 'home';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'metrics', 'metrics', '{
  "heading": "Enterprise Performance",
  "description": "Real-time metrics from our managed infrastructure."
}'::jsonb, 8, true
FROM pages p WHERE p.slug = 'home';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'final_cta', 'cta', '{
  "heading": "Ready to Transform Your IT?",
  "description": "Join 500+ enterprises that trust ICE for their mission-critical infrastructure.",
  "cta_primary": {"label": "Get Started", "href": "/contact"},
  "cta_secondary": {"label": "Explore Solutions", "href": "/solutions"}
}'::jsonb, 9, true
FROM pages p WHERE p.slug = 'home';

-- ─── Partners Page Sections ──────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{
  "headline": "Technology Partners",
  "subheadline": "We partner with the world''s leading technology companies to deliver best-in-class enterprise solutions."
}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'partners';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'partners_grid', 'partners', '{
  "partners": [
    {"name": "IBM", "description": "World leader in enterprise technology. IBM Power Systems, IBM i, AI, cloud, and hybrid solutions.", "specializations": ["Power Systems", "IBM i", "AI & Watson", "Hybrid Cloud"], "partner_since": "1990"},
    {"name": "Lenovo", "description": "Global technology leader in servers, storage, and data center solutions.", "specializations": ["ThinkSystem Servers", "ThinkAgile", "Data Center"], "partner_since": "2015"},
    {"name": "Cisco", "description": "Networking, security, collaboration, and data center solutions.", "specializations": ["Networking", "Security", "Collaboration"], "partner_since": "2005"},
    {"name": "Dell", "description": "Servers, storage, networking, and enterprise solutions.", "specializations": ["PowerEdge Servers", "PowerStore", "Enterprise Storage"], "partner_since": "2010"},
    {"name": "Printronix", "description": "Industrial and enterprise printing solutions.", "specializations": ["Industrial Printing", "Line Printers", "Thermal Printers"], "partner_since": "2003"},
    {"name": "CloudSafe", "description": "Enterprise cloud hosting and managed services.", "specializations": ["Cloud Hosting", "Managed Services", "Business Continuity"], "partner_since": "2012"},
    {"name": "DASCOM", "description": "Technology solutions and services partner providing innovative business technology solutions.", "specializations": ["Enterprise Printing", "Document Management"], "partner_since": "2008"},
    {"name": "Acronix", "description": "Technology solutions and services provider specializing in enterprise infrastructure.", "specializations": ["Infrastructure", "Enterprise Support"], "partner_since": "2016"},
    {"name": "Cybernetics", "description": "Enterprise technology solutions and services.", "specializations": ["Tape Solutions", "Data Backup", "Archive Storage"], "partner_since": "2000"}
  ]
}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'partners';

-- ─── Why ICE Page Sections ───────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{
  "headline": "Why Choose ICE?",
  "subheadline": "Over 35 years of enterprise technology expertise as an IBM Business Partner."
}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'why-ice';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'stats', 'metrics', '{
  "items": [
    {"value": 35, "suffix": "+", "label": "Years of Experience"},
    {"value": 1200, "suffix": "+", "label": "Projects Delivered"},
    {"value": 500, "suffix": "+", "label": "Clients Served"},
    {"value": 100, "suffix": "%", "label": "Uptime SLA"}
  ]
}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'why-ice';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'differentiators', 'features', '{
  "items": [
    {"icon": "Award", "title": "IBM Business Partner Since 1990", "description": "Over three decades of trusted expertise as an IBM Business Partner. We bring deep knowledge of IBM Power Systems, IBM i, and enterprise solutions to every engagement."},
    {"icon": "Server", "title": "Enterprise-Grade Infrastructure", "description": "Our SOC 1-SSAE 18 certified data centers provide the reliability, security, and performance that enterprise workloads demand. Redundant power, cooling, and connectivity ensure maximum uptime."},
    {"icon": "Layers", "title": "End-to-End Solutions", "description": "From cloud hosting and disaster recovery to hardware procurement and managed services, we provide comprehensive technology solutions that cover your entire IT lifecycle."}
  ]
}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'why-ice';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'industries', 'industries', '{
  "heading": "Industries We Serve",
  "items": [
    {"icon": "Factory", "title": "Manufacturing & Logistics", "description": "Powering supply chains and production systems with reliable IBM infrastructure and cloud solutions."},
    {"icon": "Landmark", "title": "Financial Services", "description": "Secure, compliant hosting and data protection for banks, credit unions, and financial institutions."},
    {"icon": "HeartPulse", "title": "Healthcare", "description": "HIPAA-ready infrastructure and managed services for healthcare providers and health systems."},
    {"icon": "ShieldCheck", "title": "Insurance", "description": "High-availability platforms and disaster recovery for insurance carriers and agencies."},
    {"icon": "Scale", "title": "Legal & Professional Services", "description": "Secure document management, reliable hosting, and IT support for law firms and professional organizations."}
  ]
}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'why-ice';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'faqs', 'faq', '{
  "items": [
    {"question": "Why choose International Computer Exchange?", "answer": "International Computer Exchange has been an IBM Business Partner since 1990, providing over 35 years of enterprise technology expertise. We specialize in IBM Power Systems, cloud hosting, disaster recovery, and managed services."},
    {"question": "What solutions does ICE offer?", "answer": "ICE offers a comprehensive suite of enterprise technology solutions including Managed Cloud Hosting, Disaster Recovery as a Service, Backup as a Service, IBM i Security solutions, Managed Security services, Hardware sales, and end-to-end IT managed services."},
    {"question": "Where is ICE''s infrastructure hosted?", "answer": "ICE leverages Tier-3 data centers with geographically separated backup infrastructure. All facilities are PCI, HIPAA, SOX, and GDPR compliant."},
    {"question": "Does ICE resell new hardware?", "answer": "Yes, ICE resells both new and refurbished enterprise hardware. As an authorized partner for IBM, Lenovo, Cisco, Dell, and other leading manufacturers."},
    {"question": "How do I get started?", "answer": "Contact us at 1-800-786-9188 or email info@icesales.com to schedule a consultation."}
  ]
}'::jsonb, 4, true
FROM pages p WHERE p.slug = 'why-ice';

-- ─── Contact Page Sections ───────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{
  "headline": "Get in Touch",
  "subheadline": "Ready to discuss your enterprise IT needs? We''re here to help."
}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'contact';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'contact_info', 'contact', '{
  "items": [
    {"icon": "MapPin", "label": "Address", "value": "1279 W Palmetto Park Rd #272415", "sub_value": "Boca Raton, FL 33427"},
    {"icon": "Mail", "label": "Email", "value": "info@icesales.com", "href": "mailto:info@icesales.com"},
    {"icon": "Phone", "label": "Phone", "value": "1-800-786-9188", "href": "tel:18007869188"},
    {"icon": "Clock", "label": "Hours", "value": "Mon - Fri, 9:00 AM - 5:00 PM ET"}
  ]
}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'contact';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'service_options', 'form', '{
  "options": ["Managed Cloud Services", "Managed Data Protection", "Managed Security", "Managed Services", "Hardware & Resale", "Other"]
}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'contact';

-- ─── Terms of Service Sections ────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{
  "headline": "Terms of Service",
  "subheadline": "Please read these terms carefully before using our services."
}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'terms-of-service';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'sections', 'content', '{
  "items": [
    {"id": "acceptance", "title": "1. Acceptance of Terms", "content": "By accessing and using the services provided by International Computer Exchange, Inc. (\"ICE\", \"we\", \"us\", or \"our\"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."},
    {"id": "services", "title": "2. Services", "content": "ICE provides managed IT services, cloud hosting, data protection, security solutions, and related technology services. The specific services provided to you will be outlined in your service agreement."},
    {"id": "accounts", "title": "3. User Accounts", "content": "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify ICE immediately of any unauthorized access to or use of your account."},
    {"id": "acceptable-use", "title": "4. Acceptable Use", "content": "You agree not to use our services for any unlawful purpose or in any way that could damage, disable, or impair our services. You may not attempt to gain unauthorized access to any part of our systems."},
    {"id": "data-protection", "title": "5. Data Protection", "content": "We implement industry-standard security measures to protect your data. Our data centers are SOC 1-SSAE 18 certified and comply with PCI, HIPAA, SOX, and GDPR requirements where applicable."},
    {"id": "liability", "title": "6. Limitation of Liability", "content": "To the maximum extent permitted by law, ICE shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services."},
    {"id": "termination", "title": "7. Termination", "content": "Either party may terminate the service agreement as outlined in the specific terms of your contract. Upon termination, your access to our services will be discontinued."},
    {"id": "changes", "title": "8. Changes to Terms", "content": "ICE reserves the right to modify these terms at any time. We will notify users of significant changes via email or through our portal. Continued use of our services constitutes acceptance of modified terms."},
    {"id": "contact", "title": "9. Contact Information", "content": "For questions regarding these terms, contact us at info@icesales.com or call 1-800-786-9188."}
  ]
}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'terms-of-service';

-- ─── SMS Consent Sections ────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{
  "headline": "SMS Consent",
  "subheadline": "Information about our SMS messaging practices and your consent."
}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'sms-consent';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'sections', 'content', '{
  "items": [
    {"id": "consent", "title": "1. SMS Consent", "content": "By providing your phone number and opting in, you consent to receive SMS messages from International Computer Exchange, Inc. regarding your account, service updates, and important notifications."},
    {"id": "frequency", "title": "2. Message Frequency", "content": "Message frequency varies. You may receive messages related to service alerts, account notifications, appointment reminders, and promotional communications."},
    {"id": "costs", "title": "3. Message and Data Rates", "content": "Standard message and data rates may apply. Please contact your mobile carrier for details about your messaging plan."},
    {"id": "opt-out", "title": "4. Opt-Out", "content": "You can opt out of SMS messages at any time by replying STOP to any message. After opting out, you will receive a confirmation message and will no longer receive SMS communications from us."},
    {"id": "help", "title": "5. Help", "content": "For help with SMS messaging, reply HELP to any message or contact us at info@icesales.com or 1-800-786-9188."},
    {"id": "privacy", "title": "6. Privacy", "content": "Your phone number and messaging data will be handled in accordance with our privacy practices. We do not sell or share your phone number with third parties for marketing purposes."},
    {"id": "carriers", "title": "7. Supported Carriers", "content": "Our SMS service is supported by all major US carriers including AT&T, Verizon, T-Mobile, Sprint, and others. Carrier-specific terms may apply."}
  ]
}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'sms-consent';

-- ─── Site Settings (footer info, company details) ────────────────────────

INSERT INTO pages (slug, title, page_type, is_published, sort_order)
VALUES ('site-settings', 'Site Settings', 'static', true, 99)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'company_info', 'content', '{
  "name": "International Computer Exchange",
  "tagline": "IBM Business Partner Since 1990",
  "address": "1279 W Palmetto Park Rd #272415",
  "city": "Boca Raton, FL 33427",
  "phone": "1-800-786-9188",
  "email": "info@icesales.com",
  "hours": "Mon - Fri, 9:00 AM - 5:00 PM ET",
  "logo": "/images/logo/ice-logo.jpg"
}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'site-settings';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'footer', 'content', '{
  "ibm_partner_text": "As an IBM Business Partner since 1990, ICE delivers enterprise-grade cloud hosting, data protection, security, and managed services for businesses worldwide.",
  "copyright": "International Computer Exchange, Inc.",
  "social_links": []
}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'site-settings';

-- ─── Solutions Index Page ────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{
  "headline": "Enterprise Solutions",
  "subheadline": "Comprehensive managed services designed for enterprise reliability, security, and performance."
}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'solutions';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'categories', 'content', '{
  "items": [
    {
      "title": "Managed Cloud Services",
      "description": "Scalable, reliable cloud infrastructure tailored to enterprise workloads.",
      "icon": "Cloud",
      "services": [
        {"title": "Managed Cloud Hosting", "href": "/solutions/managed-cloud-hosting", "icon": "Cloud", "description": "Enterprise-grade cloud hosting with 24/7 management and support."},
        {"title": "Managed Private Cloud", "href": "/solutions/managed-private-cloud", "icon": "Server", "description": "Dedicated private cloud environments built for security and compliance."},
        {"title": "Managed Hybrid Cloud", "href": "/solutions/managed-hybrid-cloud", "icon": "Database", "description": "Seamlessly bridge on-premises and cloud infrastructure."},
        {"title": "Cloud Migration Services", "href": "/solutions/cloud-migration", "icon": "RefreshCw", "description": "Zero-downtime migration strategy and execution for any workload."}
      ]
    },
    {
      "title": "Managed Data Protection",
      "description": "Comprehensive data resilience and business continuity strategies.",
      "icon": "Shield",
      "services": [
        {"title": "Backup as a Service", "href": "/solutions/backup-as-a-service", "icon": "HardDrive", "description": "Automated, encrypted backups with rapid restore capabilities."},
        {"title": "Disaster Recovery as a Service", "href": "/solutions/disaster-recovery", "icon": "RefreshCw", "description": "Full disaster recovery with guaranteed RTOs and RPOs."},
        {"title": "High Availability as a Service", "href": "/solutions/high-availability", "icon": "Database", "description": "Real-time replication and automatic failover for critical systems."},
        {"title": "Ransomware Recovery", "href": "/solutions/ransomware-recovery", "icon": "Shield", "description": "Immutable backups and rapid recovery from ransomware attacks."}
      ]
    },
    {
      "title": "Managed Security",
      "description": "End-to-end cybersecurity for the modern enterprise threat landscape.",
      "icon": "Lock",
      "services": [
        {"title": "IBM i Security", "href": "/solutions/ibm-i-security", "icon": "ShieldCheck", "description": "Comprehensive security assessments and hardening for IBM i environments."},
        {"title": "Protection Suite", "href": "/solutions/protection-suite", "icon": "Shield", "description": "Multi-layered endpoint and network protection suite."},
        {"title": "Security Monitoring", "href": "/solutions/security-monitoring", "icon": "Eye", "description": "24/7 SOC monitoring with real-time threat intelligence."},
        {"title": "Threat Detection & Response", "href": "/solutions/threat-detection", "icon": "Eye", "description": "Advanced threat hunting and automated incident response."},
        {"title": "Endpoint Security", "href": "/solutions/endpoint-security", "icon": "Monitor", "description": "Next-gen endpoint protection with AI-driven threat prevention."}
      ]
    },
    {
      "title": "Managed Services",
      "description": "Fully managed IT operations so you can focus on your business.",
      "icon": "Server",
      "services": [
        {"title": "Managed Microsoft Services", "href": "/solutions/managed-microsoft", "icon": "Monitor", "description": "Complete Microsoft 365 and Azure management and optimization."},
        {"title": "Automation Suite", "href": "/solutions/automation-suite", "icon": "Settings", "description": "AI-powered patch management, vulnerability remediation, and security automation."},
        {"title": "Systems Management", "href": "/solutions/systems-management", "icon": "Settings", "description": "Proactive monitoring, patching, and performance management."},
        {"title": "IBM Power VS", "href": "/solutions/ibm-power-vs", "icon": "Cpu", "description": "IBM Power Virtual Server management in the cloud."}
      ]
    }
  ]
}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'solutions';

-- ═════════════════════════════════════════════════════════════════════════
-- PART 5: ALL SOLUTION SUBPAGE SECTIONS
-- ═════════════════════════════════════════════════════════════════════════
-- Each solution page has: hero, features, process, benefits, cta

-- ─── Managed Cloud Hosting ───────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"Managed Cloud Hosting","subheadline":"Enterprise-grade cloud hosting with 24/7 proactive monitoring, Tier-3 data centers, and dedicated support."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'managed-cloud-hosting';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Monitor","title":"24/7 Proactive Monitoring","description":"Round-the-clock infrastructure monitoring with automated alerting and rapid incident response."},
  {"icon":"Server","title":"Tier-3 Data Centers","description":"SOC 1-SSAE 18 certified facilities with redundant power, cooling, and multiple network carriers."},
  {"icon":"Database","title":"Redundant Infrastructure","description":"Geographically separated data centers with automatic failover and data replication."},
  {"icon":"Zap","title":"Scalable Resources","description":"Instantly scale compute, storage, and bandwidth to match your workload demands."},
  {"icon":"Users","title":"Dedicated Support Team","description":"Named account managers and certified engineers who know your environment."},
  {"icon":"Lock","title":"Multi-Tenant Isolation","description":"Complete workload isolation with dedicated resources and network segmentation."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'managed-cloud-hosting';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Assessment","description":"We analyze your current infrastructure, workloads, and requirements to design the optimal cloud architecture."},
  {"step":"02","title":"Provisioning","description":"Our engineers build your dedicated cloud environment with all required compute, storage, and networking."},
  {"step":"03","title":"Migration","description":"We execute a carefully planned migration with zero downtime and full data integrity verification."},
  {"step":"04","title":"Management","description":"24/7 proactive monitoring, patching, optimization, and support from our certified team."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'managed-cloud-hosting';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["Reduce infrastructure costs by over 50% on average over 3 years","Save over 70% of time spent on infrastructure management","Guaranteed uptime at Tier-3 data centers","IBM Power and x86 environments with Flash Systems Storage","Automatic failover to geographically separated backup data centers","PCI, HIPAA, SOX, and GDPR compliant infrastructure"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'managed-cloud-hosting';

-- ─── Managed Private Cloud ───────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"Managed Private Cloud","subheadline":"Dedicated private cloud environments with complete isolation, custom configurations, and enterprise SLAs."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'managed-private-cloud';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Lock","title":"Single-Tenant Isolation","description":"Complete physical and logical separation from other tenants for maximum security."},
  {"icon":"Settings","title":"Custom Configurations","description":"Tailored compute, storage, and networking configurations for your specific requirements."},
  {"icon":"ShieldCheck","title":"Compliance Ready","description":"Pre-configured for ISO 27001, SOC 2, HIPAA, PCI-DSS, and GDPR compliance."},
  {"icon":"Server","title":"Dedicated Resources","description":"Guaranteed compute, memory, and storage resources with no noisy neighbors."},
  {"icon":"Monitor","title":"Full Root Access & Control","description":"Complete administrative control over your private cloud environment."},
  {"icon":"Award","title":"Enterprise SLA","description":"99.99% uptime guarantee with financially-backed SLAs."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'managed-private-cloud';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Requirements Analysis","description":"Deep dive into your workloads, compliance needs, and performance requirements."},
  {"step":"02","title":"Architecture Design","description":"Custom architecture designed for your specific security and performance needs."},
  {"step":"03","title":"Build & Deploy","description":"We build and rigorously test your private cloud environment before going live."},
  {"step":"04","title":"Managed Operations","description":"Full lifecycle management including monitoring, patching, and optimization."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'managed-private-cloud';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["Complete physical and logical isolation for maximum security","ISO 27001, SOC 2, HIPAA, PCI-DSS, GDPR, NIST-800-53 compliance ready","40% lower TCO compared to building your own private cloud","70% reduction in IT management time","Full administrative control with root access","Support for any workload including legacy applications"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'managed-private-cloud';

-- ─── Managed Hybrid Cloud ────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"Managed Hybrid Cloud","subheadline":"Seamlessly bridge on-premises and cloud infrastructure with unified management and security."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'managed-hybrid-cloud';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Layers","title":"Unified Management","description":"Single pane of glass for managing on-premises and cloud resources."},
  {"icon":"RefreshCw","title":"Workload Portability","description":"Move workloads between on-premises and cloud environments seamlessly."},
  {"icon":"Lock","title":"Consistent Security","description":"Unified security policies across all environments."},
  {"icon":"Zap","title":"Elastic Scaling","description":"Burst to cloud during peak demand while keeping steady-state on-premises."},
  {"icon":"Database","title":"Multi-Platform Integration","description":"Connect IBM Power, x86, and cloud-native platforms."},
  {"icon":"Monitor","title":"Single Pane of Glass","description":"Unified monitoring and management dashboard across all environments."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'managed-hybrid-cloud';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Connect","description":"Establish secure connectivity between your on-premises and cloud environments."},
  {"step":"02","title":"Orchestrate","description":"Implement workload orchestration and automation across environments."},
  {"step":"03","title":"Optimize","description":"Continuously optimize placement and costs across your hybrid infrastructure."},
  {"step":"04","title":"Manage","description":"24/7 management and monitoring of your entire hybrid environment."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'managed-hybrid-cloud';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["Extend on-premises investments into the cloud","Optimize costs by placing workloads in the most efficient environment","Maintain data sovereignty with flexible deployment options","Scale instantly during demand spikes","Unified compliance across all environments","Reduce vendor lock-in with multi-cloud support"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'managed-hybrid-cloud';

-- ─── Cloud Migration ─────────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"Cloud Migration Services","subheadline":"Expert-led cloud migration with zero downtime, proven methodology from 730+ successful projects."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'cloud-migration';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Zap","title":"Zero Downtime","description":"Migrations executed with zero downtime using proven live-migration techniques."},
  {"icon":"CheckCircle","title":"Proven Methodology","description":"730+ successful migrations with a structured, repeatable process."},
  {"icon":"Server","title":"Any Workload","description":"IBM i, AIX, Linux, Windows — we migrate any enterprise workload."},
  {"icon":"Shield","title":"Risk Mitigation","description":"Comprehensive rollback plans and data integrity verification at every step."},
  {"icon":"BarChart3","title":"Cost Optimization","description":"Right-size your cloud environment for 40-60% infrastructure cost reduction."},
  {"icon":"Users","title":"Post-Migration Support","description":"Dedicated support team for optimization and troubleshooting after migration."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'cloud-migration';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Discover & Assess","description":"Comprehensive assessment of your current environment, dependencies, and requirements."},
  {"step":"02","title":"Plan & Architect","description":"Custom migration plan with target architecture, timeline, and risk mitigation."},
  {"step":"03","title":"Migrate & Validate","description":"Execute migration with real-time monitoring and full data integrity checks."},
  {"step":"04","title":"Optimize & Support","description":"Post-migration optimization, monitoring, and ongoing managed support."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'cloud-migration';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["3x faster deployments and 40% fewer post-migration problems","Zero data loss with comprehensive validation","40-60% infrastructure cost reduction","HIPAA, PCI-DSS, SOC II, GDPR compliance maintained throughout","730+ successful migrations across all platforms","Dedicated post-migration support and optimization"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'cloud-migration';

-- ─── Backup as a Service ─────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"Backup as a Service","subheadline":"Automated, encrypted enterprise backup with rapid restore and immutable storage."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'backup-as-a-service';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Clock","title":"Automated Scheduling","description":"Set-and-forget backup policies with configurable schedules and retention."},
  {"icon":"Lock","title":"End-to-End Encryption","description":"AES-256 encryption at rest and in transit for all backup data."},
  {"icon":"Zap","title":"Rapid Restore","description":"Instant restore capabilities with granular recovery options."},
  {"icon":"Server","title":"Multi-Platform Support","description":"IBM i, AIX, Linux, Windows — all platforms under one backup umbrella."},
  {"icon":"HardDrive","title":"Immutable & Tape Archive","description":"Immutable backups plus monthly tape archiving for long-term retention."},
  {"icon":"Monitor","title":"Self-Service Portal","description":"Web-based portal for backup monitoring, reporting, and restore requests."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'backup-as-a-service';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Assessment","description":"Evaluate your data, RPO/RTO requirements, and compliance needs."},
  {"step":"02","title":"Configuration","description":"Design and configure backup policies tailored to your environment."},
  {"step":"03","title":"Automation","description":"Deploy automated backup agents and verify successful operation."},
  {"step":"04","title":"Monitoring & Management","description":"24/7 monitoring with proactive issue resolution and regular testing."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'backup-as-a-service';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["Eliminate data loss with immutable, verified backups","Reduce RTO with instant restore capabilities","Pay-as-you-grow pricing with no upfront costs","Meet compliance requirements for data retention","Free your IT team from manual backup management","Monthly tape archiving for long-term data protection"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'backup-as-a-service';

-- ─── Disaster Recovery ───────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"Disaster Recovery as a Service","subheadline":"Business continuity with guaranteed RTOs/RPOs, automated failover, and geographic redundancy."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'disaster-recovery';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Clock","title":"Guaranteed RTO / RPO","description":"Financially-backed recovery time and recovery point objectives."},
  {"icon":"Globe","title":"Geographic Redundancy","description":"Geographically separated data centers for maximum resilience."},
  {"icon":"Zap","title":"Automated Failover","description":"Automatic failover and failback with minimal manual intervention."},
  {"icon":"CheckCircle","title":"Automated Testing","description":"Regular automated DR testing and validation without impacting production."},
  {"icon":"FileText","title":"Comprehensive Documentation","description":"Detailed runbooks, escalation procedures, and recovery documentation."},
  {"icon":"Users","title":"24/7 DR Operations Team","description":"Dedicated disaster recovery specialists available around the clock."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'disaster-recovery';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Discovery & Planning","description":"Identify critical systems, define RTOs/RPOs, and create a comprehensive DR strategy."},
  {"step":"02","title":"Infrastructure Build-Out","description":"Deploy and configure DR infrastructure at geographically separated sites."},
  {"step":"03","title":"Runbook Development","description":"Create detailed recovery runbooks and escalation procedures."},
  {"step":"04","title":"Testing & Validation","description":"Regular testing cycles to ensure recovery readiness and SLA compliance."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'disaster-recovery';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["Keep revenue-generating systems operational through any disruption","ISO 27001, SOC 2, HIPAA, PCI-DSS, and GDPR compliant DR infrastructure","Real-time data replication with instant failover capabilities","Automated testing ensures recovery readiness at all times","Monthly subscription model eliminates large capital expenditures","Certified engineers handle every aspect of DR execution"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'disaster-recovery';

-- ─── High Availability ───────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"High Availability as a Service","subheadline":"Real-time replication with automatic failover targeting 99.999% uptime."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'high-availability';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"RefreshCw","title":"Real-Time Replication","description":"Continuous data replication with sub-second latency."},
  {"icon":"Zap","title":"Automatic Failover","description":"Seamless automatic failover with no manual intervention required."},
  {"icon":"Clock","title":"Minutes-Range RPO","description":"Recovery point objectives of 5-10 minutes with Storwize Flash System SAN."},
  {"icon":"Server","title":"Multi-Platform HA","description":"High availability for IBM i, AIX, Linux, and Windows platforms."},
  {"icon":"Database","title":"Application-Aware","description":"Application-consistent snapshots and replication for database workloads."},
  {"icon":"Monitor","title":"Monitoring Dashboard","description":"Real-time monitoring of replication health, lag, and failover readiness."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'high-availability';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Replicate","description":"Configure real-time data replication between production and standby systems."},
  {"step":"02","title":"Monitor","description":"Continuous monitoring of replication health and performance metrics."},
  {"step":"03","title":"Failover","description":"Automatic or manual failover with minimal data loss and downtime."},
  {"step":"04","title":"Recover","description":"Rapid recovery and failback to production with full data integrity."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'high-availability';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["RPO of 5-10 minutes with IBM Storwize Flash System SAN","30-minute RTO for critical systems","99.999% uptime target with financially-backed SLA","24/7/365 monitoring and management","Multi-platform support across all major operating systems","IBM Storwize Flash System SAN for maximum performance"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'high-availability';

-- ─── Ransomware Recovery ─────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"Ransomware Recovery","subheadline":"Immutable backups, air-gapped storage, and clean room recovery to restore operations fast."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'ransomware-recovery';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Lock","title":"Immutable Backups","description":"Write-once, read-many backups that cannot be encrypted or deleted by ransomware."},
  {"icon":"Shield","title":"Air-Gapped Storage","description":"Physically isolated backup copies inaccessible from the production network."},
  {"icon":"Server","title":"Clean Room Recovery","description":"Isolated recovery environment to restore systems without risk of reinfection."},
  {"icon":"Eye","title":"Threat Scanning","description":"Pre-restore scanning to verify backup integrity and detect dormant threats."},
  {"icon":"Database","title":"Cyber Vault Technology","description":"Automated data vaulting with integrity verification and anomaly detection."},
  {"icon":"Zap","title":"Rapid Restoration","description":"Orchestrated recovery workflows for fast, reliable system restoration."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'ransomware-recovery';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Prevention","description":"Implement immutable backups, air-gapped storage, and cyber vault technology."},
  {"step":"02","title":"Detection","description":"Continuous monitoring for anomalies, encryption attempts, and suspicious activity."},
  {"step":"03","title":"Isolation","description":"Immediate isolation of affected systems to contain the ransomware spread."},
  {"step":"04","title":"Recovery","description":"Clean room recovery from verified, immutable backups with full validation."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'ransomware-recovery';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["Immutable and air-gapped backups guarantee clean restore points","Clean room recovery prevents reinfection during restoration","70% cost reduction compared to unprepared organizations","Proactive threat scanning detects dormant threats before restore","ISO 27001, SOC 1 & 2, HIPAA, PCI-DSS, GDPR, NIST-800-53 compliant","24/7 incident response team with regular recovery drills"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'ransomware-recovery';

-- ─── IBM i Security ──────────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"IBM i Security","subheadline":"Comprehensive security assessments, exit point monitoring, and compliance hardening for IBM i environments."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'ibm-i-security';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Eye","title":"Security Assessments","description":"Comprehensive IBM i security assessments covering all attack vectors."},
  {"icon":"Shield","title":"Exit Point Monitoring","description":"Monitor and control all network exit points on your IBM i systems."},
  {"icon":"Users","title":"User Profile Management","description":"Audit and optimize user profiles, authorities, and access controls."},
  {"icon":"Lock","title":"Object Authority Auditing","description":"Deep analysis of object-level authorities and permissions."},
  {"icon":"FileText","title":"Compliance Reporting","description":"Automated compliance reports for regulatory audits and assessments."},
  {"icon":"ShieldCheck","title":"Vulnerability Scanning & MFA","description":"Regular vulnerability scans with multi-factor authentication enforcement."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'ibm-i-security';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Discovery & Assessment","description":"Comprehensive scan of your IBM i security posture, user profiles, and configurations."},
  {"step":"02","title":"Gap Analysis","description":"Identify security gaps against compliance frameworks and best practices."},
  {"step":"03","title":"Hardening & Remediation","description":"Implement security controls, lock down exit points, and enforce MFA."},
  {"step":"04","title":"Ongoing Monitoring","description":"Continuous monitoring, alerting, and regular reassessments."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'ibm-i-security';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["Reduce risk of data breaches on mission-critical IBM i systems","Achieve ISO 27001, SOC 1 & 2, HIPAA, PCI-DSS, GDPR, and NIST-800-53 compliance","SIEM-ready integration for centralized security event management","MFA and SecureShell lockdown for access point protection","Automated audit trails for regulatory requirements","Expert guidance from certified IBM i security specialists"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'ibm-i-security';

-- ─── Protection Suite ────────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"Protection Suite","subheadline":"Multi-layered endpoint and network protection with automated response and unified management."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'protection-suite';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Shield","title":"Endpoint Protection","description":"Next-gen antivirus with behavioral analysis and machine learning."},
  {"icon":"Lock","title":"Network Security","description":"Network-level threat prevention, segmentation, and monitoring."},
  {"icon":"Mail","title":"Email Filtering","description":"Advanced email security with anti-phishing and attachment scanning."},
  {"icon":"Globe","title":"Web Security","description":"Web filtering and secure DNS to block malicious sites and downloads."},
  {"icon":"Monitor","title":"Unified Management","description":"Single console for managing all security layers across your environment."},
  {"icon":"Zap","title":"Automated Response","description":"SOAR-powered automated response to contain threats in real time."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'protection-suite';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Unified Threat Management","description":"Deploy multi-layered protection across endpoints, network, email, and web."},
  {"step":"02","title":"Real-Time Intelligence","description":"Continuous threat intelligence feeds keep defenses current."},
  {"step":"03","title":"Automated Enforcement","description":"Automated policy enforcement and threat response across all layers."},
  {"step":"04","title":"Continuous Optimization","description":"Regular tuning and optimization based on threat landscape changes."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'protection-suite';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["Multi-cloud protection covering Microsoft 365, AWS, Google Cloud, SharePoint, and Salesforce","500,000+ automation scripts for rapid threat containment","Faster incident response with SOAR-powered automation","Real-time threat intelligence from global security feeds","Compliance reporting across all protection layers","Scalable cloud-native architecture that grows with you"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'protection-suite';

-- ─── Security Monitoring ─────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"Security Monitoring","subheadline":"24/7 SOC monitoring with SIEM integration, real-time alerting, and expert incident response."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'security-monitoring';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Eye","title":"24/7 SOC","description":"Around-the-clock security operations center staffed by certified analysts."},
  {"icon":"Database","title":"SIEM Integration","description":"Full SIEM deployment with log aggregation, correlation, and analysis."},
  {"icon":"Zap","title":"Real-Time Alerting","description":"Immediate alerts on critical security events with priority-based escalation."},
  {"icon":"Globe","title":"Threat Intelligence","description":"Global threat intelligence feeds for proactive threat identification."},
  {"icon":"FileText","title":"Compliance Monitoring","description":"Continuous compliance monitoring and automated reporting."},
  {"icon":"Shield","title":"Incident Response","description":"Expert incident response team for rapid threat containment and remediation."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'security-monitoring';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Collect","description":"Aggregate logs and events from all infrastructure, applications, and security tools."},
  {"step":"02","title":"Correlate","description":"Advanced correlation rules identify real threats from noise."},
  {"step":"03","title":"Detect","description":"Machine learning and behavioral analysis detect known and unknown threats."},
  {"step":"04","title":"Respond","description":"Expert analysts investigate, contain, and remediate security incidents."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'security-monitoring';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["Detect threats before they become breaches","Reduce alert fatigue with expert-curated alerting","Meet compliance monitoring requirements across frameworks","Complete visibility across hybrid environments","Expert security analysts without building an in-house SOC","Continuous threat hunting for advanced persistent threats"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'security-monitoring';

-- ─── Threat Detection & Response ─────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"Threat Detection & Response","subheadline":"AI-driven threat detection with behavioral analysis, proactive hunting, and automated containment."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'threat-detection';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Cpu","title":"AI-Driven Detection","description":"Machine learning models that identify threats traditional tools miss."},
  {"icon":"Users","title":"Behavioral Analysis","description":"User and entity behavior analytics (UEBA) to detect insider threats and anomalies."},
  {"icon":"Zap","title":"Automated Containment","description":"Automated threat containment to limit blast radius in seconds."},
  {"icon":"Eye","title":"Proactive Threat Hunting","description":"Continuous proactive hunting for advanced threats and APTs."},
  {"icon":"FileText","title":"Forensic Investigation","description":"Deep forensic analysis for incident understanding and evidence preservation."},
  {"icon":"Shield","title":"Incident Response","description":"Structured incident response with MITRE ATT&CK framework mapping."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'threat-detection';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Detect","description":"AI-powered detection identifies threats across endpoints, network, and cloud."},
  {"step":"02","title":"Investigate","description":"Automated enrichment and analyst investigation to understand the full scope."},
  {"step":"03","title":"Respond","description":"Coordinated containment and remediation to neutralize the threat."},
  {"step":"04","title":"Improve","description":"Post-incident review and detection tuning for continuous improvement."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'threat-detection';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["24/7 managed detection and response with AI-powered analytics","Full stack visibility across endpoints, network, cloud, and identity","Continuous improvement through feedback loops and detection tuning","Proactive threat hunting reduces attacker dwell time","Structured incident response aligned with MITRE ATT&CK framework","Expert analysts augment your team without hiring overhead"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'threat-detection';

-- ─── Endpoint Security ───────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"Endpoint Security","subheadline":"AI-powered endpoint protection with device management, patch automation, and zero-trust verification."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'endpoint-security';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Cpu","title":"AI Threat Prevention","description":"AI-powered threat prevention that stops attacks before execution."},
  {"icon":"Monitor","title":"Device Management","description":"Unified endpoint management across desktops, laptops, servers, and mobile."},
  {"icon":"RefreshCw","title":"Patch Management","description":"Automated patch deployment across all operating systems."},
  {"icon":"Lock","title":"Application Control","description":"Whitelist/blacklist application control with privilege management."},
  {"icon":"ShieldCheck","title":"Zero-Trust Verification","description":"Continuous endpoint posture verification for zero-trust access."},
  {"icon":"Phone","title":"Mobile Support","description":"Full endpoint protection for iOS and Android devices."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'endpoint-security';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Endpoint Assessment","description":"Discover and inventory all endpoints across your organization."},
  {"step":"02","title":"Policy Design","description":"Design security policies tailored to your risk profile and compliance needs."},
  {"step":"03","title":"Agent Deployment","description":"Deploy and configure endpoint agents across all devices."},
  {"step":"04","title":"Continuous Protection","description":"24/7 monitoring, automated response, and continuous policy optimization."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'endpoint-security';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["AI-powered EDR stops threats before execution","Continuous endpoint posture verification for zero-trust compliance","Automated patching in hours instead of weeks","Unified management across Windows, macOS, Linux, iOS, and Android","Full EDR with behavioral detection and forensic analysis","Cloud-native compliance dashboards for audit readiness"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'endpoint-security';

-- ─── Managed Microsoft Services ──────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"Managed Microsoft Services","subheadline":"Complete Microsoft 365 and Azure management, optimization, and security."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'managed-microsoft';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Monitor","title":"Microsoft 365 Management","description":"Complete administration of Exchange, Teams, SharePoint, and OneDrive."},
  {"icon":"Cloud","title":"Azure Infrastructure","description":"Azure VM, networking, storage, and identity management."},
  {"icon":"Mail","title":"Exchange Administration","description":"Mailbox management, mail flow rules, and hybrid Exchange configurations."},
  {"icon":"Users","title":"Teams Optimization","description":"Teams governance, voice configuration, and adoption optimization."},
  {"icon":"FileText","title":"License Management","description":"License optimization to eliminate waste and reduce costs."},
  {"icon":"Shield","title":"Security & Compliance","description":"Microsoft Defender, Intune, and compliance center management."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'managed-microsoft';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Assessment & Discovery","description":"Audit your current Microsoft environment, licenses, and configurations."},
  {"step":"02","title":"Architecture & Planning","description":"Design optimal architecture for security, compliance, and performance."},
  {"step":"03","title":"Migration & Deployment","description":"Zero-downtime migration and deployment with proven methodology."},
  {"step":"04","title":"Ongoing Management","description":"24/7 management, optimization, and support from Microsoft-certified engineers."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'managed-microsoft';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["Up to 38% cost savings through license optimization and right-sizing","Prevent misconfigurations that cause 60% of cloud security incidents","Dedicated Microsoft-certified engineers who know your environment","Seamless hybrid integration bridging on-premises and cloud","Zero-downtime migrations with proven methodology and rollback protection","Continuous compliance monitoring aligned with industry regulations"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'managed-microsoft';

-- ─── Automation Suite ────────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"Enterprise Automation Suite","subheadline":"AI-powered patch management, vulnerability remediation, and security automation."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'automation-suite';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Cpu","title":"AI-Powered Automation","description":"Machine learning prioritizes patches and remediations by risk."},
  {"icon":"RefreshCw","title":"Patch Automation","description":"Automated patching across 100+ operating systems and applications."},
  {"icon":"Shield","title":"Vulnerability Management","description":"Continuous vulnerability scanning with automated remediation workflows."},
  {"icon":"Lock","title":"Endpoint Security Automation","description":"Automated security policy enforcement across all endpoints."},
  {"icon":"Cloud","title":"Cloud Gateway Protection","description":"Secure cloud access with automated threat prevention."},
  {"icon":"BarChart3","title":"Analytics Dashboard","description":"Real-time dashboards for patch compliance, vulnerabilities, and automation metrics."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'automation-suite';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Assess","description":"Scan your environment for vulnerabilities, missing patches, and configuration issues."},
  {"step":"02","title":"Automate","description":"Deploy automated patch and remediation workflows with approval gates."},
  {"step":"03","title":"Optimize","description":"AI continuously optimizes automation rules based on results and risk."},
  {"step":"04","title":"Scale","description":"Extend automation across your entire infrastructure as needs grow."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'automation-suite';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["50% reduction in downtime from automated patching","100+ operating systems supported under one automation platform","Automated security enforcement across all endpoints","Full audit trail for compliance requirements","AI-powered prioritization focuses on highest-risk items first","Intelligent exception handling prevents automation failures"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'automation-suite';

-- ─── Systems Management ──────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"Proactive Systems Management","subheadline":"24/7 monitoring, automated patching, performance management, and expert support."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'systems-management';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Monitor","title":"24/7 Monitoring","description":"Round-the-clock infrastructure monitoring with intelligent alerting."},
  {"icon":"RefreshCw","title":"Automated Patching","description":"Automated patching for IBM i, AIX, Linux, and Windows systems."},
  {"icon":"BarChart3","title":"Performance Management","description":"Proactive performance tuning and capacity optimization."},
  {"icon":"Database","title":"Capacity Planning","description":"Predictive capacity planning to stay ahead of growth."},
  {"icon":"Eye","title":"Health Dashboards","description":"Real-time health dashboards with trend analysis and reporting."},
  {"icon":"Users","title":"Expert Support","description":"Certified engineers available 24/7 for escalations and guidance."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'systems-management';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Monitor","description":"Continuous monitoring of all systems, applications, and infrastructure."},
  {"step":"02","title":"Detect & Alert","description":"Intelligent alerting with automated escalation and triage."},
  {"step":"03","title":"Remediate","description":"Automated and manual remediation of issues before they impact users."},
  {"step":"04","title":"Optimize","description":"Regular optimization reviews and capacity planning sessions."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'systems-management';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["100% uptime commitment for managed systems","40% reduction in IT support costs","Proactive patching and predictive analytics prevent issues","Certified engineers available 24/7/365","Multi-platform coverage across IBM i, AIX, Linux, and Windows","Monthly trend reviews and capacity planning"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'systems-management';

-- ─── IBM Power VS ────────────────────────────────────────────────────────

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'hero', 'hero', '{"headline":"IBM Power VS","subheadline":"IBM Power Virtual Server management with flexible pricing, hybrid integration, and 35+ years of expertise."}'::jsonb, 0, true
FROM pages p WHERE p.slug = 'ibm-power-vs';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'features', 'features', '{"items":[
  {"icon":"Cloud","title":"Cloud-Based Power","description":"IBM Power Systems in the cloud with enterprise reliability."},
  {"icon":"Server","title":"IBM i & AIX Support","description":"Full support for IBM i and AIX workloads in Power VS."},
  {"icon":"Zap","title":"Flexible Pricing","description":"Pay-as-you-go pricing eliminates large capital expenditures."},
  {"icon":"Settings","title":"Managed Operations","description":"Full lifecycle management from provisioning to optimization."},
  {"icon":"Layers","title":"Hybrid Integration","description":"Seamless integration between on-premises Power and cloud."},
  {"icon":"Award","title":"35+ Years Expertise","description":"IBM Business Partner since 1990 with deep Power Systems knowledge."}
]}'::jsonb, 1, true
FROM pages p WHERE p.slug = 'ibm-power-vs';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'process', 'process', '{"items":[
  {"step":"01","title":"Discovery & Planning","description":"Assess your Power Systems workloads and design the optimal Power VS architecture."},
  {"step":"02","title":"Environment Provisioning","description":"Provision and configure your Power VS environment with all required resources."},
  {"step":"03","title":"Migration & Testing","description":"Migrate workloads with comprehensive testing and validation."},
  {"step":"04","title":"Managed Operations","description":"24/7 management, monitoring, and optimization of your Power VS environment."}
]}'::jsonb, 2, true
FROM pages p WHERE p.slug = 'ibm-power-vs';

INSERT INTO page_sections (page_id, section_key, section_type, content, sort_order, is_visible)
SELECT p.id, 'benefits', 'benefits', '{"items":["IBM Business Partner since 1990 with 35+ years of Power Systems expertise","40% cost savings compared to on-premises Power Systems","15x faster provisioning compared to traditional hardware procurement","70% infrastructure footprint reduction","50% faster disaster recovery with 80% lower DR costs","Pay-as-you-go eliminates capital expenditures"]}'::jsonb, 3, true
FROM pages p WHERE p.slug = 'ibm-power-vs';
