-- Seed an admin-editable AS400 solution page and navigation entry.
-- The page targets the common search spelling "AS400" while explaining
-- the modern AS/400, iSeries, and IBM i platform names naturally.

do $$
declare
  v_page_id uuid;
  v_solutions_nav_id uuid;
begin
  insert into public.pages (
    slug,
    title,
    description,
    meta_title,
    meta_description,
    page_type,
    is_published,
    published_at,
    created_at,
    updated_at
  )
  values (
    'as400',
    'AS400',
    'AS400, AS/400, iSeries, and IBM i hosting, support, security, backup, high availability, disaster recovery, and modernization services.',
    'AS400 Hosting | AS/400 IBM i Cloud Hosting & Support | ICE',
    'AS400 hosting, AS/400 support, IBM i cloud hosting, iSeries managed services, security, backup, HA, and disaster recovery from ICE.',
    'solution',
    true,
    now(),
    now(),
    now()
  )
  on conflict (slug) do update
    set title = excluded.title,
        description = excluded.description,
        meta_title = excluded.meta_title,
        meta_description = excluded.meta_description,
        page_type = excluded.page_type,
        is_published = true,
        published_at = coalesce(public.pages.published_at, now()),
        updated_at = now()
  returning id into v_page_id;

  delete from public.page_sections
  where page_id = v_page_id
    and section_key in (
      'hero',
      'features',
      'process',
      'as400_faq',
      'as400_comparison',
      'benefits',
      'cta',
      'page_seo'
    );

  insert into public.page_sections (
    page_id,
    section_key,
    section_type,
    content,
    sort_order,
    is_visible,
    created_at,
    updated_at
  )
  values
    (
      v_page_id,
      'hero',
      'hero',
      $json$
      {
        "headline": "AS400",
        "subheadline": "AS400 hosting, AS/400 support, iSeries managed services, and IBM i cloud hosting for mission-critical workloads. ICE hosts, secures, backs up, and manages IBM i environments with 24/7 support from an IBM Business Partner since 1990.",
        "category": "Managed Services",
        "category_icon": "Server",
        "hero_image": "/images/solutions/heroes/ibm-i-security.webp",
        "image_alt": "AS400 and IBM i managed infrastructure illustration",
        "proof_labels": [
          "IBM Business Partner since 1990",
          "AS400 and IBM i expertise",
          "24/7 managed operations",
          "SOC 2 Type II"
        ],
        "cta_primary": {
          "label": "Talk to an AS400 Expert",
          "href": "/contact?service=AS400&source=solution_detail"
        }
      }
      $json$::jsonb,
      0,
      true,
      now(),
      now()
    ),
    (
      v_page_id,
      'features',
      'features',
      $json$
      {
        "eyebrow": "AS400 services",
        "heading": "AS400 hosting, IBM i support, security, backup, HA, and DR",
        "description": "A single AS400 partner for the high-intent services buyers search for: hosting, support, modernization, security, backup, high availability, and disaster recovery.",
        "items": [
          {
            "icon": "Server",
            "title": "AS400 hosting and IBM i cloud hosting",
            "description": "Move AS400, AS/400, iSeries, and IBM i workloads to ICE-managed IBM Power infrastructure with secure connectivity, monitored capacity, and predictable service levels."
          },
          {
            "icon": "Shield",
            "title": "AS400 security hardening",
            "description": "Harden object authority, user access, exit points, audit settings, and monitoring for IBM i environments that support regulated or uptime-sensitive operations."
          },
          {
            "icon": "Database",
            "title": "AS400 backup and restore testing",
            "description": "Protect IBM i data with managed backup policies, encrypted offsite copies, restore testing, and ransomware-aware recovery planning."
          },
          {
            "icon": "Zap",
            "title": "AS400 high availability and disaster recovery",
            "description": "Design replication, failover, RPO/RTO targets, and recovery runbooks for AS/400 and IBM i systems that cannot tolerate extended downtime."
          },
          {
            "icon": "RefreshCw",
            "title": "AS400 migration and modernization",
            "description": "Plan migrations from aging AS/400 hardware, iSeries, and IBM Power environments with dependency mapping, testing, rollback planning, and validated cutover steps."
          },
          {
            "icon": "Monitor",
            "title": "IBM i managed services",
            "description": "Add experienced IBM i administrators for monitoring, PTF planning, performance tuning, capacity planning, reporting, and daily operational ownership."
          }
        ]
      }
      $json$::jsonb,
      1,
      true,
      now(),
      now()
    ),
    (
      v_page_id,
      'process',
      'process',
      $json$
      {
        "eyebrow": "How ICE helps",
        "heading": "From AS400 risk to a managed IBM i roadmap",
        "items": [
          {
            "step": "01",
            "title": "Assess the AS400 environment",
            "description": "We review IBM i release level, hardware lifecycle, LPARs, storage, backups, security posture, users, integrations, dependencies, and uptime requirements."
          },
          {
            "step": "02",
            "title": "Map hosting, security, HA, and DR",
            "description": "ICE designs the right mix of AS400 hosting, IBM i cloud hosting, security hardening, backup, high availability, disaster recovery, and managed services."
          },
          {
            "step": "03",
            "title": "Migrate and validate",
            "description": "We coordinate replication, cutover, testing, access, rollback planning, and business validation around your workload window."
          },
          {
            "step": "04",
            "title": "Operate with specialists",
            "description": "Your AS400 estate is monitored, tuned, protected, and supported by engineers who understand IBM i, IBM Power Systems, and enterprise operations."
          }
        ]
      }
      $json$::jsonb,
      2,
      true,
      now(),
      now()
    ),
    (
      v_page_id,
      'as400_faq',
      'faq',
      $json$
      {
        "eyebrow": "AS400 FAQ",
        "heading": "AS400 questions buyers ask first",
        "items": [
          {
            "question": "What is AS400 called now?",
            "answer": "AS400 is commonly written as AS/400. The platform evolved through iSeries and is now known as IBM i running on IBM Power Systems. Many teams still search for AS400 when they need IBM i hosting, AS/400 support, iSeries managed services, security, backup, or disaster recovery."
          },
          {
            "question": "Does ICE support AS400 and IBM i systems?",
            "answer": "Yes. ICE supports AS400, AS/400, iSeries, IBM i, and IBM Power environments across AS400 hosting, IBM i cloud hosting, security hardening, backup, high availability, disaster recovery, migration, and ongoing operations."
          },
          {
            "question": "Can AS400 workloads move to the cloud?",
            "answer": "Yes. ICE helps organizations move AS400, AS/400, iSeries, and IBM i workloads to managed cloud or hosted IBM Power infrastructure while preserving critical applications, data, access patterns, integrations, and recovery requirements."
          },
          {
            "question": "What AS400 services does ICE provide?",
            "answer": "ICE provides AS400 hosting, AS/400 support, IBM i cloud hosting, iSeries managed services, security assessment and hardening, backup, disaster recovery, high availability, migration planning, monitoring, performance support, and lifecycle support."
          },
          {
            "question": "Who is AS400 hosting best for?",
            "answer": "AS400 hosting is best for organizations that rely on IBM i applications but want to reduce aging hardware risk, improve resilience, add 24/7 operations, strengthen security, or build a tested disaster recovery path without rewriting the application."
          },
          {
            "question": "Can ICE help with AS400 backup and disaster recovery?",
            "answer": "Yes. ICE can design AS400 backup, high availability, and disaster recovery plans with encrypted copies, replication, recovery testing, failover planning, and RPO/RTO targets matched to the workload."
          }
        ]
      }
      $json$::jsonb,
      3,
      true,
      now(),
      now()
    ),
    (
      v_page_id,
      'as400_comparison',
      'comparison',
      $json$
      {
        "eyebrow": "Modernization",
        "heading": "AS400 support without staying stuck on old hardware",
        "description": "ICE helps teams keep trusted AS400 applications while improving IBM i hosting, infrastructure lifecycle, resilience, security, and operational coverage.",
        "before_label": "Aging AS400 estate",
        "after_label": "ICE-managed IBM i platform",
        "rows": [
          {
            "label": "Infrastructure",
            "before": "Aging on-prem hardware and limited refresh options",
            "after": "Managed IBM Power capacity with lifecycle planning"
          },
          {
            "label": "Operations",
            "before": "Knowledge concentrated in a small internal team",
            "after": "24/7 support from IBM i and enterprise infrastructure specialists"
          },
          {
            "label": "Recovery",
            "before": "Backups or DR plans that may not be regularly tested",
            "after": "Managed backup, HA, DR runbooks, and restore validation"
          },
          {
            "label": "Security",
            "before": "Legacy access patterns and audit gaps",
            "after": "IBM i hardening, access review, audit posture, and monitoring"
          }
        ]
      }
      $json$::jsonb,
      4,
      true,
      now(),
      now()
    ),
    (
      v_page_id,
      'benefits',
      'benefits',
      $json$
      {
        "eyebrow": "Business outcomes",
        "heading": "Why teams modernize AS400 with ICE",
        "items": [
          "Keep AS400 applications running without buying and maintaining aging hardware",
          "Improve IBM i security posture with prioritized, auditable controls",
          "Add tested AS400 backup, high availability, and disaster recovery for critical workloads",
          "Get a practical roadmap from AS/400 terminology to modern IBM i cloud hosting and operations"
        ]
      }
      $json$::jsonb,
      5,
      true,
      now(),
      now()
    ),
    (
      v_page_id,
      'cta',
      'cta',
      $json$
      {
        "heading": "Need help with AS400?",
        "description": "Talk with ICE about AS400 hosting, AS/400 support, IBM i cloud hosting, iSeries managed services, security hardening, backup, high availability, or disaster recovery.",
        "cta_primary": {
          "label": "Talk to an AS400 Expert",
          "href": "/contact?service=AS400&source=solution_detail"
        },
        "cta_secondary": {
          "label": "Call 1-800-786-9188",
          "href": "tel:18007869188"
        }
      }
      $json$::jsonb,
      6,
      true,
      now(),
      now()
    ),
    (
      v_page_id,
      'page_seo',
      'seo',
      $json$
      {
        "canonical_url": "/solutions/as400",
        "og_image_url": "/images/solutions/heroes/ibm-i-security.webp",
        "twitter_image_url": "/images/solutions/heroes/ibm-i-security.webp",
        "favicon_url": null
      }
      $json$::jsonb,
      9999,
      false,
      now(),
      now()
    );

  select id
  into v_solutions_nav_id
  from public.navigation_items
  where href = '/solutions'
    and location in ('navbar', 'navbar_top')
  order by sort_order
  limit 1;

  if v_solutions_nav_id is not null then
    delete from public.navigation_items
    where href = '/solutions/as400'
      and location = 'navbar_mega';

    insert into public.navigation_items (
      label,
      href,
      parent_id,
      sort_order,
      is_visible,
      open_in_new_tab,
      icon,
      badge,
      location,
      mega_column_title,
      mega_column_icon,
      created_at,
      updated_at
    )
    values (
      'AS400 Hosting',
      '/solutions/as400',
      v_solutions_nav_id,
      0,
      true,
      false,
      'Server',
      null,
      'navbar_mega',
      'Managed Services',
      'Server',
      now(),
      now()
    );
  end if;
end $$;
