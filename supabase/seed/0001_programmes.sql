-- Seed the five programmes already researched by the Valencia team.
-- These are inserted as already-approved and published, they did not
-- come through the public submission flow, so there is nothing to
-- reconcile in the `submissions` table.

with inserted as (
  insert into programmes (
    university, country, city, programme_name, programme_type, target_group,
    degree_level, coverage, estimated_opening, estimated_deadline, academic_year,
    language, main_eligibility, required_documents, status, website, contact, notes,
    is_published, last_verified_at
  ) values
  (
    'Universitat Autònoma de Barcelona', 'Spain', 'Barcelona',
    '#UABRefugi Palestine Scholarship', 'Scholarship',
    'Palestinian students affected by conflict',
    array['Bachelor', 'Master''s', 'PhD'],
    '100% tuition, visa, travel, accommodation, EUR 1,100/month, insurance, language courses, mentoring',
    'July (estimated)', 'Aug-Sep (estimated)', '2027-2028',
    'Spanish or English depending on programme',
    'Palestinian nationality; meet admission requirements; non-EU nationality',
    'Passport, transcripts, degree, CV, motivation letter, self-assessment, declaration, language certificate (recommended)',
    'expected',
    'https://www.uab.cat/web/refugi/becas-1345876533936.html',
    'fas.refugi@uab.cat',
    'Top recommendation. One of Spain''s most comprehensive programmes for Palestinian students.',
    true, current_date
  ),
  (
    'University of Burgos', 'Spain', 'Burgos',
    'UBU-Refuge Programme', 'Admission + Scholarship Support',
    'Applicants for international protection / refugees',
    array['Bachelor', 'Master''s', 'PhD'],
    '100% tuition, Spanish courses, accommodation support, grants, legal & psychological support, mentor',
    'January (estimated)', '15 May (estimated)', '2028-2029',
    'Spanish (B1 recommended)',
    'International protection/refugee profile; academic admission requirements',
    'Passport, application, transcripts, protection documents, financial declaration',
    'expected',
    'https://www.ubu.es/te-interesa/programa-ubu-refugio-curso-20262027-convocatoria-de-acceso-y-admision',
    'centro.cooperacion@ubu.es',
    'Excellent integration programme; flexible documentation requirements.',
    true, current_date
  ),
  (
    'Universitat de València', 'Spain', 'Valencia',
    'International Refuge Plan', 'Refuge Scholarship',
    'Previous beneficiaries only (2026 call)',
    array['Bachelor', 'Master''s'],
    'Tuition, accommodation, meals, insurance, EUR 2,000 allowance',
    'Monitor 2027', 'TBD', '2027-2028',
    'Spanish',
    '2026 call restricted to renewal beneficiaries only',
    'Not applicable for new applicants in 2026',
    'renewal_only',
    'https://www.uv.es/uvcooperacio',
    'coop@uv.es',
    '2026 call only funds renewal scholarships. Monitor future calls in case new places reopen.',
    true, current_date
  ),
  (
    'Universitat Pompeu Fabra (UPF)', 'Spain', 'Barcelona',
    'UPF Solidària - Refuge Fund for Palestinian Students', 'Scholarship',
    'Palestinian students (priority to Gaza residents) with refugee/international protection status',
    array['Bachelor', 'Master''s', 'PhD'],
    'Full tuition waiver; up to EUR 600/month (max. 12 months); university residence; laptop loan; Catalan courses; psychological support; mentoring; legal clinic support. Travel and visa NOT covered.',
    'June-July (estimated)', 'July (10 working days, estimated)', '2027-2028',
    'Catalan / Spanish / English documentation accepted',
    'Palestinian nationality; admitted or pre-enrolled in an official UPF programme; refugee/protection or similar humanitarian status; enrolment in at least 50% of credits; no equivalent Spanish degree',
    'Passport; application form; motivation letter; proof of vulnerability/protection status; academic documents; supporting evidence',
    'expected',
    'https://www.upf.edu/web/upfsolidaria/fons-refugi',
    'UPF Solidària',
    'Excellent opportunity. Covers tuition, residence and living allowance but not travel or visa. Priority for Gaza residents.',
    true, current_date
  ),
  (
    'SAID Foundation', 'UK', null,
    'SAID Foundation Scholarship', null, null,
    array['Master''s'],
    null,
    '1 September 2026', '30 October 2026', '2027-2028',
    null, null, null,
    'monitor',
    'https://saidfoundation.org/apply/',
    null, null,
    true, current_date
  )
  returning id, university
)
insert into internal_assessments (programme_id, funding_score, fit_score, success_probability, recommended_action)
select id, scores.funding, scores.fit, scores.success, scores.action
from inserted
join (
  values
    ('Universitat Autònoma de Barcelona', 5, 5, 4, 'APPLY'),
    ('University of Burgos', 4, 4, 4, 'APPLY'),
    ('Universitat de València', 4, 2, 1, 'MONITOR'),
    ('Universitat Pompeu Fabra (UPF)', 4, 5, 4, 'APPLY')
) as scores(university, funding, fit, success, action)
on scores.university = inserted.university;
